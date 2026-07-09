import * as React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../testUtils/withProviders";
import { installFormDataShim } from "../testUtils/formDataShim";
import buildStore from "../../../src/store";
import { ManagePatronsForm } from "../../../src/components/ManagePatronsForm";
import { PatronData } from "../../../src/interfaces";

// The reusable-components `Form` builds `new FormData(formElement)` on submit,
// which the unit jsdom environment's undici FormData rejects; install the shared
// shim that reads the form's successful controls.
installFormDataShim();

const patron: PatronData = {
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

// `clearPatronData` is called on unmount (RTL cleanup), so it must always be a
// function; `patronLookup` too, so the connected dispatch props are stubbed.
const renderForm = (props: Record<string, unknown> = {}) =>
  renderWithProviders(
    <ManagePatronsForm
      store={buildStore()}
      csrfToken="token"
      library="nypl"
      patronLookup={jest.fn()}
      clearPatronData={jest.fn()}
      {...props}
    />
  );

describe("ManagePatronsForm", () => {
  describe("rendering", () => {
    it("has .manage-patrons-form class", () => {
      const { container } = renderForm();
      expect(
        container.querySelector(".manage-patrons-form")
      ).toBeInTheDocument();
    });

    it("shows an editable identifier input", () => {
      renderForm();
      expect(
        screen.getByPlaceholderText("Enter the patron's identifier")
      ).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("has a form with an input field and a button", () => {
      const { container } = renderForm();
      expect(container.querySelectorAll("form")).toHaveLength(1);
      expect(container.querySelectorAll("form input")).toHaveLength(1);
      expect(container.querySelectorAll("form button")).toHaveLength(1);
    });

    it("doesn't initially show an alert or error message", () => {
      const { container } = renderForm();
      expect(container.querySelector(".alert")).not.toBeInTheDocument();
      expect(screen.queryByText(/Patron found/)).not.toBeInTheDocument();
    });
  });

  describe("behavior", () => {
    it("calls patronLookup on submit", async () => {
      const user = userEvent.setup();
      const patronLookup = jest.fn();
      renderForm({ patronLookup });

      expect(patronLookup).not.toHaveBeenCalled();

      await user.type(
        screen.getByPlaceholderText("Enter the patron's identifier"),
        "1234"
      );
      await user.click(screen.getByRole("button"));

      expect(patronLookup).toHaveBeenCalledTimes(1);
      // The second argument is the library short name.
      expect(patronLookup.mock.calls[0][1]).toBe("nypl");
    });

    it("displays an error message if there is an error", () => {
      const fetchError = { status: 400, response: "", url: "" };
      const { container, rerender } = renderForm();
      expect(container.querySelector(".alert-danger")).not.toBeInTheDocument();

      rerender(
        <ManagePatronsForm
          store={buildStore()}
          csrfToken="token"
          library="nypl"
          patronLookup={jest.fn()}
          clearPatronData={jest.fn()}
          fetchError={fetchError}
        />
      );

      expect(container.querySelector(".alert-danger")).toBeInTheDocument();
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });

    it("should display a no-identifier message if the input field is blank when searching", () => {
      const fetchError = {
        status: 400,
        response: "No patron identifier provided",
        url: "",
      };
      const { rerender } = renderForm();
      expect(
        screen.queryByText("Error: No patron identifier provided")
      ).not.toBeInTheDocument();

      rerender(
        <ManagePatronsForm
          store={buildStore()}
          csrfToken="token"
          library="nypl"
          patronLookup={jest.fn()}
          clearPatronData={jest.fn()}
          fetchError={fetchError}
        />
      );

      expect(
        screen.getByText("Error: No patron identifier provided")
      ).toBeInTheDocument();
    });

    it("should display a success alert message when a patron is found", () => {
      const { container, rerender } = renderForm();
      expect(container.querySelector(".alert-success")).not.toBeInTheDocument();

      rerender(
        <ManagePatronsForm
          store={buildStore()}
          csrfToken="token"
          library="nypl"
          patronLookup={jest.fn()}
          clearPatronData={jest.fn()}
          patron={patron}
        />
      );

      const alert = container.querySelector(".alert-success");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(
        `Patron found: ${patron.authorization_identifier}`
      );
    });

    it("should show the PatronInfo list when a patron is found", () => {
      const { container, rerender } = renderForm();
      expect(container.querySelector(".patron-info")).not.toBeInTheDocument();

      rerender(
        <ManagePatronsForm
          store={buildStore()}
          csrfToken="token"
          library="nypl"
          patronLookup={jest.fn()}
          clearPatronData={jest.fn()}
          patron={patron}
        />
      );

      expect(container.querySelector(".patron-info")).toBeInTheDocument();
    });
  });
});
