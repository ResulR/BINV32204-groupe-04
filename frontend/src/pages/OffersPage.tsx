import { useState } from "react";
import ApplicationForm from "../components/ApplicationForm.tsx";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import OfferTable from "../components/OfferTable.tsx";
import { PERIOD_CODES, type PeriodCode } from "../models/offer.ts";
import { useOffers } from "../hooks/useOffers.ts";
import type { User } from "../models/user.ts";
import { PERIOD_LABELS } from "../utils/labels.ts";
import { useApplications } from "../hooks/useApplications.ts";
import { createApplication } from "../services/applications.service.ts";
import type { Offer } from "../models/offer.ts";

interface OffersPageProps {
  user: User;
  token: string;
  onUnauthorized: () => void;
}

const DESCRIPTIONS = {
  ADMIN: "Toutes les offres, tous statuts confondus.",
  STUDENT: "Les offres publiées.",
  CONTACT: "Les offres que vous avez déposées.",
} as const;

const OffersPage = ({ user, token, onUnauthorized }: OffersPageProps) => {
  const [period, setPeriod] = useState<PeriodCode | undefined>(undefined);
  const { offers, isLoading, error } = useOffers(token, period, onUnauthorized);
  const applications = useApplications(token, onUnauthorized, user.kind === "STUDENT");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  const submitApplication = async (message: string) => {
    if (selectedOffer === null) return;
    setIsSubmitting(true);
    setApplicationError(null);
    try {
      await createApplication(token, selectedOffer.id, message.trim());
      await applications.reload();
      setSelectedOffer(null);
    } catch (reason: unknown) {
      setApplicationError(reason instanceof Error ? reason.message : "Candidature impossible");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (isLoading) return <LoadingState />;
    if (offers.length === 0) return <EmptyState message="Aucune offre à afficher." />;
    return (
      <>
        <p className="result-count">
          {offers.length} offre{offers.length > 1 ? "s" : ""}
        </p>
        <OfferTable
          offers={offers}
          applicationOfferIds={
            new Set(
              applications.applications
                .filter((application) => application.status !== "WITHDRAWN")
                .map((application) => application.offerId),
            )
          }
          onApply={user.kind === "STUDENT" ? (offer) => {
            setApplicationError(null);
            setSelectedOffer(offer);
          } : undefined}
        />
      </>
    );
  };

  return (
    <section>
      <h1>Offres de stage</h1>
      <p>{DESCRIPTIONS[user.kind]}</p>
      <label htmlFor="offer-period">Période</label>
      <select
        id="offer-period"
        value={period ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          setPeriod(value === "" ? undefined : (value as PeriodCode));
        }}
      >
        <option value="">Toutes les périodes</option>
        {PERIOD_CODES.map((code) => (
          <option key={code} value={code}>
            {PERIOD_LABELS[code]}
          </option>
        ))}
      </select>
      {renderContent()}
      {selectedOffer && (
        <ApplicationForm
          offer={selectedOffer}
          isSubmitting={isSubmitting}
          error={applicationError}
          onCancel={() => setSelectedOffer(null)}
          onSubmit={submitApplication}
        />
      )}
    </section>
  );
};

export default OffersPage;
