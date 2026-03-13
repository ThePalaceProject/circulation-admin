import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import { ManagePatronsForm } from "../../../src/components/patrons/ManagePatronsForm";

const patron = {
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
};

const baseProps = {
  csrfToken: "token",
  library: "nypl",
  patronLookup: jest.fn().mockResolvedValue(undefined),
  clearPatronData: jest.fn().mockResolvedValue(undefined),
};

describe("ManagePatronsForm", () => {
  describe("rendering", () => {
    it("has .manage-patrons-form class", () => {
      const { container } = render(<ManagePatronsForm {...baseProps} />);
      expect(
        container.querySelector(".manage-patrons-form")
      ).toBeInTheDocument();
    });

    it("shows EditableInput (identifier field)", () => {
      const { container } = render(<ManagePatronsForm {...baseProps} />);
      expect(
        container.querySelector('input[name="identifier"]')
      ).toBeInTheDocument();
    });

    it("has a form with an input field and a button", () => {
      const { container } = render(<ManagePatronsForm {...baseProps} />);
      expect(container.querySelector("form")).toBeInTheDocument();
      expect(container.querySelectorAll("form input")).toHaveLength(1);
      expect(container.querySelectorAll("form button")).toHaveLength(1);
    });

    it("does not initially show an alert or error message", () => {
      const { container } = render(<ManagePatronsForm {...baseProps} />);
      expect(container.querySelector("[role='alert']")).not.toBeInTheDocument();
    });
  });

  describe("behavior", () => {
    const patronLookup = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => {
      patronLookup.mockClear();
    });

    it("calls patronLookup on form submit", () => {
      const { container } = render(
        <ManagePatronsForm {...baseProps} patronLookup={patronLookup} />
      );
      fireEvent.click(container.querySelector("form button"));
      expect(patronLookup).toHaveBeenCalledTimes(1);
    });

    it("displays an error message if there is an error", () => {
      const fetchError = { status: 400, response: "", url: "" };
      const { container } = render(
        <ManagePatronsForm
          {...baseProps}
          patronLookup={patronLookup}
          fetchError={fetchError}
        />
      );
      expect(container.querySelector("[role='alert']")).toBeInTheDocument();
    });

    it("displays 'No patron identifier provided' error", () => {
      const fetchError = {
        status: 400,
        response: "No patron identifier provided",
        url: "",
      };
      const { container } = render(
        <ManagePatronsForm
          {...baseProps}
          patronLookup={patronLookup}
          fetchError={fetchError}
        />
      );
      const errorMsg = container.querySelector("[role='alert']");
      expect(errorMsg).toBeInTheDocument();
      expect(errorMsg.textContent).toContain("No patron identifier provided");
    });

    it("displays a success message when a patron is found", () => {
      const { container } = render(
        <ManagePatronsForm
          {...baseProps}
          patronLookup={patronLookup}
          patron={patron}
        />
      );
      // Alert shows "Patron found: {id}"
      const success = container.querySelector(".alert-success");
      expect(success).toBeInTheDocument();
      expect(success.textContent).toContain(
        `Patron found: ${patron.authorization_identifier}`
      );
    });

    it("shows the PatronInfo list when a patron is found", () => {
      const { container } = render(
        <ManagePatronsForm
          {...baseProps}
          patronLookup={patronLookup}
          patron={patron}
        />
      );
      expect(container.querySelector(".patron-info")).toBeInTheDocument();
    });
  });
});
