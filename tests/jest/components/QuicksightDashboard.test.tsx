import * as React from "react";
import { screen, waitFor } from "@testing-library/react";

import QuicksightDashboard from "../../../src/components/QuicksightDashboard";
import { LibrariesData } from "../../../src/interfaces";
import buildStore from "../../../src/store";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import renderWithContext from "../testUtils/renderWithContext";

const libraries: LibrariesData = { libraries: [{ uuid: "my-uuid" }] };
const dashboardId = "test";
const embedUrl = "http://embedUrl";
const dashboardUrlData = { embedUrl: embedUrl };

describe("QuicksightDashboard", () => {
  const server = setupServer(
    http.get("/admin/libraries", () => HttpResponse.json(libraries)),
    http.get(`/admin/quicksight_embed/${dashboardId}`, ({ request }) => {
      const url = new URL(request.url);
      const libraryUuids = url.searchParams.get("libraryUuids");

      if (libraryUuids === libraries["libraries"][0]["uuid"]) {
        return HttpResponse.json(dashboardUrlData);
      }
    })
  );

  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  it("embed url is retrieved and set in iframe", async () => {
    const contextProviderProps = {
      csrfToken: "",
      featureFlags: {},
      roles: [{ role: "system" }],
    };

    renderWithContext(
      <QuicksightDashboard dashboardId={dashboardId} store={buildStore()} />,
      contextProviderProps
    );

    await waitFor(() => {
      expect(screen.getAllByTitle("Library Dashboard")[0]).toHaveAttribute(
        "src",
        embedUrl
      );
    });
  });
});
