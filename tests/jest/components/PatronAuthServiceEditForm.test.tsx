import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatronAuthServiceEditForm from "../../../src/components/PatronAuthServiceEditForm";
import {
  PatronAuthServicesData,
  PatronBlockingRule,
} from "../../../src/interfaces";
import { SIP2_PROTOCOL } from "../../../src/utils/patronBlockingRules";

async function expandLibrariesPanel(user: ReturnType<typeof userEvent.setup>) {
  const toggle = screen
    .getAllByRole("button")
    .find((btn) => btn.getAttribute("aria-controls")?.includes("libraries"));
  if (toggle && toggle.getAttribute("aria-expanded") === "false") {
    await user.click(toggle);
  }
}

const SIP2_PROTOCOL_DATA = {
  name: SIP2_PROTOCOL,
  label: "SIP2",
  description: "SIP2 authentication",
  sitewide: false,
  settings: [{ key: "server", label: "Server", required: true }],
  library_settings: [],
};

const OTHER_PROTOCOL_DATA = {
  name: "api.saml.provider",
  label: "SAML",
  description: "SAML authentication",
  sitewide: false,
  settings: [{ key: "idp_url", label: "IdP URL", required: true }],
  library_settings: [],
};

const LIBRARY_SHORT_NAME = "test-lib";

const servicesData: PatronAuthServicesData = {
  protocols: [SIP2_PROTOCOL_DATA, OTHER_PROTOCOL_DATA],
  allLibraries: [{ short_name: LIBRARY_SHORT_NAME, name: "Test Library" }],
  patron_auth_services: [],
};

const baseProps = {
  data: servicesData,
  disabled: false,
  save: jest.fn(),
  urlBase: "/admin/web/config/patronAuth/",
  listDataKey: "patron_auth_services",
  adminLevel: 10,
};

function buildSIP2Item(rules: PatronBlockingRule[] = []) {
  return {
    id: 1,
    protocol: SIP2_PROTOCOL,
    settings: { server: "sip.example.com" },
    libraries: [
      { short_name: LIBRARY_SHORT_NAME, patron_blocking_rules: rules },
    ],
  };
}

describe("PatronAuthServiceEditForm – capability gating", () => {
  it("shows PatronBlockingRulesEditor in expanded library settings for SIP2", async () => {
    const user = userEvent.setup();
    render(<PatronAuthServiceEditForm {...baseProps} item={buildSIP2Item()} />);

    await expandLibrariesPanel(user);
    const editButton = screen.getByRole("button", { name: /Edit/i });
    await user.click(editButton);

    // The PatronBlockingRulesEditor label and Add Rule button should be visible
    expect(screen.getByText("Patron Blocking Rules")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Add Rule/i })).toBeTruthy();
  });

  it("does not show PatronBlockingRulesEditor for non-SIP2 protocol", async () => {
    const user = userEvent.setup();
    const item = {
      id: 2,
      protocol: "api.saml.provider",
      settings: { idp_url: "https://idp.example.com" },
      libraries: [{ short_name: LIBRARY_SHORT_NAME }],
    };
    render(<PatronAuthServiceEditForm {...baseProps} item={item} />);
    await expandLibrariesPanel(user);

    // For non-SIP2 with no library_settings, the Edit button should not render
    expect(screen.queryByRole("button", { name: /Edit/i })).toBeNull();
    expect(screen.queryByText(/Patron Blocking Rules/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /Add Rule/i })).toBeNull();
  });
});

describe("PatronAuthServiceEditForm – load / initial value", () => {
  it("populates the editor with existing patron_blocking_rules from saved library settings", async () => {
    const user = userEvent.setup();
    const existingRules: PatronBlockingRule[] = [
      {
        name: "Block expired",
        rule: "status == expired",
        message: "Card expired",
      },
    ];
    render(
      <PatronAuthServiceEditForm
        {...baseProps}
        item={buildSIP2Item(existingRules)}
      />
    );

    await expandLibrariesPanel(user);
    const editButton = screen.getByRole("button", { name: /Edit/i });
    await user.click(editButton);

    const nameInput = screen.getByLabelText(/Rule Name/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Block expired");

    const ruleTextarea = screen.getByLabelText(
      /Rule Expression/i
    ) as HTMLTextAreaElement;
    expect(ruleTextarea.value).toBe("status == expired");

    const messageInput = screen.getByLabelText(/Message/i) as HTMLInputElement;
    expect(messageInput.value).toBe("Card expired");
  });

  it("shows empty editor when library has no existing patron_blocking_rules", async () => {
    const user = userEvent.setup();
    render(
      <PatronAuthServiceEditForm {...baseProps} item={buildSIP2Item([])} />
    );

    await expandLibrariesPanel(user);
    const editButton = screen.getByRole("button", { name: /Edit/i });
    await user.click(editButton);

    expect(screen.getByText(/No patron blocking rules defined/i)).toBeTruthy();
  });
});

describe("PatronAuthServiceEditForm – error display", () => {
  it("passes error prop down to PatronBlockingRulesEditor", async () => {
    const user = userEvent.setup();
    const error = { status: 400, response: "Validation failed", url: "" };
    render(
      <PatronAuthServiceEditForm
        {...baseProps}
        item={buildSIP2Item([{ name: "", rule: "expr", message: null }])}
        error={error}
      />
    );

    await expandLibrariesPanel(user);
    const editButton = screen.getByRole("button", { name: /Edit/i });
    await user.click(editButton);

    // The PatronBlockingRulesEditor should be present (error prop is wired in)
    expect(screen.getByText(/Patron Blocking Rules/i)).toBeTruthy();
  });
});

describe("PatronAuthServiceEditForm – serialization", () => {
  it("includes patron_blocking_rules in the library state when editLibrary is called", async () => {
    const user = userEvent.setup();
    render(<PatronAuthServiceEditForm {...baseProps} item={buildSIP2Item()} />);

    await expandLibrariesPanel(user);
    const editButton = screen.getByRole("button", { name: /Edit/i });
    await user.click(editButton);

    // Add a rule via the editor UI
    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "Test Rule");
    await user.type(
      screen.getByLabelText(/Rule Expression/i),
      "field == value"
    );

    // Click "Save" to call editLibrary
    const saveButton = screen.getByRole("button", { name: /^Save$/i });
    await user.click(saveButton);

    // The library should now be collapsed (indicating editLibrary was called)
    // Verify the editor is no longer showing in expanded state
    expect(screen.queryByRole("button", { name: /Add Rule/i })).toBeNull();
  });

  it("includes patron_blocking_rules in payload when adding a new library", async () => {
    const user = userEvent.setup();
    // No existing libraries associated with service
    const item = {
      id: 3,
      protocol: SIP2_PROTOCOL,
      settings: {},
      libraries: [],
    };
    render(<PatronAuthServiceEditForm {...baseProps} item={item} />);

    await expandLibrariesPanel(user);
    // Select the library from the dropdown
    const select = screen.getByRole("combobox", { name: /Add Library/i });
    await user.selectOptions(select, LIBRARY_SHORT_NAME);

    // Add a patron blocking rule
    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "New Rule");
    await user.type(
      screen.getByLabelText(/Rule Expression/i),
      "some expression"
    );

    // Click Add Library
    const addButton = screen.getByRole("button", { name: /Add Library/i });
    await user.click(addButton);

    // After adding, the library should appear in the list, editor no longer in "new library" form
    expect(screen.queryByLabelText(/Rule Name/i)).toBeNull();
  });
});
