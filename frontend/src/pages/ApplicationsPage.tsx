import { useState } from "react";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import ApplicationList from "../components/ApplicationList.tsx";
import { useApplications } from "../hooks/useApplications.ts";

interface ApplicationsPageProps {
  token: string;
  onUnauthorized: () => void;
}

const ApplicationsPage = ({ token, onUnauthorized }: ApplicationsPageProps) => {
  const { applications, isLoading, error, withdraw } = useApplications(token, onUnauthorized);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  const handleWithdraw = async (applicationId: number) => {
    setWithdrawingId(applicationId);
    try {
      await withdraw(applicationId);
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <section>
      <h1>Mes candidatures</h1>
      <p>Retrouvez toutes vos candidatures et leur statut.</p>
      {error && <ErrorState message={error} />}
      {isLoading ? (
        <LoadingState />
      ) : applications.length === 0 ? (
        <EmptyState message="Aucune candidature à afficher." />
      ) : (
        <ApplicationList
          applications={applications}
          onWithdraw={handleWithdraw}
          withdrawingId={withdrawingId}
        />
      )}
    </section>
  );
};

export default ApplicationsPage;
