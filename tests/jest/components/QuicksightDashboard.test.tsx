import * as React from "react";
import {screen, waitFor} from "@testing-library/react";

import QuicksightDashboard from "../../../src/components/QuicksightDashboard";
import {LibrariesData, LibraryData} from "../../../src/interfaces";
import buildStore, {RootState} from "../../../src/store"
import {setupServer} from "msw/node";
import {rest} from "msw";
import renderWithContext from "../testUtils/renderWithContext";

const libraries: LibrariesData = {libraries: [{uuid: "my-uuid"}]};
const dashboardId = "test";
const embedUrl = "http://embedUrl"
const dashboardUrlData = {embedUrl: embedUrl}

describe("QuicksightDashboard", () => {
  const server = setupServer(
      rest.get("*/admin/libraries", (req, res, ctx) => res(ctx.json(libraries))),

      rest.get("*/admin/quicksight_embed/" + dashboardId + "?libraryUuids=" + libraries["libraries"][0]["uuid"], (req, res, ctx) => res(ctx.json(dashboardUrlData)))
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
      roles: [{role: "system"}],

    };

    renderWithContext(
        <QuicksightDashboard
            dashboardId={dashboardId}
            store={buildStore()}
        />,
        contextProviderProps
    );

    await waitFor(() => {
      expect(screen.getByRole('iframe')).toHaveAttribute("src", embedUrl)
    });
  });
});