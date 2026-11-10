import { beforeEach, describe, expect, it } from "vitest";
import { createApplicationsRepository } from "../src/repositories/applications.repository.ts";
import { createApplicationsService } from "../src/services/applications.service.ts";
import type { User } from "../src/models/user.ts";
import { OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestDatabase } from "./helpers/testDatabase.ts";
import type { Db } from "../src/db/database.ts";

let db: Db;
let service: ReturnType<typeof createApplicationsService>;

const student: User = {
  kind: "STUDENT",
  id: STUDENT.LUCAS_DUPONT,
  firstName: "Lucas",
  lastName: "Dupont",
  email: "lucas.dupont@student.test",
  roles: [],
  companies: [],
};

const otherUser: User = { ...student, kind: "ADMIN", id: 1 };
const studentById = (id: number): User => ({ ...student, id });

beforeEach(() => {
  db = createTestDatabase();
  service = createApplicationsService(createApplicationsRepository(db));
});

describe("candidatures", () => {
  it("crée une candidature avec un message facultatif normalisé", () => {
    const application = service.createApplication(student, {
      offerId: OFFER.INTERNAL_CHATBOT,
      message: "  Un sujet qui m'intéresse.  ",
    });

    expect(application.message).toBe("Un sujet qui m'intéresse.");
    expect(application.status).toBe("IN_PROGRESS");
    expect(application.offer.id).toBe(OFFER.INTERNAL_CHATBOT);
  });

  it("accepte une candidature sans message", () => {
    expect(
      service.createApplication(student, { offerId: OFFER.DATA_QUALITY }).message,
    ).toBeNull();
  });

  it("refuse un message de plus de 500 caractères", () => {
    expect(() =>
      service.createApplication(student, {
        offerId: OFFER.INTERNAL_CHATBOT,
        message: "a".repeat(501),
      }),
    ).toThrow("500 caractères");
  });

  it("refuse une candidature sur une offre non publiée", () => {
    expect(() =>
      service.createApplication(student, { offerId: OFFER.CLIENT_PORTAL }),
    ).toThrow("pas publiée");
  });

  it("refuse un doublon actif", () => {
    expect(() =>
      service.createApplication(student, { offerId: OFFER.FLEET_APP }),
    ).toThrow("déjà candidaté");
  });

  it("autorise une recandidature après retrait en conservant l'historique", () => {
    const withdrawn = service.withdrawApplication(student, 1);
    expect(withdrawn.status).toBe("WITHDRAWN");

    const replacement = service.createApplication(student, {
      offerId: OFFER.FLEET_APP,
    });
    expect(replacement.status).toBe("IN_PROGRESS");
    expect(service.listApplications(student).filter((item) => item.offerId === OFFER.FLEET_APP))
      .toHaveLength(2);
  });

  it.each([
    ["SELECTED", 3, STUDENT.MATEUSZ_KOWALSKI],
    ["REJECTED", 4, STUDENT.LEA_MERTENS],
    ["WITHDRAWN", 5, STUDENT.INES_HADDAD],
  ] as const)("refuse le retrait d'une candidature %s", (_status, id, studentId) => {
    expect(() => service.withdrawApplication(studentById(studentId), id)).toThrow(
      "ne peut plus être retirée",
    );
  });

  it("liste l'historique d'un étudiant et filtre par année", () => {
    expect(service.listApplications(student)).toHaveLength(1);
    expect(service.listApplications(student, 1)).toHaveLength(0);
    expect(service.listApplications(student, 2)).toHaveLength(1);
  });

  it("refuse la gestion par un non-étudiant", () => {
    expect(() => service.listApplications(otherUser)).toThrow("Seul un étudiant");
    expect(() =>
      service.createApplication(otherUser, { offerId: OFFER.INTERNAL_CHATBOT }),
    ).toThrow("Seul un étudiant");
  });
});
