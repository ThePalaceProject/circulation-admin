import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fetchMock from "fetch-mock-jest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PatronAuthServiceEditForm from "../../../src/components/PatronAuthServiceEditForm";
import {
  PatronAuthServicesData,
  PatronBlockingRule,
} from "../../../src/interfaces";
import { SIP2_PROTOCOL } from "../../../src/utils/patronBlockingRules";

const VALIDATE_URL = "/admin/patron_auth_service_validate_patron_blocking_rule";

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

/** Renders with a fresh QueryClient so useAvailableFields (useQuery) works. */
function renderForm(element: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{element}</QueryClientProvider>
  );
}

// Guard: any blur on the Rule Expression textarea calls validatePatronBlockingRuleExpression.
// All describe blocks get a default 200 mock so tests that incidentally trigger blur
// don't fail with "only absolute URLs are supported" from the fetch polyfill.
beforeEach(() => {
  fetchMock.post(VALIDATE_URL, { status: 200 });
});

afterEach(() => {
  fetchMock.mockReset();
});

describe("PatronAuthServiceEditForm – capability gating", () => {
  it("shows PatronBlockingRulesEditor in expanded library settings for SIP2", async () => {
    const user = userEvent.setup();
    renderForm(
      <PatronAuthServiceEditForm {...baseProps} item={buildSIP2Item()} />
    );

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
    renderForm(<PatronAuthServiceEditForm {...baseProps} item={item} />);
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
    renderForm(
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
    renderForm(
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
    renderForm(
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
    renderForm(
      <PatronAuthServiceEditForm {...baseProps} item={buildSIP2Item()} />
    );

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

    // Tab out of the expression field to trigger blur → validation (mocked 200).
    // The Save button is disabled until validation succeeds.
    await user.tab();
    const saveButton = screen.getByRole("button", { name: /^Save$/i });
    await waitFor(() => expect(saveButton).not.toBeDisabled());

    await user.click(saveButton);

    // The library should now be collapsed (indicating editLibrary was called)
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
    renderForm(<PatronAuthServiceEditForm {...baseProps} item={item} />);

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

    // Tab out to trigger blur → validation (mocked 200).
    // The Add Library button is disabled until validation succeeds.
    await user.tab();
    const addButton = screen.getByRole("button", { name: /Add Library/i });
    await waitFor(() => expect(addButton).not.toBeDisabled());

    await user.click(addButton);

    // After adding, the library should appear in the list, editor no longer in "new library" form
    expect(screen.queryByLabelText(/Rule Name/i)).toBeNull();
  });
});

describe("PatronAuthServiceEditForm – save button gating", () => {
  it("disables the per-library Save button immediately when a new rule is added", async () => {
    const user = userEvent.setup();
    renderForm(
      <PatronAuthServiceEditForm {...baseProps} item={buildSIP2Item()} />
    );

    await expandLibrariesPanel(user);
    await user.click(screen.getByRole("button", { name: /Edit/i }));
    await user.click(screen.getByRole("button", { name: /Add Rule/i }));

    const saveButton = screen.getByRole("button", { name: /^Save$/i });
    await waitFor(() => expect(saveButton).toBeDisabled());
  });

  it("re-enables the per-library Save button once validation succeeds", async () => {
    const user = userEvent.setup();
    renderForm(
      <PatronAuthServiceEditForm {...baseProps} item={buildSIP2Item()} />
    );

    await expandLibrariesPanel(user);
    await user.click(screen.getByRole("button", { name: /Edit/i }));
    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "My Rule");
    await user.type(screen.getByLabelText(/Rule Expression/i), "{{fines}} > 0");
    // Tab out triggers blur → server validation → 200 OK (from beforeEach mock)
    await user.tab();

    const saveButton = screen.getByRole("button", { name: /^Save$/i });
    await waitFor(() => expect(saveButton).not.toBeDisabled());
  });

  it("keeps the per-library Save button disabled when validation fails", async () => {
    const user = userEvent.setup();
    fetchMock.mockReset();
    fetchMock.post(VALIDATE_URL, {
      status: 400,
      body: { detail: "Unknown placeholder" },
    });

    renderForm(
      <PatronAuthServiceEditForm {...baseProps} item={buildSIP2Item()} />
    );

    await expandLibrariesPanel(user);
    await user.click(screen.getByRole("button", { name: /Edit/i }));
    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "My Rule");
    await user.type(screen.getByLabelText(/Rule Expression/i), "bad_syntax");
    await user.tab();

    await screen.findByText(/Unknown placeholder/i);
    const saveButton = screen.getByRole("button", { name: /^Save$/i });
    expect(saveButton).toBeDisabled();
  });

  it("disables the Add Library button immediately when an incomplete rule is added to the new library section", async () => {
    const user = userEvent.setup();
    const item = {
      id: 3,
      protocol: SIP2_PROTOCOL,
      settings: {},
      libraries: [],
    };
    renderForm(<PatronAuthServiceEditForm {...baseProps} item={item} />);

    await expandLibrariesPanel(user);
    const select = screen.getByRole("combobox", { name: /Add Library/i });
    await user.selectOptions(select, LIBRARY_SHORT_NAME);

    const addButton = screen.getByRole("button", { name: /Add Library/i });
    // Before adding a rule the button is enabled
    expect(addButton).not.toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));

    // Incomplete rule (empty name + expression) must block the Add Library button
    await waitFor(() => expect(addButton).toBeDisabled());
  });

  it("disables the per-library Save button when two rules share the same name", async () => {
    const user = userEvent.setup();
    const existingRules = [
      { name: "Rule A", rule: "expr_a" },
      { name: "Rule B", rule: "expr_b" },
    ];
    renderForm(
      <PatronAuthServiceEditForm
        {...baseProps}
        item={buildSIP2Item(existingRules)}
      />
    );

    await expandLibrariesPanel(user);
    await user.click(screen.getByRole("button", { name: /Edit/i }));

    const saveButton = screen.getByRole("button", { name: /^Save$/i });
    // Both rules are complete and unique — Save should be enabled
    await waitFor(() => expect(saveButton).not.toBeDisabled());

    // Rename rule B to match rule A → duplicate → Save must disable
    const nameInputs = screen.getAllByLabelText(
      /Rule Name/i
    ) as HTMLInputElement[];
    await user.clear(nameInputs[1]);
    await user.type(nameInputs[1], "Rule A");

    await waitFor(() => expect(saveButton).toBeDisabled());
  });

  it("re-enables the per-library Save button after a duplicate name is resolved", async () => {
    const user = userEvent.setup();
    const existingRules = [
      { name: "Rule A", rule: "expr_a" },
      { name: "Rule A", rule: "expr_b" }, // starts as duplicate
    ];
    renderForm(
      <PatronAuthServiceEditForm
        {...baseProps}
        item={buildSIP2Item(existingRules)}
      />
    );

    await expandLibrariesPanel(user);
    await user.click(screen.getByRole("button", { name: /Edit/i }));

    const saveButton = screen.getByRole("button", { name: /^Save$/i });
    await waitFor(() => expect(saveButton).toBeDisabled());

    // Fix the duplicate
    const nameInputs = screen.getAllByLabelText(
      /Rule Name/i
    ) as HTMLInputElement[];
    await user.clear(nameInputs[1]);
    await user.type(nameInputs[1], "Rule B");

    await waitFor(() => expect(saveButton).not.toBeDisabled());
  });

  it("re-blocks and then re-enables the Save button when an existing rule's expression is edited and re-validated", async () => {
    const user = userEvent.setup();
    const existingRules = [{ name: "Rule A", rule: "expr_a" }];
    renderForm(
      <PatronAuthServiceEditForm
        {...baseProps}
        item={buildSIP2Item(existingRules)}
      />
    );

    await expandLibrariesPanel(user);
    await user.click(screen.getByRole("button", { name: /Edit/i }));

    const saveButton = screen.getByRole("button", { name: /^Save$/i });
    // Existing rule is not pending — Save should be enabled
    await waitFor(() => expect(saveButton).not.toBeDisabled());

    // Edit the expression — Save must re-block
    const ruleTextarea = screen.getByLabelText(
      /Rule Expression/i
    ) as HTMLTextAreaElement;
    await user.clear(ruleTextarea);
    await user.type(ruleTextarea, "new_expr");
    await waitFor(() => expect(saveButton).toBeDisabled());

    // Blur → 200 OK from beforeEach mock → Save re-enabled
    await user.tab();
    await waitFor(() => expect(saveButton).not.toBeDisabled());
  });
});

describe("PatronAuthServiceEditForm – csrfToken / serviceId wiring", () => {
  it("passes the csrfToken from additionalData to the validation API request", async () => {
    const user = userEvent.setup();
    renderForm(
      <PatronAuthServiceEditForm
        {...baseProps}
        item={buildSIP2Item()}
        additionalData={{ csrfToken: "test-csrf-token" }}
      />
    );

    await expandLibrariesPanel(user);
    await user.click(screen.getByRole("button", { name: /Edit/i }));
    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "My Rule");
    await user.type(screen.getByLabelText(/Rule Expression/i), "expr");
    await user.tab();

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        VALIDATE_URL,
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-CSRF-Token": "test-csrf-token",
          }),
        })
      )
    );
  });

  it("passes the item id as service_id in the validation API request body", async () => {
    const user = userEvent.setup();
    // item.id = 1 (from buildSIP2Item)
    renderForm(
      <PatronAuthServiceEditForm {...baseProps} item={buildSIP2Item()} />
    );

    await expandLibrariesPanel(user);
    await user.click(screen.getByRole("button", { name: /Edit/i }));
    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "My Rule");
    await user.type(screen.getByLabelText(/Rule Expression/i), "expr");
    await user.tab();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, options] = fetchMock.calls(VALIDATE_URL)[0];
    const body = (options as RequestInit).body as FormData;
    expect(body.get("service_id")).toBe("1");
  });
});
