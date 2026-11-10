import { Router } from "express";
import { toApplicationDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import { authorize } from "../middlewares/authorize.ts";
import type { NewApplication } from "../models/application.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { isStudent } from "../services/permissions.ts";
import { HttpError } from "../utils/httpError.ts";

const parsePositiveInteger = (value: unknown, name: string): number => {
  if (
    typeof value !== "string" ||
    !/^[1-9]\d*$/.test(value) ||
    !Number.isSafeInteger(Number(value))
  ) {
    throw new HttpError(400, "INVALID_QUERY", `${name} doit être un entier positif`);
  }
  return Number(value);
};

const parseOptionalAcademicYearId = (value: unknown): number | undefined => {
  if (value === undefined) return undefined;
  return parsePositiveInteger(value, "academicYearId");
};

const parseApplicationBody = (value: unknown): NewApplication => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new HttpError(400, "INVALID_BODY", "Le corps doit contenir offerId et message facultatif");
  }

  const body = value as Record<string, unknown>;
  if (
    typeof body.offerId !== "number" ||
    !Number.isSafeInteger(body.offerId) ||
    body.offerId <= 0 ||
    (body.message !== undefined && body.message !== null && typeof body.message !== "string")
  ) {
    throw new HttpError(
      400,
      "INVALID_BODY",
      "Le corps doit contenir offerId (entier positif) et message (chaîne facultative)",
    );
  }

  return {
    offerId: body.offerId,
    message: body.message as string | null | undefined,
  };
};

export const createApplicationsRouter = (applicationsService: ApplicationsService) => {
  const router = Router();

  router.use(authorize(isStudent));

  router.post("/", (req, res) => {
    const application = applicationsService.createApplication(
      getCurrentUser(req),
      parseApplicationBody(req.body),
    );
    res.status(201).json(toApplicationDto(application));
  });

  router.get("/me", (req, res) => {
    const applications = applicationsService.listApplications(
      getCurrentUser(req),
      parseOptionalAcademicYearId(req.query.academicYearId),
    );
    res.json(applications.map(toApplicationDto));
  });

  router.delete("/:id", (req, res) => {
    const application = applicationsService.withdrawApplication(
      getCurrentUser(req),
      parsePositiveInteger(req.params.id, "id"),
    );
    res.json(toApplicationDto(application));
  });

  return router;
};
