import { toApplication } from "../mappers/application.mapper.ts";
import type { Application, NewApplication } from "../models/application.ts";
import type { User } from "../models/user.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { isStudent } from "./permissions.ts";

const MAX_MESSAGE_LENGTH = 500;

const requireStudent = (viewer: User): void => {
  if (!isStudent(viewer)) {
    throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut gérer ses candidatures");
  }
};

const normalizeMessage = (message: NewApplication["message"]): string | null => {
  if (message === undefined || message === null) return null;
  if (typeof message !== "string" || message.length > MAX_MESSAGE_LENGTH) {
    throw new HttpError(
      400,
      "INVALID_MESSAGE",
      `Le message ne peut pas dépasser ${MAX_MESSAGE_LENGTH} caractères`,
    );
  }
  const normalized = message.trim();
  return normalized === "" ? null : normalized;
};

export const createApplicationsService = (repository: ApplicationsRepository) => ({
  listApplications: (viewer: User, academicYearId?: number): Application[] => {
    requireStudent(viewer);
    return repository
      .findAllForStudent({ studentId: viewer.id, academicYearId })
      .map(toApplication);
  },

  createApplication: (viewer: User, input: NewApplication): Application => {
    requireStudent(viewer);
    const offer = repository.findOffer(input.offerId);
    if (offer === undefined) {
      throw new HttpError(404, "OFFER_NOT_FOUND", "Cette offre est introuvable");
    }
    if (offer.status !== "PUBLISHED") {
      throw new HttpError(409, "OFFER_NOT_PUBLISHED", "L'offre n'est pas publiée");
    }
    if (repository.findActiveForStudentOffer(input.offerId, viewer.id) !== undefined) {
      throw new HttpError(409, "APPLICATION_EXISTS", "Vous avez déjà candidaté à cette offre");
    }

    const id = repository.create(input.offerId, viewer.id, normalizeMessage(input.message));
    const application = repository.findByIdForStudent(id, viewer.id);
    if (application === undefined) {
      throw new Error("La candidature créée est introuvable");
    }
    return toApplication(application);
  },

  withdrawApplication: (viewer: User, applicationId: number): Application => {
    requireStudent(viewer);
    const application = repository.findByIdForStudent(applicationId, viewer.id);
    if (application === undefined) {
      throw new HttpError(404, "APPLICATION_NOT_FOUND", "Cette candidature est introuvable");
    }
    if (application.status !== "IN_PROGRESS") {
      throw new HttpError(
        409,
        "APPLICATION_NOT_WITHDRAWABLE",
        "Cette candidature ne peut plus être retirée",
      );
    }
    repository.withdraw(applicationId, viewer.id);
    const withdrawn = repository.findByIdForStudent(applicationId, viewer.id);
    if (withdrawn === undefined) {
      throw new Error("La candidature retirée est introuvable");
    }
    return toApplication(withdrawn);
  },
});

export type ApplicationsService = ReturnType<typeof createApplicationsService>;
