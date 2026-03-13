import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ResetAdobeId } from "../../../src/components/patrons/ResetAdobeId";

// ManagePatronsForm is a connected component (needs Redux + RTK Query).
// Mock it so we can test ResetAdobeId in isolation.
jest.mock("../../../src/components/patrons/ManagePatronsForm", () => {
  return function ManagePatronsFormMock() {
    return <div data-testid="manage-patrons-form" />;
  };
});

const patron1 = {
  authorization_expires: "",
  username: "User Name",
  personal_name: "Personal Name",
  email_address: "user@email.com",
  authorization_identifier: "1234",
  authorization_identifiers: [],
  block_reason: "",
  external_type: "",
  fines: "",
  permanent_id: "",
};

const patron2 = {
  authorization_expires: "",
  personal_name: "Personal Name2",
  authorization_identifier: "5678",
  authorization_identifiers: [],
  block_reason: "",
  external_type: "",
  fines: "",
  permanent_id: "",
};

function renderResetAdobeId(
  props: Partial<React.ComponentProps<typeof ResetAdobeId>> = {}
) {
  const defaults = {
    library: "nypl",
    csrfToken: "token",
    patron: null,
    resetAdobeId: jest.fn().mockResolvedValue(undefined),
  };
  return render(<ResetAdobeId {...defaults} {...props} />);
}

describe("ResetAdobeId", () => {
  // ─── Rendering without patron ────────────────────────────────────────────────

  describe("without patron", () => {
    it("has .patron-actions class", () => {
      renderResetAdobeId();
      expect(document.querySelector(".patron-actions")).toBeInTheDocument();
    });

    it("shows 'Reset Adobe ID' heading", () => {
      renderResetAdobeId();
      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Reset Adobe ID"
      );
    });

    it("shows 'Search for a patron to begin.' message", () => {
      renderResetAdobeId();
      expect(
        screen.getByText(/Search for a patron to begin\./i)
      ).toBeInTheDocument();
    });

    it("does not show the .reset-adobe-id section", () => {
      renderResetAdobeId();
      expect(document.querySelector(".reset-adobe-id")).toBeNull();
    });
  });

  // ─── Rendering with patron ────────────────────────────────────────────────────

  describe("with patron", () => {
    it("shows warning message with patron's username", () => {
      renderResetAdobeId({ patron: patron1 });
      expect(
        screen.getByText(/IMPORTANT: Patron User Name will lose/)
      ).toBeInTheDocument();
    });

    it("shows warning message with personal_name when no username", () => {
      renderResetAdobeId({ patron: patron2 });
      expect(
        screen.getByText(/IMPORTANT: Patron Personal Name2 will lose/)
      ).toBeInTheDocument();
    });

    it("shows the checkbox and the Reset Adobe ID button", () => {
      renderResetAdobeId({ patron: patron1 });
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Reset Adobe ID/i })
      ).toBeInTheDocument();
    });
  });

  // ─── Checkbox & button state ─────────────────────────────────────────────────

  describe("checkbox behaviour", () => {
    it("Reset Adobe ID button is disabled when checkbox is unchecked", () => {
      renderResetAdobeId({ patron: patron1 });
      expect(
        screen.getByRole("button", { name: /Reset Adobe ID/i })
      ).toBeDisabled();
    });

    it("enables the button when the checkbox is checked", async () => {
      const user = userEvent.setup();
      renderResetAdobeId({ patron: patron1 });
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      expect(
        screen.getByRole("button", { name: /Reset Adobe ID/i })
      ).not.toBeDisabled();
    });

    it("disables the button again when the checkbox is unchecked a second time", async () => {
      const user = userEvent.setup();
      renderResetAdobeId({ patron: patron1 });
      const checkbox = screen.getByRole("checkbox");
      // check
      await user.click(checkbox);
      expect(
        screen.getByRole("button", { name: /Reset Adobe ID/i })
      ).not.toBeDisabled();
      // uncheck
      await user.click(checkbox);
      expect(
        screen.getByRole("button", { name: /Reset Adobe ID/i })
      ).toBeDisabled();
    });
  });

  // ─── resetAdobeId action ──────────────────────────────────────────────────────

  describe("resetAdobeId action", () => {
    it("calls resetAdobeId with FormData and library when button is clicked", async () => {
      const user = userEvent.setup();
      const resetAdobeId = jest.fn().mockResolvedValue(undefined);
      renderResetAdobeId({ patron: patron1, resetAdobeId });

      // Enable button by checking the checkbox
      await user.click(screen.getByRole("checkbox"));

      await act(async () => {
        await user.click(
          screen.getByRole("button", { name: /Reset Adobe ID/i })
        );
      });

      expect(resetAdobeId).toHaveBeenCalledTimes(1);
      const [formData, library] = resetAdobeId.mock.calls[0];
      expect(library).toBe("nypl");
      expect(formData.get("identifier")).toBe("1234");
    });
  });

  // ─── Alerts ──────────────────────────────────────────────────────────────────

  describe("success alert", () => {
    it("shows success alert when responseBody is set", () => {
      const { rerender } = renderResetAdobeId({ patron: patron1 });
      rerender(
        <ResetAdobeId
          library="nypl"
          csrfToken="token"
          patron={patron1}
          responseBody="Adobe ID for patron has been reset."
          resetAdobeId={jest.fn()}
        />
      );
      expect(
        screen.getByText(/Adobe ID for patron has been reset\./)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Please instruct the patron to sign back into/)
      ).toBeInTheDocument();
    });

    it("hides checkbox and Reset button when responseBody is set", () => {
      renderResetAdobeId({
        patron: patron1,
        responseBody: "Adobe ID for patron has been reset.",
      });
      expect(screen.queryByRole("checkbox")).toBeNull();
      expect(
        screen.queryByRole("button", { name: /Reset Adobe ID/i })
      ).toBeNull();
    });

    it("restores checkbox and Reset button when responseBody is cleared", () => {
      const { rerender } = renderResetAdobeId({
        patron: patron1,
        responseBody: "Adobe ID for patron has been reset.",
      });
      rerender(
        <ResetAdobeId
          library="nypl"
          csrfToken="token"
          patron={patron1}
          responseBody=""
          resetAdobeId={jest.fn()}
        />
      );
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Reset Adobe ID/i })
      ).toBeInTheDocument();
    });
  });

  describe("error alert", () => {
    it("shows destructive alert when fetchError is set", () => {
      renderResetAdobeId({
        patron: patron1,
        fetchError: { status: 400, response: "", url: "" },
      });
      expect(
        screen.getByText(/Error: failed to reset Adobe ID for patron 1234/)
      ).toBeInTheDocument();
    });

    it("does not show error alert without fetchError", () => {
      renderResetAdobeId({ patron: patron1 });
      expect(screen.queryByText(/Error: failed to reset Adobe ID/)).toBeNull();
    });
  });

  // ─── Patron change ─────────────────────────────────────────────────────────────

  describe("patron change", () => {
    it("updates warning message when a different patron is provided", () => {
      const { rerender } = renderResetAdobeId({ patron: patron1 });
      expect(
        screen.getByText(/Patron User Name will lose/)
      ).toBeInTheDocument();

      rerender(
        <ResetAdobeId
          library="nypl"
          csrfToken="token"
          patron={patron2}
          resetAdobeId={jest.fn()}
        />
      );
      expect(
        screen.getByText(/Patron Personal Name2 will lose/)
      ).toBeInTheDocument();
    });
  });
});
