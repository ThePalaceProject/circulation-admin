import * as React from "react";
import { installFormDataShim } from "../testUtils/formDataShim";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LibraryEditForm, {
  LibraryEditFormProps,
} from "../../../src/components/LibraryEditForm";
import {
  LibrariesData,
  LibraryData,
  LibrarySettingField,
} from "../../../src/interfaces";
installFormDataShim();

describe("LibraryEditForm", () => {
  const libraryData = {
    uuid: "uuid",
    name: "name",
    short_name: "short_name",
    // prettier-ignore
    settings: {
      "privacy-policy": "http://privacy",
      "copyright": "http://copyright",
      "featured_lane_size": "20",
      "announcements": "[{\"content\": \"Announcement #1\", \"start\": \"2020-06-15\", \"finish\": \"2020-08-15\", \"id\": \"1\"}]"
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
    { key: "large_collections", label: "Languages", category: "Languages" },
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

  type Overrides = Partial<LibraryEditFormProps> & {
    fetchError?: string;
  };

  const makeData = (
    settings: LibrarySettingField[] = settingFields as LibrarySettingField[]
  ): LibrariesData => ({
    libraries: [libraryData as LibraryData],
    settings,
  });

  const makeProps = (overrides: Overrides = {}): LibraryEditFormProps => ({
    data: makeData(),
    disabled: false,
    save: jest.fn(),
    urlBase: "url base",
    listDataKey: "libraries",
    adminLevel: 3,
    ...(overrides as LibraryEditFormProps),
  });

  const renderForm = (overrides: Overrides = {}) => {
    const props = makeProps(overrides);
    const result = render(<LibraryEditForm {...props} />);
    const rerender = (nextOverrides: Overrides) =>
      result.rerender(<LibraryEditForm {...makeProps(nextOverrides)} />);
    return { ...result, rerender, props };
  };

  const inputByName = (container: HTMLElement, name: string) =>
    container.querySelector<HTMLInputElement>(`input[name="${name}"]`);

  const panelByName = (container: HTMLElement, name: string) =>
    Array.from(container.querySelectorAll<HTMLElement>(".panel")).find(
      (panel) =>
        panel.querySelector(".panel-heading")?.textContent?.startsWith(name) ??
        false
    );

  describe("rendering", () => {
    it("renders hidden uuid", () => {
      const { container, rerender } = renderForm();
      expect(inputByName(container, "uuid")).toHaveValue("");

      rerender({ item: libraryData as LibraryData });
      expect(inputByName(container, "uuid")).toHaveValue("uuid");
    });

    it("renders name", () => {
      const { container, rerender } = renderForm();
      expect(inputByName(container, "name")).toHaveValue("");

      rerender({ item: libraryData as LibraryData });
      expect(inputByName(container, "name")).toHaveValue("name");
    });

    it("renders short name", () => {
      const { container, rerender } = renderForm();
      expect(inputByName(container, "short_name")).toHaveValue("");

      rerender({ item: libraryData as LibraryData });
      expect(inputByName(container, "short_name")).toHaveValue("short_name");
    });

    it("renders settings", () => {
      const { container, rerender } = renderForm();
      expect(inputByName(container, "privacy-policy")).toHaveValue("");
      expect(inputByName(container, "copyright")).toHaveValue("");

      rerender({ item: libraryData as LibraryData });
      expect(inputByName(container, "privacy-policy")).toHaveValue(
        "http://privacy"
      );
      expect(inputByName(container, "copyright")).toHaveValue(
        "http://copyright"
      );
    });

    it("does not render settings with the skip attribute", () => {
      const skip = { key: "skip", label: "Skip this setting!", skip: true };
      const { container } = renderForm({
        data: makeData([...settingFields, skip]),
      });

      // A normal setting still renders, but the skipped one does not.
      expect(inputByName(container, "privacy-policy")).toBeInTheDocument();
      expect(inputByName(container, "skip")).not.toBeInTheDocument();
    });

    it("renders the PairedMenus component", () => {
      const inputListSetting = {
        key: "inputList",
        label: "Input List",
        paired: "dropdown",
        options: [],
        default: ["opt_1"],
        level: 2,
      };
      const dropdownSetting = {
        key: "dropdown",
        label: "Dropdown List",
        options: [
          { key: "opt_1", label: "Option 1" },
          { key: "opt_2", label: "Option 2" },
        ],
        type: "select",
        level: 2,
      };
      const { container, rerender } = renderForm({
        data: makeData([inputListSetting, dropdownSetting]),
      });

      // These settings render inside a collapsed (aria-hidden) panel, so query
      // the DOM directly rather than via accessible-role queries.
      const pairedMenus = container.querySelector<HTMLElement>(".paired-menus");
      expect(pairedMenus).toBeInTheDocument();

      // The dropdown inside the paired menus is filtered to the option that is
      // present in the input list (opt_1).
      const dropdown = pairedMenus.querySelector<HTMLSelectElement>(
        'select[name="dropdown"]'
      );
      const options = dropdown.querySelectorAll("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveValue("opt_1");

      // At admin level 3 the setting is editable, so the input list's remove
      // button is enabled.
      expect(pairedMenus.querySelector(".remove-btn")).toBeEnabled();

      // A librarian (level 1) is not authorized, so the paired menus become
      // read-only and the remove button is disabled.
      rerender({
        data: makeData([inputListSetting, dropdownSetting]),
        adminLevel: 1,
      });
      const readOnlyPaired =
        container.querySelector<HTMLElement>(".paired-menus");
      expect(readOnlyPaired.querySelector(".remove-btn")).toBeDisabled();
    });

    it("renders the InputList component", () => {
      const inputListSetting = {
        key: "inputList",
        label: "Input List",
        options: [],
        default: ["opt_1"],
        level: 2,
        menuOptions: [],
        type: "menu",
      };
      const { container, rerender } = renderForm({
        data: makeData([inputListSetting]),
      });

      // This setting renders inside a collapsed (aria-hidden) panel, so query
      // the DOM directly rather than via accessible-role queries.
      expect(container.querySelector(".input-list")).toBeInTheDocument();
      // The existing list item is editable and removable for an authorized admin.
      expect(inputByName(container, "inputList_opt_1")).not.toHaveAttribute(
        "readonly"
      );
      expect(container.querySelector(".remove-btn")).toBeEnabled();

      // A librarian (level 1) is not authorized: the item becomes read-only and
      // the remove button is disabled.
      rerender({ data: makeData([inputListSetting]), adminLevel: 1 });
      expect(inputByName(container, "inputList_opt_1")).toHaveAttribute(
        "readonly"
      );
      expect(container.querySelector(".remove-btn")).toBeDisabled();
    });

    it("renders the Announcements component", () => {
      const { container } = renderForm({ item: libraryData as LibraryData });

      // The announcements section renders the library's saved announcement.
      expect(
        container.querySelector(".announcements-section")
      ).toBeInTheDocument();
      expect(screen.getByText("Scheduled Announcements:")).toBeInTheDocument();
      expect(screen.getByText(/Announcement #1/)).toBeInTheDocument();
    });

    it("subdivides fields", () => {
      const { container } = renderForm();

      const panels = container.querySelectorAll(".panel");
      expect(panels).toHaveLength(7);

      // The first panel is the (required) Basic Information panel; the rest are
      // optional.
      const basic = panels[0].querySelector(".panel-heading");
      expect(basic).toHaveTextContent("Basic Information");
      Array.from(panels)
        .slice(1)
        .forEach((panel) => {
          expect(panel.querySelector(".panel-heading")).toHaveTextContent(
            "(Optional)"
          );
        });

      // The Links panel holds two settings.
      const links = panelByName(container, "Links");
      expect(inputByName(links, "privacy-policy")).toBeInTheDocument();
      expect(inputByName(links, "copyright")).toBeInTheDocument();
      expect(
        panelByName(container, "Languages").querySelectorAll("input")
      ).toHaveLength(1);
      expect(
        panelByName(
          container,
          "Client Interface Customization"
        ).querySelectorAll("input")
      ).toHaveLength(1);

      // Geographic Areas is a list input, which renders an add-list-item span
      // and button.
      const geographic = panelByName(container, "Geographic Areas");
      expect(geographic.querySelectorAll(".add-list-item")).toHaveLength(2);
    });

    it("has a save button", () => {
      renderForm();
      expect(
        screen.getByRole("button", { name: "Submit" })
      ).toBeInTheDocument();
    });

    it("disables some fields if the user isn't a system admin", () => {
      const sysAdminOnly = {
        key: "level-3",
        label: "Level 3",
        category: "Basic Information",
        level: 3,
      };
      const sysAdminAndLibMgr = {
        key: "level-2",
        label: "Level 2",
        category: "Basic Information",
        level: 2,
      };
      const data = makeData([
        ...settingFields,
        sysAdminOnly,
        sysAdminAndLibMgr,
      ]);
      const { container, rerender } = renderForm({ data, adminLevel: 3 });

      // System admin: everything is editable.
      ["name", "short_name", "level-3", "level-2"].forEach((name) =>
        expect(inputByName(container, name)).not.toHaveAttribute("readonly")
      );

      // Library manager (level 2): level-3 (and the always-restricted name/short
      // name) are read-only, level-2 is editable.
      rerender({ data, adminLevel: 2 });
      ["name", "short_name", "level-3"].forEach((name) =>
        expect(inputByName(container, name)).toHaveAttribute("readonly")
      );
      expect(inputByName(container, "level-2")).not.toHaveAttribute("readonly");

      // Librarian (level 1): level-2 is now read-only too.
      rerender({ data, adminLevel: 1 });
      ["name", "short_name", "level-3", "level-2"].forEach((name) =>
        expect(inputByName(container, name)).toHaveAttribute("readonly")
      );
    });
  });

  describe("behavior", () => {
    it("calls save when the save button is clicked", async () => {
      const user = userEvent.setup();
      const save = jest.fn();
      renderForm({ save });

      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(save).toHaveBeenCalledTimes(1);
    });

    it("submits data", async () => {
      const user = userEvent.setup();
      const save = jest.fn();
      renderForm({ save, item: libraryData as LibraryData });

      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(save).toHaveBeenCalledTimes(1);
      const formData = save.mock.calls[0][0];
      expect(formData.get("uuid")).toBe("uuid");
      expect(formData.get("name")).toBe("name");
      expect(formData.get("short_name")).toBe("short_name");
      expect(formData.get("privacy-policy")).toBe("http://privacy");
      expect(formData.get("copyright")).toBe("http://copyright");
    });

    it("clears the form when a response comes back without an error", async () => {
      const user = userEvent.setup();
      const { container, rerender } = renderForm();

      await user.type(inputByName(container, "name"), "new name");
      expect(inputByName(container, "name")).toHaveValue("new name");

      // A successful response (responseBody with no error) clears the form.
      rerender({ responseBody: "new library" });
      expect(inputByName(container, "name")).toHaveValue("");
    });

    it("doesn't clear the form if there's an error message", async () => {
      const user = userEvent.setup();
      const { container, rerender } = renderForm();

      await user.type(inputByName(container, "name"), "new name");
      expect(inputByName(container, "name")).toHaveValue("new name");

      // An error response leaves the entered value in place.
      rerender({ fetchError: "ERROR" });
      expect(inputByName(container, "name")).toHaveValue("new name");
    });
  });
});
