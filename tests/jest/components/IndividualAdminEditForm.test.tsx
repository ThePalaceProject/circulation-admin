import * as React from "react";
import { installFormDataShim } from "../testUtils/formDataShim";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IndividualAdminEditForm from "../../../src/components/IndividualAdminEditForm";
import renderWithContext from "../testUtils/renderWithContext";
import { AdminRoleData, ConfigurationSettings } from "../../../src/interfaces";

describe("IndividualAdminEditForm", () => {
  it("clears the role checkboxes after save", async () => {
    const user = userEvent.setup();

    const appConfigSettings: Partial<ConfigurationSettings> = {
      csrfToken: "",
      featureFlags: {},
      roles: [
        {
          role: "system",
        },
      ],
    };

    const props = {
      data: {
        allLibraries: [
          {
            name: "Alpha",
            short_name: "alpha",
            uuid: "a3247ce9-9639-426b-bb09-82e9cb4cf44b",
          },
          {
            name: "Beta",
            short_name: "beta",
            uuid: "da80cd40-7a87-41db-a789-5f1e87732aeb",
          },
          {
            name: "Gamma",
            short_name: "gamma",
            uuid: "15f32675-73f5-46f3-91f4-837b933bc7b1",
          },
        ],
      },
      disabled: false,
      listDataKey: "",
      urlBase: "",
    };

    const { rerender } = renderWithContext(
      <IndividualAdminEditForm {...props} />,
      appConfigSettings
    );

    const systemAdminCheckbox = screen.getByRole("checkbox", {
      name: /^system admin$/i,
    });

    const allAdminCheckbox = screen.getByRole("checkbox", {
      name: /^administrator$/i,
    });

    const allUserCheckbox = screen.getByRole("checkbox", {
      name: /^user$/i,
    });

    const alphaAdminCheckbox = screen.getByRole("checkbox", {
      name: /administrator of alpha/i,
    });

    const alphaUserCheckbox = screen.getByRole("checkbox", {
      name: /user of alpha/i,
    });

    const betaAdminCheckbox = screen.getByRole("checkbox", {
      name: /administrator of beta/i,
    });

    const betaUserCheckbox = screen.getByRole("checkbox", {
      name: /user of beta/i,
    });

    const gammaAdminCheckbox = screen.getByRole("checkbox", {
      name: /administrator of gamma/i,
    });

    const gammaUserCheckbox = screen.getByRole("checkbox", {
      name: /user of gamma/i,
    });

    expect(systemAdminCheckbox).not.toBeChecked();

    await user.click(systemAdminCheckbox);

    expect(systemAdminCheckbox).toBeChecked();

    expect(allAdminCheckbox).toBeChecked();
    expect(allUserCheckbox).toBeChecked();

    expect(alphaAdminCheckbox).toBeChecked();
    expect(alphaUserCheckbox).toBeChecked();

    expect(betaAdminCheckbox).toBeChecked();
    expect(betaUserCheckbox).toBeChecked();

    expect(gammaAdminCheckbox).toBeChecked();
    expect(gammaUserCheckbox).toBeChecked();

    const nextProps = {
      ...props,
      // Existence of the responseBody prop indicates that the form was just saved.
      responseBody: "some response",
    };

    rerender(<IndividualAdminEditForm {...nextProps} />);

    expect(systemAdminCheckbox).not.toBeChecked();

    expect(allAdminCheckbox).not.toBeChecked();
    expect(allUserCheckbox).not.toBeChecked();

    expect(alphaAdminCheckbox).not.toBeChecked();
    expect(alphaUserCheckbox).not.toBeChecked();

    expect(betaAdminCheckbox).not.toBeChecked();
    expect(betaUserCheckbox).not.toBeChecked();

    expect(gammaAdminCheckbox).not.toBeChecked();
    expect(gammaUserCheckbox).not.toBeChecked();
  });
});

// ── Migrated from the legacy enzyme suite ─────────────────────────────────────
// (src/components/__tests__/IndividualAdminEditForm-test.tsx). Assertions on
// props (checked/disabled/value) are rewritten as assertions on the rendered
// checkboxes and inputs; role-change behavior is driven with real clicks.
describe("IndividualAdminEditForm - legacy behaviors", () => {
  // The reusable-components `Form` builds `new FormData(formElement)` on
  // submit, which the unit jsdom env's undici FormData rejects; install the
  // shared shim that reads the form's successful controls.
  installFormDataShim();
  const adminData = { email: "test@nypl.org", password: "password" };
  const allLibraries = [
    { name: "NYPL", short_name: "nypl" },
    { name: "BPL", short_name: "bpl" },
  ];
  const baseData = { individualAdmins: [adminData], allLibraries };

  const systemAdmin: AdminRoleData[] = [{ role: "system" }];
  const managerAll: AdminRoleData[] = [{ role: "manager-all" }];
  const librarianAll: AdminRoleData[] = [{ role: "librarian-all" }];
  const nyplManager: AdminRoleData[] = [{ role: "manager", library: "nypl" }];
  const bplManager: AdminRoleData[] = [{ role: "manager", library: "bpl" }];
  const nyplLibrarian: AdminRoleData[] = [
    { role: "librarian", library: "nypl" },
  ];
  const bplLibrarian: AdminRoleData[] = [{ role: "librarian", library: "bpl" }];
  const nyplManagerLibrarianAll: AdminRoleData[] = [
    { role: "manager", library: "nypl" },
    { role: "librarian-all" },
  ];

  const configFor = (
    roles: AdminRoleData[],
    settingUp = false
  ): Partial<ConfigurationSettings> => ({
    csrfToken: "",
    featureFlags: {},
    roles,
    settingUp,
  });

  const systemConfig = configFor(systemAdmin);

  let save: jest.Mock;

  const baseProps = (overrides: Record<string, any> = {}) => ({
    data: baseData,
    disabled: false,
    save,
    urlBase: "url base",
    listDataKey: "admins",
    ...overrides,
  });

  const renderForm = (
    overrides: Record<string, any> = {},
    config: Partial<ConfigurationSettings> = systemConfig
  ) =>
    renderWithContext(
      <IndividualAdminEditForm {...(baseProps(overrides) as any)} />,
      config
    );

  const roleNames: Record<string, RegExp> = {
    system: /^system admin$/i,
    "manager-all": /^administrator$/i,
    "librarian-all": /^user$/i,
    "manager-nypl": /administrator of nypl/i,
    "manager-bpl": /administrator of bpl/i,
    "librarian-nypl": /user of nypl/i,
    "librarian-bpl": /user of bpl/i,
  };
  const allRoles = Object.keys(roleNames);

  const roleCheckbox = (role: string) =>
    screen.getByRole("checkbox", { name: roleNames[role] });

  const expectRoles = (expected: string[]) => {
    for (const role of allRoles) {
      if (expected.includes(role)) {
        expect(roleCheckbox(role)).toBeChecked();
      } else {
        expect(roleCheckbox(role)).not.toBeChecked();
      }
    }
  };

  // A fresh item object each time, so the component's
  // UNSAFE_componentWillReceiveProps resets its admin state from the new roles.
  const setRoles = (rerender: (ui: React.ReactElement) => void, roles) =>
    rerender(
      <IndividualAdminEditForm
        {...(baseProps({ item: { ...adminData, roles } }) as any)}
      />
    );

  const saveButton = (container: HTMLElement) =>
    container.querySelector<HTMLButtonElement>("button:not(.panel-heading)");

  beforeEach(() => {
    save = jest.fn().mockResolvedValue(undefined);
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the email field, read-only with a value when editing an admin", () => {
    const { container, rerender } = renderForm();
    let email = container.querySelector<HTMLInputElement>(
      'input[name="email"]'
    );
    expect(email).not.toBeNull();
    expect(email.value).toBe("");

    rerender(
      <IndividualAdminEditForm {...(baseProps({ item: adminData }) as any)} />
    );
    email = container.querySelector<HTMLInputElement>('input[name="email"]');
    expect(email.value).toBe("test@nypl.org");
    expect(email.readOnly).toBe(true);
  });

  it("requires the email and password fields", () => {
    const { container } = renderForm();
    expect(container.querySelectorAll(".required-field")).toHaveLength(2);
    expect(container.innerHTML).not.toContain("(Optional)");
  });

  it("shows the password field only when the editor may change it", () => {
    const passwordShownFor = (
      targetRoles: AdminRoleData[] | undefined,
      editingRoles: AdminRoleData[]
    ) => {
      const overrides = targetRoles ? { item: { roles: targetRoles } } : {};
      const { container, unmount } = renderForm(
        overrides,
        configFor(editingRoles)
      );
      const shown = !!container.querySelector('input[name="password"]');
      unmount();
      return shown;
    };

    // No target admin at all → always editable.
    expect(passwordShownFor(undefined, systemAdmin)).toBe(true);
    // Target has no roles → editable iff the editor manages some library.
    expect(passwordShownFor([], managerAll)).toBe(true);
    expect(passwordShownFor([], librarianAll)).toBe(false);
    // Target is a system admin → editable only by a system admin.
    expect(passwordShownFor(systemAdmin, systemAdmin)).toBe(true);
    expect(passwordShownFor(systemAdmin, managerAll)).toBe(false);
    // Target is a sitewide manager → editable only by a sitewide manager.
    expect(passwordShownFor(managerAll, managerAll)).toBe(true);
    expect(passwordShownFor(managerAll, librarianAll)).toBe(false);
    // Target manages a single library → editable by a manager of that library.
    expect(passwordShownFor(nyplManager, nyplManager)).toBe(true);
    expect(passwordShownFor(nyplManager, bplManager)).toBe(false);
  });

  it("has a save button only when a save function is supplied", () => {
    const withSave = renderForm();
    expect(saveButton(withSave.container)).not.toBeNull();
    withSave.unmount();

    const withoutSave = renderForm({ save: undefined });
    expect(saveButton(withoutSave.container)).toBeNull();
  });

  it("does not render role checkboxes when setting up the first admin", () => {
    renderForm({}, configFor(systemAdmin, true));
    for (const role of [
      "system",
      "manager-all",
      "librarian-all",
      "manager-nypl",
      "librarian-nypl",
    ]) {
      expect(
        screen.queryByRole("checkbox", { name: roleNames[role] })
      ).toBeNull();
    }
  });

  // ── Disabled state (isDisabled) ──────────────────────────────────────────────

  it("disables every role checkbox when the form is disabled", () => {
    renderForm({ disabled: true });
    expect(roleCheckbox("system")).toBeDisabled();
    expect(roleCheckbox("manager-all")).toBeDisabled();
    expect(roleCheckbox("manager-nypl")).toBeDisabled();
  });

  it("lets a system-admin editor edit every role", () => {
    renderForm();
    for (const role of allRoles) {
      expect(roleCheckbox(role)).toBeEnabled();
    }
  });

  it("restricts a sitewide-manager editor from the system-admin role", () => {
    renderForm({}, configFor(managerAll));
    expect(roleCheckbox("system")).toBeDisabled();
    expect(roleCheckbox("manager-all")).toBeEnabled();
    expect(roleCheckbox("librarian-all")).toBeEnabled();
    expect(roleCheckbox("manager-nypl")).toBeEnabled();
  });

  it("restricts a sitewide-librarian editor from the manager roles", () => {
    renderForm({}, configFor(librarianAll));
    expect(roleCheckbox("system")).toBeDisabled();
    expect(roleCheckbox("manager-all")).toBeDisabled();
    expect(roleCheckbox("librarian-all")).toBeDisabled();
  });

  it("restricts a single-library manager editor to that library", () => {
    renderForm({}, configFor(nyplManager));
    expect(roleCheckbox("manager-all")).toBeDisabled();
    expect(roleCheckbox("manager-nypl")).toBeEnabled();
    expect(roleCheckbox("manager-bpl")).toBeDisabled();
    expect(roleCheckbox("librarian-nypl")).toBeEnabled();
    expect(roleCheckbox("librarian-bpl")).toBeDisabled();
  });

  it("disables a per-library box when a sitewide role is selected but the editor is not sitewide", () => {
    const { rerender } = renderForm(
      { item: { ...adminData, roles: managerAll } },
      configFor(nyplManager)
    );
    // manager-all is selected on the target; a non-sitewide editor can't touch it.
    expect(roleCheckbox("manager-nypl")).toBeDisabled();
    expect(roleCheckbox("manager-bpl")).toBeDisabled();

    rerender(
      <IndividualAdminEditForm
        {...(baseProps({ item: { ...adminData, roles: librarianAll } }) as any)}
      />
    );
    expect(roleCheckbox("librarian-nypl")).toBeDisabled();
    expect(roleCheckbox("librarian-bpl")).toBeDisabled();
  });

  it("also restricts an editor when the target admin is a system admin", () => {
    renderForm(
      { item: { ...adminData, roles: systemAdmin } },
      configFor(managerAll)
    );
    // isSelected("system") is true, so a non-system editor can edit nothing.
    expect(roleCheckbox("manager-all")).toBeDisabled();
  });

  // ── Role-change behavior (handleRoleChange) ──────────────────────────────────

  it("changes the system admin role", async () => {
    const user = userEvent.setup();
    renderForm({ item: { ...adminData, roles: nyplManagerLibrarianAll } });

    await user.click(roleCheckbox("system"));
    expectRoles(allRoles);

    await user.click(roleCheckbox("system"));
    expectRoles([]);
  });

  it("changes the manager-all role", async () => {
    const user = userEvent.setup();
    const { rerender } = renderForm();

    await user.click(roleCheckbox("manager-all"));
    expectRoles([
      "manager-all",
      "librarian-all",
      "manager-nypl",
      "manager-bpl",
      "librarian-nypl",
      "librarian-bpl",
    ]);

    await user.click(roleCheckbox("manager-all"));
    expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);

    setRoles(rerender, systemAdmin);
    await user.click(roleCheckbox("manager-all"));
    expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);

    setRoles(rerender, nyplManagerLibrarianAll);
    await user.click(roleCheckbox("manager-all"));
    expectRoles([
      "manager-all",
      "librarian-all",
      "manager-nypl",
      "manager-bpl",
      "librarian-nypl",
      "librarian-bpl",
    ]);
  });

  it("changes the librarian-all role", async () => {
    const user = userEvent.setup();
    const { rerender } = renderForm();

    await user.click(roleCheckbox("librarian-all"));
    expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);

    await user.click(roleCheckbox("librarian-all"));
    expectRoles([]);

    setRoles(rerender, systemAdmin);
    await user.click(roleCheckbox("librarian-all"));
    expectRoles([]);

    setRoles(rerender, nyplManagerLibrarianAll);
    await user.click(roleCheckbox("librarian-all"));
    expectRoles(["manager-nypl", "librarian-nypl"]);

    setRoles(rerender, nyplLibrarian);
    await user.click(roleCheckbox("librarian-all"));
    expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);
  });

  it("changes the manager role for each library", async () => {
    const user = userEvent.setup();
    const { rerender } = renderForm();

    await user.click(roleCheckbox("manager-nypl"));
    expectRoles(["manager-nypl", "librarian-nypl"]);

    await user.click(roleCheckbox("manager-nypl"));
    expectRoles(["librarian-nypl"]);

    setRoles(rerender, systemAdmin);
    await user.click(roleCheckbox("manager-nypl"));
    expectRoles([
      "librarian-all",
      "manager-bpl",
      "librarian-nypl",
      "librarian-bpl",
    ]);

    setRoles(rerender, managerAll);
    await user.click(roleCheckbox("manager-nypl"));
    expectRoles([
      "librarian-all",
      "manager-bpl",
      "librarian-nypl",
      "librarian-bpl",
    ]);

    setRoles(rerender, nyplManagerLibrarianAll);
    await user.click(roleCheckbox("manager-nypl"));
    expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);

    setRoles(rerender, nyplLibrarian);
    await user.click(roleCheckbox("manager-nypl"));
    expectRoles(["manager-nypl", "librarian-nypl"]);

    setRoles(rerender, bplLibrarian);
    await user.click(roleCheckbox("manager-nypl"));
    expectRoles(["manager-nypl", "librarian-nypl", "librarian-bpl"]);
  });

  it("changes the librarian role for each library", async () => {
    const user = userEvent.setup();
    const { rerender } = renderForm();

    await user.click(roleCheckbox("librarian-nypl"));
    expectRoles(["librarian-nypl"]);

    await user.click(roleCheckbox("librarian-nypl"));
    expectRoles([]);

    setRoles(rerender, systemAdmin);
    await user.click(roleCheckbox("librarian-nypl"));
    expectRoles(["manager-bpl", "librarian-bpl"]);

    setRoles(rerender, managerAll);
    await user.click(roleCheckbox("librarian-nypl"));
    expectRoles(["manager-bpl", "librarian-bpl"]);

    setRoles(rerender, nyplManagerLibrarianAll);
    await user.click(roleCheckbox("librarian-nypl"));
    expectRoles(["librarian-bpl"]);

    setRoles(rerender, bplLibrarian);
    await user.click(roleCheckbox("librarian-nypl"));
    expectRoles(["librarian-nypl", "librarian-bpl"]);
  });

  // ── Submission (submit / handleData) ─────────────────────────────────────────

  it("calls save when the save button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = renderForm();
    await user.click(saveButton(container));
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("submits the entered email, password, and selected roles", async () => {
    const user = userEvent.setup();
    const { container } = renderForm();

    await user.type(
      container.querySelector<HTMLInputElement>('input[name="email"]'),
      "newEmail"
    );
    await user.type(
      container.querySelector<HTMLInputElement>('input[name="password"]'),
      "newPassword"
    );
    await user.click(roleCheckbox("librarian-all"));
    await user.click(roleCheckbox("manager-nypl"));

    await user.click(saveButton(container));

    expect(save).toHaveBeenCalledTimes(1);
    const formData = save.mock.calls[0][0];
    expect(formData.get("email")).toBe("newEmail");
    expect(formData.get("password")).toBe("newPassword");
    expect(formData.get("roles")).toBe(
      JSON.stringify([
        { role: "librarian-all" },
        { role: "manager", library: "nypl" },
      ])
    );
  });

  it("submits only a system-admin role when setting up the first admin", async () => {
    const user = userEvent.setup();
    const { container } = renderForm({}, configFor(systemAdmin, true));

    await user.type(
      container.querySelector<HTMLInputElement>('input[name="email"]'),
      "newEmail"
    );
    await user.type(
      container.querySelector<HTMLInputElement>('input[name="password"]'),
      "newPassword"
    );

    await user.click(saveButton(container));

    expect(save).toHaveBeenCalledTimes(1);
    const formData = save.mock.calls[0][0];
    expect(formData.get("email")).toBe("newEmail");
    expect(formData.get("password")).toBe("newPassword");
    expect(formData.get("roles")).toBe(JSON.stringify([{ role: "system" }]));
  });

  it("clears the form after a successful save", async () => {
    const user = userEvent.setup();
    const { container, rerender } = renderForm();
    const email = () =>
      container.querySelector<HTMLInputElement>('input[name="email"]');

    await user.type(email(), "newEmail");
    expect(email().value).toBe("newEmail");

    // The presence of responseBody (and no error) signals a successful save.
    rerender(
      <IndividualAdminEditForm
        {...(baseProps({ responseBody: "new admin" }) as any)}
      />
    );
    expect(email().value).toBe("");
  });

  it("does not clear the form when there is an error", async () => {
    const user = userEvent.setup();
    const { container, rerender } = renderForm();
    const email = () =>
      container.querySelector<HTMLInputElement>('input[name="email"]');

    await user.type(email(), "newEmail");
    expect(email().value).toBe("newEmail");

    rerender(
      <IndividualAdminEditForm
        {...(baseProps({ fetchError: "ERROR" }) as any)}
      />
    );
    expect(email().value).toBe("newEmail");
  });
});
