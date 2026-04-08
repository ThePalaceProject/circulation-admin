import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PatronBlockingRulesHelpModal } from "../../../src/components/PatronBlockingRulesHelpModal";

const SAMPLE_FIELDS = {
  fines: "2.50",
  patron_identifier: "12345",
  patron_name: "John Doe",
};

const baseProps = {
  show: true,
  onHide: jest.fn(),
  availableFields: null,
  fieldsLoading: false,
  fieldsError: null,
};

describe("PatronBlockingRulesHelpModal", () => {
  beforeEach(() => {
    baseProps.onHide = jest.fn();
  });

  it("renders the modal title when show is true", () => {
    render(<PatronBlockingRulesHelpModal {...baseProps} />);
    expect(screen.getByText(/Patron Blocking Rules — Help/i)).toBeTruthy();
  });

  it("does not render when show is false", () => {
    render(<PatronBlockingRulesHelpModal {...baseProps} show={false} />);
    expect(
      screen.queryByText(/Patron Blocking Rules — Help/i)
    ).toBeNull();
  });

  it("shows a loading indicator when fieldsLoading is true", () => {
    render(
      <PatronBlockingRulesHelpModal
        {...baseProps}
        fieldsLoading={true}
        availableFields={null}
        fieldsError={null}
      />
    );
    expect(screen.getByText(/Loading available fields/i)).toBeTruthy();
  });

  it("does not show the fields table while loading", () => {
    render(
      <PatronBlockingRulesHelpModal
        {...baseProps}
        fieldsLoading={true}
        availableFields={SAMPLE_FIELDS}
        fieldsError={null}
      />
    );
    // Patron field names should not be visible while loading.
    expect(screen.queryByText("fines")).toBeNull();
    expect(screen.queryByText("patron_identifier")).toBeNull();
  });

  it("shows available fields in a table when loaded successfully", () => {
    render(
      <PatronBlockingRulesHelpModal
        {...baseProps}
        availableFields={SAMPLE_FIELDS}
      />
    );
    // Verify the fields table content is present.
    expect(screen.getByText("fines")).toBeTruthy();
    expect(screen.getByText("2.50")).toBeTruthy();
    expect(screen.getByText("patron_identifier")).toBeTruthy();
    expect(screen.getByText("12345")).toBeTruthy();
    expect(screen.getByText("patron_name")).toBeTruthy();
    expect(screen.getByText("John Doe")).toBeTruthy();
  });

  it("shows a warning message when fieldsError is set", () => {
    render(
      <PatronBlockingRulesHelpModal
        {...baseProps}
        fieldsError="Save the service before template variables can be fetched."
      />
    );
    expect(
      screen.getByText(/Save the service before template variables can be fetched/i)
    ).toBeTruthy();
    expect(screen.queryByText("fines")).toBeNull();
  });

  it("shows a muted fallback when there are no fields and no error", () => {
    render(
      <PatronBlockingRulesHelpModal
        {...baseProps}
        availableFields={null}
        fieldsError={null}
      />
    );
    expect(
      screen.getByText(/No field data available/i)
    ).toBeTruthy();
  });

  it("renders null values as italic 'null'", () => {
    render(
      <PatronBlockingRulesHelpModal
        {...baseProps}
        availableFields={{ some_field: null }}
      />
    );
    expect(screen.getByText("null")).toBeTruthy();
  });

  it("renders the Available Functions section with content", () => {
    render(<PatronBlockingRulesHelpModal {...baseProps} />);
    expect(screen.getByText(/Available Functions/i)).toBeTruthy();
  });

  it("renders the Syntax Reference section", () => {
    render(<PatronBlockingRulesHelpModal {...baseProps} />);
    expect(screen.getByText(/Syntax Reference/i)).toBeTruthy();
    // simpleeval appears in both the functions doc and the syntax section.
    expect(screen.getAllByText(/simpleeval/i).length).toBeGreaterThan(0);
  });

  it("calls onHide when the header × button is clicked", async () => {
    const user = userEvent.setup();
    const onHide = jest.fn();
    render(<PatronBlockingRulesHelpModal {...baseProps} onHide={onHide} />);

    // The header × button has class "close"; the footer button has content "Close".
    const closeButtons = screen.getAllByRole("button", { name: /close/i });
    await user.click(closeButtons[0]);
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it("calls onHide when the footer Close button is clicked", async () => {
    const user = userEvent.setup();
    const onHide = jest.fn();
    render(<PatronBlockingRulesHelpModal {...baseProps} onHide={onHide} />);

    // Footer Close is the last close-named button; header × is first.
    const closeButtons = screen.getAllByRole("button", { name: /close/i });
    await user.click(closeButtons[closeButtons.length - 1]);
    expect(onHide).toHaveBeenCalledTimes(1);
  });
});
