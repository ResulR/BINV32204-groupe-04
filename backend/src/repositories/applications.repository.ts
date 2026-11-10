import type { Db } from "../db/database.ts";
import type { ApplicationDbo, ApplicationStatus } from "../models/application.ts";

interface ApplicationParams {
  offerId: number;
  studentId: number;
  message: string | null;
}

interface StudentApplicationsParams {
  studentId: number;
  academicYearId: number | null;
}

interface OfferParams {
  offerId: number;
}

interface StudentOfferParams {
  offerId: number;
  studentId: number;
}

interface WithdrawalParams {
  id: number;
  studentId: number;
}

interface OfferSummary {
  id: number;
  status: string;
  academic_year_id: number;
}

export const createApplicationsRepository = (db: Db) => {
  const findAllForStudent = db.prepare<StudentApplicationsParams, ApplicationDbo>(`
    SELECT a.id, a.offer_id, a.student_id, a.message, a.status, a.applied_at,
           o.title AS offer_title, c.short_name AS company_short_name,
           ay.id AS academic_year_id, ay.label AS academic_year_label, p.code AS period_code
    FROM applications a
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    JOIN periods p ON p.id = o.period_id
    WHERE a.student_id = @studentId
      AND (@academicYearId IS NULL OR ay.id = @academicYearId)
    ORDER BY a.applied_at DESC, a.id DESC
  `);

  const findByIdForStudent = db.prepare<
    { id: number; studentId: number },
    ApplicationDbo
  >(`
    SELECT a.id, a.offer_id, a.student_id, a.message, a.status, a.applied_at,
           o.title AS offer_title, c.short_name AS company_short_name,
           ay.id AS academic_year_id, ay.label AS academic_year_label, p.code AS period_code
    FROM applications a
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    JOIN periods p ON p.id = o.period_id
    WHERE a.id = @id AND a.student_id = @studentId
  `);

  const findOffer = db.prepare<OfferParams, OfferSummary>(`
    SELECT id, status, academic_year_id
    FROM offers
    WHERE id = @offerId
  `);

  const findActiveForStudentOffer = db.prepare<StudentOfferParams, { status: ApplicationStatus }>(`
    SELECT status
    FROM applications
    WHERE offer_id = @offerId
      AND student_id = @studentId
      AND status <> 'WITHDRAWN'
    LIMIT 1
  `);

  const insert = db.prepare<ApplicationParams>(`
    INSERT INTO applications (offer_id, student_id, message)
    VALUES (@offerId, @studentId, @message)
  `);

  const withdraw = db.prepare<WithdrawalParams>(`
    UPDATE applications
    SET status = 'WITHDRAWN'
    WHERE id = @id AND student_id = @studentId AND status = 'IN_PROGRESS'
  `);

  return {
    findAllForStudent: ({
      studentId,
      academicYearId,
    }: {
      studentId: number;
      academicYearId?: number;
    }): ApplicationDbo[] =>
      findAllForStudent.all({
        studentId,
        academicYearId: academicYearId ?? null,
      }),
    findByIdForStudent: (id: number, studentId: number): ApplicationDbo | undefined =>
      findByIdForStudent.get({ id, studentId }),
    findOffer: (offerId: number): OfferSummary | undefined => findOffer.get({ offerId }),
    findActiveForStudentOffer: (
      offerId: number,
      studentId: number,
    ): { status: ApplicationStatus } | undefined =>
      findActiveForStudentOffer.get({ offerId, studentId }),
    create: (offerId: number, studentId: number, message: string | null): number => {
      const result = insert.run({ offerId, studentId, message });
      return Number(result.lastInsertRowid);
    },
    withdraw: (id: number, studentId: number): boolean =>
      withdraw.run({ id, studentId }).changes === 1,
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
