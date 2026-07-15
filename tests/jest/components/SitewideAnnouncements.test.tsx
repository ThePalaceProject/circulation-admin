import * as React from "react";
import { installFormDataShim, FormDataShim } from "../testUtils/formDataShim";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";
// Render the CONNECTED default export so that mapStateToProps / mapDispatchToProps
// are exercised. The panel fetches its announcements on mount; the fetched data
// flows back in through the Redux store.
import SitewideAnnouncements from "../../../src/components/SitewideAnnouncements";

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

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const renderConnected = (
  element: React.ReactElement,
  appConfigSettings: Record<string, unknown> = {}
) =>
  renderWithProviders(element, {
    reduxProviderProps: { store: buildStore() },
    appConfigSettings,
  });

describe("SitewideAnnouncements", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders a form containing the announcements section", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => jsonResponse(data));
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
    // A never-resolving fetch keeps the panel in its fetching state.
    jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => new Promise(() => {}));
    const { container } = renderConnected(
      <SitewideAnnouncements csrfToken="token" />
    );

    expect(container.querySelector(".loading")).toBeInTheDocument();
    expect(container.querySelector("form")).not.toBeInTheDocument();
  });

  it("submits the announcements to editItem when the form is submitted", async () => {
    const user = userEvent.setup();
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (_url, opts?: RequestInit) => {
        if (opts?.method === "POST") {
          return new Response("success", { status: 200 });
        }
        return jsonResponse(data);
      });

    // System admin so the settings' required permission level is satisfied and
    // the submit button is enabled.
    renderConnected(<SitewideAnnouncements csrfToken="token" />, {
      roles: [{ role: "system" }],
    });

    await screen.findByText("There is nothing to see here.");

    await user.click(screen.getByRole("button", { name: "Submit" }));

    // The submit dispatches editSitewideAnnouncements, which POSTs the form.
    await waitFor(() => {
      const postCall = fetchSpy.mock.calls.find(
        ([, opts]) => (opts as RequestInit)?.method === "POST"
      );
      expect(postCall).toBeDefined();
    });

    const postCall = fetchSpy.mock.calls.find(
      ([, opts]) => (opts as RequestInit)?.method === "POST"
    );
    const body = (postCall[1] as RequestInit).body as unknown as FormDataShim;
    expect(JSON.parse(body.get("announcements"))).toStrictEqual(
      data.announcements
    );
  });

  it("disables the submit button when the admin lacks the required permission level", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => jsonResponse(data));
    // No roles => admin level 1, below the settings' required level of 3.
    renderConnected(<SitewideAnnouncements csrfToken="token" />);

    await screen.findByText("There is nothing to see here.");
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });
});
