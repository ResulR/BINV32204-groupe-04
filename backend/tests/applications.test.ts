import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const studentAuth = (id: number = STUDENT.LUCAS_DUPONT) =>
  ({ Authorization: tokenFor("STUDENT", id) }) as const;

describe("POST /applications", () => {
  it("crée une candidature étudiante avec un message facultatif", async () => {
    const response = await request(app)
      .post("/applications")
      .set(studentAuth(STUDENT.DMYTRO_KOVALENKO))
      .send({ offerId: OFFER.INTERNAL_CHATBOT, message: "Mon message" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      offerId: OFFER.INTERNAL_CHATBOT,
      message: "Mon message",
      status: "IN_PROGRESS",
    });
  });

  it("refuse un corps invalide", async () => {
    const response = await request(app)
      .post("/applications")
      .set(studentAuth())
      .send({ offerId: "1" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_BODY");
  });

  it("refuse un message de plus de 500 caractères", async () => {
    const response = await request(app)
      .post("/applications")
      .set(studentAuth(STUDENT.DMYTRO_KOVALENKO))
      .send({ offerId: OFFER.INTERNAL_CHATBOT, message: "a".repeat(501) });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_MESSAGE");
  });

  it("refuse une candidature sur une offre non publiée", async () => {
    const response = await request(app)
      .post("/applications")
      .set(studentAuth(STUDENT.DMYTRO_KOVALENKO))
      .send({ offerId: OFFER.CLIENT_PORTAL });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("OFFER_NOT_PUBLISHED");
  });

  it("refuse un doublon actif", async () => {
    const response = await request(app)
      .post("/applications")
      .set(studentAuth())
      .send({ offerId: OFFER.FLEET_APP });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_EXISTS");
  });
});

describe("GET /applications/me", () => {
  it("retourne uniquement les candidatures de l'étudiant connecté", async () => {
    const response = await request(app).get("/applications/me").set(studentAuth());

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      offerId: OFFER.FLEET_APP,
      status: "IN_PROGRESS",
    });
  });

  it("filtre les candidatures par année académique", async () => {
    const response = await request(app)
      .get("/applications/me?academicYearId=1")
      .set(studentAuth(STUDENT.INES_HADDAD));

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("refuse un profil non étudiant", async () => {
    const response = await request(app)
      .get("/applications/me")
      .set("Authorization", tokenFor("ADMIN", 1));

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});

describe("DELETE /applications/:id", () => {
  it("retire une candidature en cours sans la supprimer", async () => {
    const response = await request(app)
      .delete("/applications/1")
      .set(studentAuth());

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("WITHDRAWN");

    const list = await request(app).get("/applications/me").set(studentAuth());
    expect(list.body).toHaveLength(1);
    expect(list.body[0].status).toBe("WITHDRAWN");
  });

  it("refuse de retirer la candidature d'un autre étudiant", async () => {
    const response = await request(app)
      .delete("/applications/1")
      .set(studentAuth(STUDENT.INES_HADDAD));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("APPLICATION_NOT_FOUND");
  });

  it("refuse de retirer une candidature déjà traitée", async () => {
    const response = await request(app)
      .delete("/applications/3")
      .set(studentAuth(STUDENT.MATEUSZ_KOWALSKI));

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_NOT_WITHDRAWABLE");
  });
});
