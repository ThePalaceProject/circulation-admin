import * as React from "react";
import { installFormDataShim } from "../testUtils/formDataShim";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";
// Render the CONNECTED default export so that mapStateToProps / mapDispatchToProps
// are exercised. The panel fetches its announcements on mount; the fetched data
// flows back in through the Redux store.
import SitewideAnnouncements from "../../../src/components/SitewideAnnouncements";
import { delay, http, HttpResponse } from "msw";
import { setupMswServer } from "../testUtils/mswServer";

const data = {
  announcements: [
    {
      id: "dcf036d9-106b-426c-838f-ce7c57d53801",
      content: "There is nothing to see here.",
      start: "2022-08-31",
      finish: "2022-10-31",
    },
  ],
  settings: [
    {
      category: "Announcements",
      description: "Announcements will be displayed to authenticated patrons.",
      key: "global_announcements",
      label: "Scheduled announcements",
      level: 3,
      type: "announcements",
    },
  ],
};
installFormDataShim();

const renderConnected = (
  element: React.ReactElement,
  appConfigSettings: Record<string, unknown> = {}
) =>
  renderWithProviders(element, {
    reduxProviderProps: { store: buildStore() },
    appConfigSettings,
  });

describe("SitewideAnnouncements", () => {
  const { server, requests } = setupMswServer(
    http.get("*/admin/announcements", () => HttpResponse.json(data)),
    http.post("*/admin/announcements", () => HttpResponse.text("success"))
  );

  it("renders a form containing the announcements section", async () => {
    const { container } = renderConnected(
      <SitewideAnnouncements csrfToken="token" />
    );

    // Once the on-mount fetch resolves, the form renders with the announcement
    // supplied through the store (proving the AnnouncementsSection received the
    // data as its value).
    expect(
      await screen.findByText("There is nothing to see here.")
    ).toBeInTheDocument();
    expect(screen.getByText("Scheduled Announcements:")).toBeInTheDocument();
    expect(container.querySelector("form")).toBeInTheDocument();
  });

  it("renders a loading indicator instead of a form while data is loading", () => {
    // A never-answered request keeps the panel in its fetching state.
    server.use(
      http.get("*/admin/announcements", async () => {
        await delay("infinite");
      })
    );
    const { container } = renderConnected(
      <SitewideAnnouncements csrfToken="token" />
    );

    expect(container.querySelector(".loading")).toBeInTheDocument();
    expect(container.querySelector("form")).not.toBeInTheDocument();
  });

  it("submits the announcements to editItem when the form is submitted", async () => {
    const user = userEvent.setup();

    // System admin so the settings' required permission level is satisfied and
    // the submit button is enabled.
    renderConnected(<SitewideAnnouncements csrfToken="token" />, {
      roles: [{ role: "system" }],
    });

    await screen.findByText("There is nothing to see here.");

    await user.click(screen.getByRole("button", { name: "Submit" }));

    // The submit dispatches editSitewideAnnouncements, which POSTs the form.
    await waitFor(() =>
      expect(requests.find((r) => r.method === "POST")).toBeDefined()
    );

    const post = requests.find((r) => r.method === "POST");
    expect(new URL(post.url).pathname).toBe("/admin/announcements");
    const body = await post.formData();
    expect(JSON.parse(body.get("announcements") as string)).toStrictEqual(
      data.announcements
    );
  });

  it("disables the submit button when the admin lacks the required permission level", async () => {
    // No roles => admin level 1, below the settings' required level of 3.
    renderConnected(<SitewideAnnouncements csrfToken="token" />);

    await screen.findByText("There is nothing to see here.");
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });
});
