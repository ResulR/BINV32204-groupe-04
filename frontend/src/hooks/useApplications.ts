import { useCallback, useEffect, useState } from "react";
import type { Application } from "../models/application.ts";
import { getApplications, withdrawApplication } from "../services/applications.service.ts";
import { isUnauthorized } from "../utils/api.ts";

export const useApplications = (
  token: string,
  onUnauthorized: () => void,
  enabled = true,
) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setApplications(await getApplications(token, signal));
      } catch (reason: unknown) {
        if (signal?.aborted) return;
        if (isUnauthorized(reason)) onUnauthorized();
        else setError(reason instanceof Error ? reason.message : "Erreur inconnue");
      }
    },
    [token, onUnauthorized],
  );

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    // The request synchronizes component state with the external API.
    // oxlint-disable-next-line react-hooks/set-state-in-effect
    void reload(controller.signal).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false);
    });
    return () => controller.abort();
  }, [enabled, reload]);

  const withdraw = async (applicationId: number): Promise<void> => {
    try {
      await withdrawApplication(token, applicationId);
      await reload();
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) onUnauthorized();
      else setError(reason instanceof Error ? reason.message : "Erreur inconnue");
    }
  };

  return { applications, isLoading, error, withdraw, reload };
};
