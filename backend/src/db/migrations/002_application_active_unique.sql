-- Une seule candidature non retirée par étudiant et par offre ; l'historique
-- des candidatures retirées reste conservé et permet une recandidature.
CREATE UNIQUE INDEX applications_one_active_per_student_offer
  ON applications (offer_id, student_id)
  WHERE status <> 'WITHDRAWN';
