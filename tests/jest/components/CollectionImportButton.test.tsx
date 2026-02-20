import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CollectionImportButton, {
  CollectionImportButtonProps,
} from "../../../src/components/CollectionImportButton";
import { CollectionData, ProtocolData } from "../../../src/interfaces";

const protocolWithImport: ProtocolData = {
  name: "Boundless",
  label: "Boundless",
  supports_import: true,
  settings: [],
};

const protocolWithoutImport: ProtocolData = {
  name: "Overdrive",
  label: "Overdrive",
  supports_import: false,
  settings: [],
};

const savedCollection: CollectionData = {
  id: 42,
  protocol: "Boundless",
  name: "Test Collection",
};

const unsavedCollection: CollectionData = {
  protocol: "Boundless",
  name: "Unsaved Collection",
};

function renderButton(overrides: Partial<CollectionImportButtonProps> = {}) {
  const defaultProps: CollectionImportButtonProps = {
    collection: savedCollection,
    protocols: [protocolWithImport, protocolWithoutImport],
    importCollection: jest.fn().mockResolvedValue(undefined),
    disabled: false,
    ...overrides,
  };
  return {
    ...render(<CollectionImportButton {...defaultProps} />),
    importCollection: defaultProps.importCollection as jest.Mock,
  };
}

describe("CollectionImportButton", () => {
  it("does not render when protocol lacks supports_import", () => {
    const collection: CollectionData = {
      id: 1,
      protocol: "Overdrive",
      name: "OD Collection",
    };
    const { container } = renderButton({ collection });
    expect(container.innerHTML).toBe("");
  });

  it("does not render for unsaved collection (no id)", () => {
    const { container } = renderButton({ collection: unsavedCollection });
    expect(container.innerHTML).toBe("");
  });

  it("renders button and checkbox when supported", () => {
    renderButton();
    expect(
      screen.getByRole("button", { name: "Queue Import" })
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByText("Force full re-import")).toBeInTheDocument();
  });

  it("checkbox toggles force state", async () => {
    const user = userEvent.setup();
    renderButton();
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("button triggers import with correct args (force=false)", async () => {
    const user = userEvent.setup();
    const { importCollection } = renderButton();
    const button = screen.getByRole("button", { name: "Queue Import" });
    await user.click(button);
    expect(importCollection).toHaveBeenCalledWith(42, false);
  });

  it("button triggers import with force=true when checked", async () => {
    const user = userEvent.setup();
    const { importCollection } = renderButton();
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    const button = screen.getByRole("button", { name: "Queue Import" });
    await user.click(button);
    expect(importCollection).toHaveBeenCalledWith(42, true);
  });

  it("shows success feedback after import", async () => {
    const user = userEvent.setup();
    renderButton();
    await user.click(screen.getByRole("button", { name: "Queue Import" }));
    await waitFor(() => {
      expect(screen.getByText("Import task queued.")).toBeInTheDocument();
    });
  });

  it("shows error feedback on failure", async () => {
    const user = userEvent.setup();
    const mockImport = jest
      .fn()
      .mockRejectedValue({ response: "Something went wrong" });
    renderButton({ importCollection: mockImport });
    await user.click(screen.getByRole("button", { name: "Queue Import" }));
    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  it("disables button and checkbox when disabled prop is true", () => {
    renderButton({ disabled: true });
    expect(screen.getByRole("button", { name: "Queue Import" })).toBeDisabled();
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("shows 'Queuing...' text while importing", async () => {
    const user = userEvent.setup();
    let resolveImport: () => void;
    const pendingImport = new Promise<void>((resolve) => {
      resolveImport = resolve;
    });
    const mockImport = jest.fn().mockReturnValue(pendingImport);
    renderButton({ importCollection: mockImport });

    await user.click(screen.getByRole("button", { name: "Queue Import" }));

    expect(screen.getByRole("button", { name: "Queuing..." })).toBeDisabled();

    resolveImport();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Queue Import" })
      ).toBeEnabled();
    });
  });
});
