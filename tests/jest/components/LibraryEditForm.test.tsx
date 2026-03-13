import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LibraryEditForm from "../../../src/components/config/LibraryEditForm";

// ── Mock complex subcomponents so tests don't need their full dep trees ────────

jest.mock("../../../src/components/config/ProtocolFormField", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  const ProtocolFormField = React.forwardRef(function ProtocolFormFieldMock(
    props: any,
    _ref: any
  ) {
    return (
      <div
        data-testid={`protocol-form-field-${props.setting?.key}`}
        data-read-only={String(Boolean(props.readOnly))}
        data-value={props.value || ""}
      >
        <input
          data-setting-key={props.setting?.key}
          name={props.setting?.key}
          defaultValue={props.value || ""}
          aria-label={props.setting?.label}
          readOnly={props.readOnly}
        />
      </div>
    );
  });
  return ProtocolFormField;
});

jest.mock("../../../src/components/shared/PairedMenus", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  function PairedMenusMock(props: any) {
    return (
      <div
        data-testid="paired-menus"
        data-read-only={String(Boolean(props.readOnly))}
      />
    );
  }
  return PairedMenusMock;
});

jest.mock("../../../src/components/announcements/AnnouncementsSection", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  class AnnouncementsSectionMock extends React.Component<any> {
    getValue() {
      return [];
    }
    render() {
      return (
        <div
          data-testid="announcements-section"
          data-setting-key={this.props.setting?.key}
        />
      );
    }
  }
  return AnnouncementsSectionMock;
});

// ── Fixtures ──────────────────────────────────────────────────────────────────
const libraryData = {
  uuid: "uuid",
  name: "name",
  short_name: "short_name",
  settings: {
    "privacy-policy": "http://privacy",
    copyright: "http://copyright",
    featured_lane_size: "20",
    announcements:
      '[{"content": "Announcement #1", "start": "2020-06-15", "finish": "2020-08-15", "id": "1"}]',
  },
};

const settingFields = [
  { key: "name", label: "Name", category: "Basic Information", level: 3 },
  {
    key: "short_name",
    label: "Short Name",
    category: "Basic Information",
    level: 3,
  },
  { key: "privacy-policy", label: "Privacy Policy", category: "Links" },
  { key: "copyright", label: "Copyright", category: "Links" },
  { key: "logo", label: "Logo", category: "Client Interface Customization" },
  {
    key: "large_collections",
    label: "Languages",
    category: "Languages",
  },
  {
    key: "featured_lane_size",
    label: "Maximum number of books in the 'featured' lanes",
    category: "Lanes & Filters",
    type: "number",
  },
  {
    key: "service_area",
    label: "Service Area",
    category: "Geographic Areas",
    type: "list",
  },
  {
    key: "announcements",
    label: "Announcements",
    category: "Announcements",
    type: "announcements",
  },
];

function renderForm(
  props: Partial<React.ComponentProps<typeof LibraryEditForm>> = {}
) {
  const save = jest.fn();
  const defaultProps = {
    data: { libraries: [libraryData], settings: settingFields },
    disabled: false,
    save,
    urlBase: "url base",
    listDataKey: "libraries",
    adminLevel: 3,
  };
  const result = render(<LibraryEditForm {...defaultProps} {...props} />);
  return { save, ...result };
}

describe("LibraryEditForm", () => {
  it("renders hidden uuid input (empty when no item, filled when item provided)", () => {
    const { rerender } = renderForm();
    const uuidInput = document.querySelector(
      "input[name='uuid']"
    ) as HTMLInputElement;
    expect(uuidInput).toBeTruthy();
    expect(uuidInput.value).toBeFalsy();

    rerender(
      <LibraryEditForm
        data={{ libraries: [libraryData], settings: settingFields }}
        disabled={false}
        save={jest.fn()}
        urlBase="url base"
        listDataKey="libraries"
        adminLevel={3}
        item={libraryData}
      />
    );
    const uuidInputFilled = document.querySelector(
      "input[name='uuid']"
    ) as HTMLInputElement;
    expect(uuidInputFilled.value).toBe("uuid");
  });

  it("renders ProtocolFormField for each non-skipped, non-announcements setting", () => {
    renderForm();
    // 9 settings: 8 use ProtocolFormField, 1 (announcements) uses AnnouncementsSection
    const fields = document.querySelectorAll(
      "[data-testid^='protocol-form-field-']"
    );
    expect(fields.length).toBe(8);
  });

  it("does not render settings with the skip attribute", () => {
    const settingsWithSkip = [
      ...settingFields,
      { key: "skip-me", label: "Skip this!", skip: true, category: "Links" },
    ];
    renderForm({
      data: { libraries: [libraryData], settings: settingsWithSkip },
    });
    // skip-me should not be rendered
    expect(
      document.querySelector("[data-testid='protocol-form-field-skip-me']")
    ).toBeNull();
    // Original 8 ProtocolFormField mocks should still be there (announcements uses AnnouncementsSection)
    const fields = document.querySelectorAll(
      "[data-testid^='protocol-form-field-']"
    );
    expect(fields.length).toBe(8);
  });

  it("passes the value from item.settings to ProtocolFormField for settings fields", () => {
    renderForm({ item: libraryData });
    const privacyField = document.querySelector(
      "[data-testid='protocol-form-field-privacy-policy']"
    );
    expect(privacyField).toBeTruthy();
    expect(privacyField.getAttribute("data-value")).toBe("http://privacy");

    const copyrightField = document.querySelector(
      "[data-testid='protocol-form-field-copyright']"
    );
    expect(copyrightField.getAttribute("data-value")).toBe("http://copyright");
  });

  it("renders the AnnouncementsSection for the announcements setting type", () => {
    renderForm({ item: libraryData });
    const announcementsSection = document.querySelector(
      "[data-testid='announcements-section']"
    );
    expect(announcementsSection).toBeTruthy();
    expect(announcementsSection.getAttribute("data-setting-key")).toBe(
      "announcements"
    );
  });

  it("renders the PairedMenus component for paired settings", () => {
    const inputListSetting = {
      key: "inputList",
      label: "Input List",
      paired: "dropdown",
      options: [],
      default: ["opt_1"],
      level: 2,
      category: "Test",
    };
    const dropdownSetting = {
      key: "dropdown",
      label: "Dropdown List",
      options: [{ key: "opt_1", label: "Option 1" }],
      type: "select",
      level: 2,
      category: "Test",
      skip: true,
    };
    renderForm({
      data: {
        libraries: [libraryData],
        settings: [inputListSetting, dropdownSetting],
      },
    });
    const pairedMenus = document.querySelector("[data-testid='paired-menus']");
    expect(pairedMenus).toBeTruthy();
  });

  it("PairedMenus is read-only if admin level is insufficient", () => {
    const inputListSetting = {
      key: "inputList",
      label: "Input List",
      paired: "dropdown",
      options: [],
      default: ["opt_1"],
      level: 2,
      category: "Test",
    };
    const dropdownSetting = {
      key: "dropdown",
      label: "Dropdown List",
      options: [],
      type: "select",
      level: 2,
      category: "Test",
      skip: true,
    };
    const { rerender } = renderForm({
      adminLevel: 3,
      data: {
        libraries: [libraryData],
        settings: [inputListSetting, dropdownSetting],
      },
    });
    let pairedMenus = document.querySelector("[data-testid='paired-menus']");
    expect(pairedMenus.getAttribute("data-read-only")).toBe("false");

    rerender(
      <LibraryEditForm
        data={{
          libraries: [libraryData],
          settings: [inputListSetting, dropdownSetting],
        }}
        disabled={false}
        save={jest.fn()}
        urlBase="url base"
        listDataKey="libraries"
        adminLevel={1}
      />
    );
    pairedMenus = document.querySelector("[data-testid='paired-menus']");
    expect(pairedMenus.getAttribute("data-read-only")).toBe("true");
  });

  it("has a Submit button", () => {
    renderForm();
    const button = screen.getByRole("button", { name: /Submit/i });
    expect(button).toBeTruthy();
  });

  it("calls save when the Submit button is clicked", () => {
    const { save } = renderForm();
    const button = screen.getByRole("button", { name: /Submit/i });
    fireEvent.click(button);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("submits data: save is called with FormData containing uuid", () => {
    const { save } = renderForm({ item: libraryData });
    const button = screen.getByRole("button", { name: /Submit/i });
    fireEvent.click(button);
    expect(save).toHaveBeenCalledTimes(1);
    const formData: FormData = save.mock.calls[0][0];
    expect(formData.get("uuid")).toBe("uuid");
  });

  it("makes level-3 fields read-only for library manager (adminLevel=2)", () => {
    const sysAdminOnly = {
      key: "level-3-field",
      label: "Level 3 Field",
      category: "Basic Information",
      level: 3,
    };
    renderForm({
      adminLevel: 2,
      data: {
        libraries: [libraryData],
        settings: [...settingFields, sysAdminOnly],
      },
    });
    const level3Field = document.querySelector(
      "[data-testid='protocol-form-field-level-3-field']"
    );
    expect(level3Field?.getAttribute("data-read-only")).toBe("true");
  });

  it("makes level-2 and level-3 fields read-only for librarian (adminLevel=1)", () => {
    const sysAdminOnly = {
      key: "level-3-field",
      label: "Level 3 Field",
      category: "Basic Information",
      level: 3,
    };
    const libMgrField = {
      key: "level-2-field",
      label: "Level 2 Field",
      category: "Basic Information",
      level: 2,
    };
    renderForm({
      adminLevel: 1,
      data: {
        libraries: [libraryData],
        settings: [...settingFields, sysAdminOnly, libMgrField],
      },
    });
    const level3Field = document.querySelector(
      "[data-testid='protocol-form-field-level-3-field']"
    );
    const level2Field = document.querySelector(
      "[data-testid='protocol-form-field-level-2-field']"
    );
    expect(level3Field?.getAttribute("data-read-only")).toBe("true");
    expect(level2Field?.getAttribute("data-read-only")).toBe("true");
  });

  it("renders panels grouping settings by category", () => {
    renderForm();
    // Panels for: Basic Information, Links, Client Interface Customization,
    // Languages, Lanes & Filters, Geographic Areas, Announcements
    const panels = document.querySelectorAll(".panel");
    expect(panels.length).toBeGreaterThanOrEqual(7);
    // First panel is Basic Information (non-optional)
    const headings = Array.from(panels).map(
      (p) => p.querySelector(".panel-heading")?.textContent || ""
    );
    expect(headings.some((h) => h.includes("Basic Information"))).toBe(true);
    // Other panels are optional
    const optionalPanels = Array.from(panels).filter((p) =>
      (p.querySelector(".panel-heading")?.textContent || "").includes(
        "(Optional)"
      )
    );
    expect(optionalPanels.length).toBeGreaterThanOrEqual(6);
  });
});
