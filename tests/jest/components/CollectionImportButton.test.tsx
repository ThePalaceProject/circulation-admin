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

/** Expand the collapsed Import panel by clicking its header. */
async function expandPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText("Import"));
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

  it("renders panel header when supported", () => {
    renderButton();
    expect(screen.getByText("Import")).toBeInTheDocument();
  });

  it("renders button and checkbox when panel is expanded", async () => {
    const user = userEvent.setup();
    renderButton();
    await expandPanel(user);
    expect(
      screen.getByRole("button", { name: "Queue Import" })
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByLabelText("Force full re-import")).toBeInTheDocument();
  });

  it("shows compact summary by default; detailed docs are hidden", async () => {
    const user = userEvent.setup();
    renderButton();
    await expandPanel(user);
    expect(
      screen.getByText(/queue import picks up new and changed items/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/schedules a background import job/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/the import job re-processes every item/i)
    ).not.toBeInTheDocument();
  });

  it("clicking 'More details' reveals the detailed docs", async () => {
    const user = userEvent.setup();
    renderButton();
    await expandPanel(user);

    const toggle = screen.getByRole("button", { name: "More details" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);

    expect(
      screen.getByText(/schedules a background import job/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the import job re-processes every item/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Less details" })
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("clicking 'Less details' hides the detailed docs again", async () => {
    const user = userEvent.setup();
    renderButton();
    await expandPanel(user);

    await user.click(screen.getByRole("button", { name: "More details" }));
    expect(
      screen.getByText(/schedules a background import job/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Less details" }));
    expect(
      screen.queryByText(/schedules a background import job/i)
    ).not.toBeInTheDocument();
  });

  it("checkbox toggles force state", async () => {
    const user = userEvent.setup();
    renderButton();
    await expandPanel(user);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("button text changes to 'Queue Full Re-import' when force is checked", async () => {
    const user = userEvent.setup();
    renderButton();
    await expandPanel(user);

    expect(
      screen.getByRole("button", { name: "Queue Import" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox"));

    expect(
      screen.getByRole("button", { name: "Queue Full Re-import" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Queue Import" })
    ).not.toBeInTheDocument();
  });

  it("button uses force class when force is checked", async () => {
    const user = userEvent.setup();
    renderButton();
    await expandPanel(user);

    const button = screen.getByRole("button", { name: "Queue Import" });
    expect(button).not.toHaveClass("force");

    await user.click(screen.getByRole("checkbox"));

    const forceButton = screen.getByRole("button", {
      name: "Queue Full Re-import",
    });
    expect(forceButton).toHaveClass("force");
  });

  it("button triggers import with correct args (force=false)", async () => {
    const user = userEvent.setup();
    const { importCollection } = renderButton();
    await expandPanel(user);
    const button = screen.getByRole("button", { name: "Queue Import" });
    await user.click(button);
    expect(importCollection).toHaveBeenCalledWith(42, false);
  });

  it("button triggers import with force=true when checked", async () => {
    const user = userEvent.setup();
    const { importCollection } = renderButton();
    await expandPanel(user);
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    const button = screen.getByRole("button", {
      name: "Queue Full Re-import",
    });
    await user.click(button);
    expect(importCollection).toHaveBeenCalledWith(42, true);
  });

  it("shows success feedback for regular import", async () => {
    const user = userEvent.setup();
    renderButton();
    await expandPanel(user);
    await user.click(screen.getByRole("button", { name: "Queue Import" }));
    await waitFor(() => {
      const feedback = screen.getByText(
        /import task queued\. new and updated items will appear/i
      );
      expect(feedback).toBeInTheDocument();
      expect(feedback).toHaveClass("alert", "alert-success");
    });
  });

  it("shows success feedback for force re-import", async () => {
    const user = userEvent.setup();
    renderButton();
    await expandPanel(user);
    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: "Queue Full Re-import" })
    );
    await waitFor(() => {
      const feedback = screen.getByText(
        /full re-import task queued\. all items will be re-processed/i
      );
      expect(feedback).toBeInTheDocument();
      expect(feedback).toHaveClass("alert", "alert-success");
    });
  });

  it("shows error feedback with alert-danger styling on failure", async () => {
    const user = userEvent.setup();
    const mockImport = jest
      .fn()
      .mockRejectedValue({ response: "Something went wrong" });
    renderButton({ importCollection: mockImport });
    await expandPanel(user);
    await user.click(screen.getByRole("button", { name: "Queue Import" }));
    await waitFor(() => {
      const feedback = screen.getByText("Something went wrong");
      expect(feedback).toBeInTheDocument();
      expect(feedback).toHaveClass("alert", "alert-danger");
    });
  });

  it("resets force checkbox and feedback when switching collections", async () => {
    const user = userEvent.setup();
    const { rerender, importCollection } = renderButton();
    await expandPanel(user);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(
      screen.getByRole("button", { name: "Queue Full Re-import" })
    );
    await waitFor(() => {
      expect(
        screen.getByText(/full re-import task queued/i)
      ).toBeInTheDocument();
    });

    const nextCollection: CollectionData = {
      id: 99,
      protocol: "Boundless",
      name: "Another Collection",
    };
    rerender(
      <CollectionImportButton
        collection={nextCollection}
        protocols={[protocolWithImport, protocolWithoutImport]}
        importCollection={importCollection}
        disabled={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("checkbox")).not.toBeChecked();
      expect(
        screen.queryByText(/full re-import task queued/i)
      ).not.toBeInTheDocument();
    });
  });

  it("disables button and checkbox when disabled prop is true", async () => {
    const user = userEvent.setup();
    renderButton({ disabled: true });
    await expandPanel(user);
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
    await expandPanel(user);

    await user.click(screen.getByRole("button", { name: "Queue Import" }));

    expect(screen.getByRole("button", { name: "Queuing..." })).toBeDisabled();

    resolveImport();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Queue Import" })
      ).toBeEnabled();
    });
  });

  it("shows 'Queuing Full Re-import...' while importing with force", async () => {
    const user = userEvent.setup();
    let resolveImport: () => void;
    const pendingImport = new Promise<void>((resolve) => {
      resolveImport = resolve;
    });
    const mockImport = jest.fn().mockReturnValue(pendingImport);
    renderButton({ importCollection: mockImport });
    await expandPanel(user);

    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: "Queue Full Re-import" })
    );

    expect(
      screen.getByRole("button", { name: "Queuing Full Re-import..." })
    ).toBeDisabled();

    resolveImport();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Queue Full Re-import" })
      ).toBeEnabled();
    });
  });
});
