import * as React from "react";
import { screen, waitFor } from "@testing-library/react";

import QuicksightDashboard from "../../../src/components/QuicksightDashboard";
import { LibrariesData } from "../../../src/interfaces";
import buildStore from "../../../src/store";
import { http, HttpResponse } from "msw";
import { setupMswServer } from "../testUtils/mswServer";
import { renderWithProviders } from "../testUtils/withProviders";
import QuicksightDashboardPage from "../../../src/components/QuicksightDashboardPage";

const libraries: LibrariesData = { libraries: [{ uuid: "my-uuid" }] };
const dashboardId = "test";
const embedUrl = "http://embedUrl";
const dashboardUrlData = { embedUrl: embedUrl };

describe("QuicksightDashboard", () => {
  setupMswServer(
    http.get("/admin/libraries", () => HttpResponse.json(libraries)),
    http.get(`/admin/quicksight_embed/${dashboardId}`, ({ request }) => {
      const url = new URL(request.url);
      const libraryUuids = url.searchParams.get("libraryUuids");

      if (libraryUuids === libraries["libraries"][0]["uuid"]) {
        return HttpResponse.json(dashboardUrlData);
      }
    }),
    // QuicksightDashboardPage always requests the "library" dashboard.
    http.get("/admin/quicksight_embed/library", () =>
      HttpResponse.json(dashboardUrlData)
    )
  );

  it("embed url is retrieved and set in iframe", async () => {
    renderWithProviders(
      <QuicksightDashboard dashboardId={dashboardId} store={buildStore()} />
    );

    await waitFor(() => {
      expect(screen.getAllByTitle("Library Dashboard")[0]).toHaveAttribute(
        "src",
        embedUrl
      );
    });
  });

  it("header renders without navigation links ", async () => {
    renderWithProviders(<QuicksightDashboardPage params={{ library: null }} />);

    // Make sure we see the QuicksSight iFrame.
    expect(screen.getByTitle("Library Dashboard")).toBeInTheDocument();
    // Make sure we have the branding image.
    expect(
      screen.getByAltText("Palace Collection Manager")
    ).toBeInTheDocument();

    // Make sure we do not see other navigation links.
    ["Dashboard", "System Configuration"].forEach((name) => {
      expect(screen.queryByText(name)).not.toBeInTheDocument();
    });

    // Let the on-mount embed URL fetch settle before the test ends.
    await waitFor(() => {
      expect(screen.getByTitle("Library Dashboard")).toHaveAttribute(
        "src",
        embedUrl
      );
    });
  });
});
