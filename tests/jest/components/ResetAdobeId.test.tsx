import * as React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import buildStore from "../../../src/store";
import { renderWithProviders } from "../testUtils/withProviders";
import ConnectedResetAdobeId, {
  ResetAdobeId,
} from "../../../src/components/ResetAdobeId";

const patrons = [
  {
    authorization_expires: "",
    username: "User Name",
    personal_name: "Personal Name",
    email_address: "user@email.com",
    authorization_identifier: "1234",
    authorization_identifiers: [""],
    block_reason: "",
    external_type: "",
    fines: "",
    permanent_id: "",
  },
  {
    authorization_expires: "",
    personal_name: "Personal Name2",
    authorization_identifier: "5678",
    authorization_identifiers: [""],
    block_reason: "",
    external_type: "",
    fines: "",
    permanent_id: "",
  },
];

describe("ResetAdobeId", () => {
  let store: ReturnType<typeof buildStore>;

  beforeEach(() => {
    store = buildStore();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Render the unconnected component with explicit props (patron / resetAdobeId /
  // responseBody / fetchError are what `connect` would otherwise source from the
  // store, so tests inject them directly). Wrapped in providers because the
  // ManagePatronsForm it renders is connected.
  const resetElement = (props: Record<string, unknown> = {}) => (
    <ResetAdobeId store={store} csrfToken="token" library="nypl" {...props} />
  );
  const renderReset = (props: Record<string, unknown> = {}) =>
    renderWithProviders(resetElement(props));

  describe("rendering without patron", () => {
    it("has the patron-actions class", () => {
      const { container } = renderReset({ patron: null });
      expect(container.firstChild).toHaveClass("patron-actions");
    });

    it("has a header", () => {
      renderReset({ patron: null });
      expect(
        screen.getByRole("heading", { name: "Reset Adobe ID" })
      ).toBeInTheDocument();
    });

    it("does not render a patron-info section", () => {
      const { container } = renderReset({ patron: null });
      expect(container.querySelector(".patron-info")).not.toBeInTheDocument();
    });

    it("prompts the user to search for a patron", () => {
      renderReset({ patron: null });
      expect(
        screen.getByText("Search for a patron to begin.")
      ).toBeInTheDocument();
    });
  });

  describe("rendering with patron", () => {
    it("shows a warning before the submit button", () => {
      const { container } = renderReset({ patron: patrons[0] });
      expect(container.querySelector(".patron-warning")).toHaveTextContent(
        "IMPORTANT: Patron User Name will lose access to any existing loans. Loans will still appear in the patron's book list until they expire, but the patron will be unable to read or return them."
      );
    });

    it("gives the submit button a danger class", () => {
      renderReset({ patron: patrons[0] });
      expect(
        screen.getByRole("button", { name: "Reset Adobe ID" })
      ).toHaveClass("danger");
    });
  });

  describe("behavior", () => {
    it("has a disabled submit button initially", () => {
      renderReset({ patron: patrons[0], resetAdobeId: jest.fn() });
      expect(
        screen.getByRole("button", { name: "Reset Adobe ID" })
      ).toBeDisabled();
    });

    it("enables the submit button when the checkbox is checked", async () => {
      const user = userEvent.setup();
      renderReset({ patron: patrons[0], resetAdobeId: jest.fn() });
      const button = screen.getByRole("button", { name: "Reset Adobe ID" });
      expect(button).toBeDisabled();

      await user.click(screen.getByRole("checkbox"));

      expect(button).not.toBeDisabled();
    });

    it("disables the submit button when the checkbox is unchecked again", async () => {
      const user = userEvent.setup();
      renderReset({ patron: patrons[0], resetAdobeId: jest.fn() });
      const button = screen.getByRole("button", { name: "Reset Adobe ID" });
      const checkbox = screen.getByRole("checkbox");

      await user.click(checkbox);
      expect(button).not.toBeDisabled();

      await user.click(checkbox);
      expect(button).toBeDisabled();
    });

    it("calls the Adobe ID action when the button is clicked", async () => {
      const user = userEvent.setup();
      const resetAdobeId = jest.fn().mockResolvedValue(undefined);
      renderReset({ patron: patrons[0], resetAdobeId });
      expect(resetAdobeId).not.toHaveBeenCalled();

      await user.click(screen.getByRole("checkbox"));
      const button = screen.getByRole("button", { name: "Reset Adobe ID" });
      expect(button).not.toBeDisabled();
      await user.click(button);

      await waitFor(() => expect(resetAdobeId).toHaveBeenCalledTimes(1));
      const [data, library] = resetAdobeId.mock.calls[0];
      expect(data.get("identifier")).toBe("1234");
      expect(library).toBe("nypl");

      // After the reset resolves the component clears the checkbox, re-disabling
      // the button; awaiting that settles the pending promise.
      await waitFor(() => expect(button).toBeDisabled());
    });

    it("shows a success alert message if the reset is successful", () => {
      const { container, rerender } = renderReset({
        patron: patrons[0],
        resetAdobeId: jest.fn().mockResolvedValue(undefined),
      });
      expect(container.querySelector(".alert-success")).not.toBeInTheDocument();

      // The response now comes from the server (via the responseBody prop).
      rerender(
        resetElement({
          patron: patrons[0],
          responseBody: "Adobe ID for patron has been reset.",
        })
      );

      const alert = container.querySelector(".alert-success");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Adobe ID for patron has been reset.");
      expect(alert).toHaveTextContent(
        "Please instruct the patron to sign back into their account."
      );
    });

    it("hides the checkbox and the reset button if the reset is successful", () => {
      const { container, rerender } = renderReset({
        patron: patrons[0],
        resetAdobeId: jest.fn().mockResolvedValue(undefined),
      });
      expect(
        container.querySelector(".reset-adobe-id input")
      ).toBeInTheDocument();
      expect(
        container.querySelector(".reset-adobe-id button")
      ).toBeInTheDocument();

      rerender(
        resetElement({
          patron: patrons[0],
          responseBody: "Adobe ID for patron has been reset.",
        })
      );

      expect(
        container.querySelector(".reset-adobe-id input")
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(".reset-adobe-id button")
      ).not.toBeInTheDocument();
    });

    it("shows a failure alert message if the reset fails", () => {
      const fetchError = { status: 400, response: "", url: "" };
      // The legacy test modeled the failing action with a rejecting stub; the
      // failure alert itself is driven by the fetchError prop the reducer sets.
      const { container, rerender } = renderReset({
        patron: patrons[0],
        resetAdobeId: jest.fn().mockRejectedValue(fetchError),
      });
      expect(container.querySelector(".alert-danger")).not.toBeInTheDocument();

      rerender(
        resetElement({
          patron: patrons[0],
          resetAdobeId: jest.fn().mockRejectedValue(fetchError),
          fetchError,
        })
      );

      const alert = container.querySelector(".alert-danger");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(
        "Error: failed to reset Adobe ID for patron 1234"
      );
    });

    it("updates the warning message if a new patron is searched and found", () => {
      const { container, rerender } = renderReset({
        patron: patrons[0],
        resetAdobeId: jest.fn(),
      });
      expect(container.querySelector(".patron-warning")).toHaveTextContent(
        "IMPORTANT: Patron User Name will lose access"
      );

      rerender(resetElement({ patron: patrons[1], resetAdobeId: jest.fn() }));

      expect(container.querySelector(".patron-warning")).toHaveTextContent(
        "IMPORTANT: Patron Personal Name2 will lose access"
      );
    });

    it("restores the checkbox and the reset button if a new patron is searched and found", () => {
      const { container, rerender } = renderReset({
        patron: patrons[0],
        responseBody: "Adobe ID for patron has been reset.",
        resetAdobeId: jest.fn(),
      });
      expect(
        container.querySelector(".reset-adobe-id input")
      ).not.toBeInTheDocument();
      expect(
        container.querySelector(".reset-adobe-id button")
      ).not.toBeInTheDocument();

      rerender(
        resetElement({
          patron: patrons[0],
          responseBody: "",
          resetAdobeId: jest.fn(),
        })
      );

      expect(
        container.querySelector(".reset-adobe-id input")
      ).toBeInTheDocument();
      expect(
        container.querySelector(".reset-adobe-id button")
      ).toBeInTheDocument();
    });
  });

  describe("connected (default export)", () => {
    it("wires state and dispatch through connect", async () => {
      // Defensive: nothing fetches on this mount, but stub fetch so any stray
      // request settles rather than crashing the strict worker.
      jest.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      renderWithProviders(
        <ConnectedResetAdobeId
          store={buildStore()}
          csrfToken="token"
          library="nypl"
        />
      );

      // With no patron in the store, mapStateToProps yields patron=undefined and
      // the connected component prompts the user to search.
      expect(
        await screen.findByRole("heading", { name: "Reset Adobe ID" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("Search for a patron to begin.")
      ).toBeInTheDocument();
    });
  });
});
