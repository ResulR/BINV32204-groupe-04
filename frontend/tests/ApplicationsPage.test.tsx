import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "../src/pages/ApplicationsPage.tsx";
import { stubFetch } from "./helpers/fetchMock.ts";

const applications = [
  {
    id: 1,
    offerId: 7,
    offerTitle: "Assistant conversationnel interne",
    companyShortName: "Nexalis",
    academicYear: "2026-2027",
    period: "P2",
    message: "Mon message",
    status: "IN_PROGRESS",
    appliedAt: "2026-10-10 10:00:00",
  },
  {
    id: 2,
    offerId: 3,
    offerTitle: "API REST de facturation",
    companyShortName: "Orbis",
    academicYear: "2026-2027",
    period: "P2",
    message: null,
    status: "WITHDRAWN",
    appliedAt: "2026-09-10 10:00:00",
  },
  {
    id: 3,
    offerId: 4,
    offerTitle: "Portail client",
    companyShortName: "Orbis",
    academicYear: "2026-2027",
    period: "P1",
    message: null,
    status: "SELECTED",
    appliedAt: "2026-08-10 10:00:00",
  },
  {
    id: 4,
    offerId: 5,
    offerTitle: "Qualité des données",
    companyShortName: "Nexalis",
    academicYear: "2026-2027",
    period: "OTHER",
    message: null,
    status: "REJECTED",
    appliedAt: "2026-07-10 10:00:00",
  },
];

describe("ApplicationsPage", () => {
  it("affiche les candidatures et ne propose le retrait que pour une candidature en cours", async () => {
    stubFetch({ "/api/applications/me": () => Response.json(applications) });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Assistant conversationnel interne")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Retirée")).toBeInTheDocument();
    expect(screen.getByText("Retenue")).toBeInTheDocument();
    expect(screen.getByText("Non retenue")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Retirer" })).toHaveLength(1);
  });

  it("retire une candidature et recharge la liste", async () => {
    let withdrawn = false;
    const fetchMock = stubFetch({
      "/api/applications/1": () => {
        withdrawn = true;
        return Response.json({ ...applications[0], status: "WITHDRAWN" });
      },
      "/api/applications/me": () =>
        Response.json(withdrawn ? [{ ...applications[0], status: "WITHDRAWN" }] : applications),
    });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Retirer" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith("/api/applications/me", {
        headers: { Authorization: "jeton" },
        signal: undefined,
      });
    });
    expect(await screen.findByText("Retirée")).toBeInTheDocument();
  });
});
