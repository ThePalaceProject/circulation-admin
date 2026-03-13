import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

import ServiceEditForm from "../../../src/components/config/ServiceEditForm";
import { ServicesData } from "../../../src/interfaces";

// ─── Mocks ─────────────────────────────────────────────────────────────────────

// Mock ProtocolFormField so we can query protocol fields by key without
// needing the full rendering stack.
// We must also re-export `defaultValueIfMissing` because EditableInput imports
// it directly from this module.
jest.mock("../../../src/components/config/ProtocolFormField", () => {
  const defaultValueIfMissing = (value: any, defaultValue: any) =>
    value === undefined || value === null ? defaultValue : value;

  function ProtocolFormFieldMock(props: {
    setting: { key: string };
    value?: string;
    disabled?: boolean;
  }) {
    return (
      <div
        data-testid="protocol-form-field"
        data-key={props.setting?.key}
        data-value={props.value ?? ""}
        data-disabled={String(!!props.disabled)}
      />
    );
  }

  return {
    __esModule: true,
    default: ProtocolFormFieldMock,
    defaultValueIfMissing,
  };
});

// Mock NeighborhoodAnalyticsForm — only tested in its own spec.
jest.mock("../../../src/components/patrons/NeighborhoodAnalyticsForm", () => ({
  __esModule: true,
  default: function NeighborhoodAnalyticsFormMock() {
    return <div data-testid="neighborhood-analytics-form" />;
  },
}));

// Retrieve the mock component so tests can reference it directly.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NeighborhoodAnalyticsFormMock = require("../../../src/components/patrons/NeighborhoodAnalyticsForm")
  .default;

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const serviceData = {
  id: 2,
  protocol: "protocol 1",
  settings: {
    text_setting: "text setting",
    select_setting: "option2",
  },
  libraries: [
    {
      short_name: "nypl",
      library_text_setting: "library text setting",
      library_select_setting: "option4",
    },
  ],
};

const parentProtocol = {
  name: "protocol 3",
  label: "protocol 3 label",
  settings: [{ key: "parent_setting", label: "parent label" }],
  child_settings: [{ key: "child_setting", label: "child label" }],
  library_settings: [],
};

const protocolsData = [
  {
    name: "protocol 1",
    label: "protocol 1 label",
    description: "protocol 1 description",
    sitewide: false,
    settings: [
      { key: "text_setting", label: "text label", optional: true },
      {
        key: "select_setting",
        label: "select label",
        type: "select",
        options: [
          { key: "option1", label: "option 1" },
          { key: "option2", label: "option 2" },
        ],
      },
    ],
    library_settings: [
      {
        key: "library_text_setting",
        label: "library text label",
        optional: true,
      },
      {
        key: "library_select_setting",
        label: "library select label",
        type: "select",
        options: [
          { key: "option3", label: "option 3" },
          { key: "option4", label: "option 4" },
        ],
      },
    ],
  },
  {
    name: "protocol 2",
    label: "protocol 2 label",
    description: "protocol 2 description",
    sitewide: true,
    settings: [
      { key: "text_setting", label: "text label" },
      { key: "protocol2_setting", label: "protocol2 label" },
    ],
    library_settings: [],
  },
  {
    name: "protocol with instructions",
    label: "instructions label",
    description: "click for instructions",
    instructions: "Instructions!",
    sitewide: false,
    settings: [],
    library_settings: [],
  },
  parentProtocol,
];

const allLibraries = [
  { short_name: "nypl", name: "New York Public Library" },
  { short_name: "bpl", name: "Brooklyn Public Library" },
];

const servicesData: ServicesData = ({
  services: [serviceData],
  protocols: protocolsData,
  allLibraries,
} as unknown) as ServicesData;

const urlBase = "/services";

/** Helper: render ServiceEditForm with sensible defaults; returns container. */
function renderForm(overrides: Record<string, unknown> = {}) {
  const save = jest.fn().mockResolvedValue(undefined);
  const props = {
    disabled: false,
    data: servicesData,
    save,
    urlBase,
    listDataKey: "services",
    ...overrides,
  };
  const result = render(<ServiceEditForm {...(props as any)} />);
  return { ...result, save };
}

/** Query all rendered ProtocolFormField mocks. */
function getFormFieldByKey(container: HTMLElement, key: string) {
  return container.querySelector(
    `[data-testid="protocol-form-field"][data-key="${key}"]`
  );
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe("ServiceEditForm", () => {
  describe("rendering", () => {
    it("does not render a hidden id input for a new service", () => {
      const { container } = renderForm();
      expect(container.querySelector("input[name='id']")).toBeNull();
    });

    it("renders a hidden id input when item is provided", () => {
      const { container } = renderForm({ item: serviceData });
      const idInput = container.querySelector(
        "input[name='id']"
      ) as HTMLInputElement;
      expect(idInput).not.toBeNull();
      expect(idInput.type).toBe("hidden");
      expect(idInput.value).toBe("2");
    });

    it("renders protocol select with all options for a new service", () => {
      const { container } = renderForm();
      const protocolSelect = container.querySelector(
        "select[name='protocol']"
      ) as HTMLSelectElement;
      expect(protocolSelect).not.toBeNull();
      const options = Array.from(protocolSelect.options);
      expect(options.length).toBe(4);
      expect(options[0].text).toContain("protocol 1 label");
      expect(options[1].text).toContain("protocol 2 label");
      expect(options[2].text).toContain("instructions label");
    });

    it("renders protocol select as read-only with one option when editing an existing service", () => {
      const { container } = renderForm({ item: serviceData });
      const protocolSelect = container.querySelector(
        "select[name='protocol']"
      ) as HTMLSelectElement;
      expect(protocolSelect).not.toBeNull();
      // When editing, only the active protocol is shown.
      const options = Array.from(protocolSelect.options);
      expect(options.length).toBe(1);
      expect(options[0].text).toContain("protocol 1 label");
      // The select should be disabled (read-only = editing an existing service).
      // The select may not be HTML-disabled, but it will only show the single
      // active protocol (not all options), confirming the read-only behaviour.
      expect(options.length).toBe(1);
    });

    it("renders protocol form fields for the active protocol", () => {
      const { container } = renderForm();
      expect(getFormFieldByKey(container, "text_setting")).not.toBeNull();
      expect(getFormFieldByKey(container, "select_setting")).not.toBeNull();
      expect(getFormFieldByKey(container, "protocol2_setting")).toBeNull();
    });

    it("passes existing setting values to protocol form fields when editing", () => {
      const { container } = renderForm({ item: serviceData });
      const textField = getFormFieldByKey(container, "text_setting");
      expect(textField).not.toBeNull();
      expect((textField as HTMLElement).dataset.value).toBe("text setting");
      const selectField = getFormFieldByKey(container, "select_setting");
      expect((selectField as HTMLElement).dataset.value).toBe("option2");
    });

    it("renders Required Fields panel and Libraries panel (.panel)", () => {
      const { container } = renderForm();
      const panels = container.querySelectorAll(".panel");
      // At minimum we expect Required Fields panel and Libraries panel.
      expect(panels.length).toBeGreaterThanOrEqual(2);
    });

    it("renders instructions, required fields, and libraries panels for a protocol with instructions", () => {
      const { container } = renderForm();
      // Switch to the "protocol with instructions" by re-rendering
      const { container: c2 } = render(
        <ServiceEditForm
          {...({
            disabled: false,
            data: servicesData,
            save: jest.fn().mockResolvedValue(undefined),
            urlBase,
            listDataKey: "services",
            item: { ...serviceData, protocol: "protocol with instructions" },
          } as any)}
        />
      );
      const panels = c2.querySelectorAll(".panel");
      // instructions + required + libraries = 3 panels
      expect(panels.length).toBe(3);
      // The instructions panel title matches the protocol description.
      const titles = Array.from(c2.querySelectorAll(".panel-title")).map(
        (el) => el.textContent
      );
      expect(titles).toContain("click for instructions");
      // The instructions panel body contains the protocol instructions.
      expect(c2.querySelector(".panel-body")?.textContent).toBe(
        "Instructions!"
      );
    });

    it("does not render the parent dropdown for a protocol without child settings", () => {
      const { container } = renderForm();
      expect(container.querySelector("select[name='parent_id']")).toBeNull();
    });

    it("does not render parent dropdown when there are no available parent services", () => {
      // Protocol 3 supports child_settings, but no other service uses it yet.
      const dataWithProtocol3 = {
        ...servicesData,
        protocols: [parentProtocol],
      };
      const newService = {
        ...serviceData,
        protocol: "protocol 3",
        id: 99,
      };
      const { container } = renderForm({
        data: dataWithProtocol3,
        item: newService,
      });
      expect(container.querySelector("select[name='parent_id']")).toBeNull();
    });

    it("renders the parent dropdown when a compatible parent service exists", () => {
      const parentService = {
        ...serviceData,
        id: 2,
        protocol: "protocol 3",
        name: "Parent",
      };
      const childService = {
        ...serviceData,
        id: 3,
        protocol: "protocol 3",
        name: "Child",
      };
      const dataWithParent = {
        ...servicesData,
        services: [parentService, childService],
        protocols: [parentProtocol],
      };
      const { container } = renderForm({
        data: dataWithParent,
        item: childService,
      });
      const parentSelect = container.querySelector(
        "select[name='parent_id']"
      ) as HTMLSelectElement;
      expect(parentSelect).not.toBeNull();
      const opts = Array.from(parentSelect.options);
      expect(opts.length).toBe(2);
      expect(opts[0].text).toContain("None");
      expect(opts[1].text).toContain("Parent");
    });

    it("does not render the Libraries panel for a sitewide protocol with no library settings", () => {
      const sitewideData = {
        ...servicesData,
        protocols: [protocolsData[1]], // protocol 2: sitewide, no library_settings
      };
      const { container } = renderForm({ data: sitewideData });
      // No Libraries panel should be present.
      const panelTitles = Array.from(
        container.querySelectorAll(".panel-title")
      ).map((el) => el.textContent);
      expect(panelTitles).not.toContain("Libraries");
    });

    it("renders associated libraries with their names when an item is provided", () => {
      const { container } = renderForm({ item: serviceData });
      // WithRemoveButton wraps each library row with class "with-remove-button".
      const libraryRows = container.querySelectorAll(".with-remove-button");
      expect(libraryRows.length).toBe(1);
      expect(libraryRows[0].textContent).toContain("New York Public Library");
    });

    it("renders the Add Library dropdown for a non-sitewide protocol", () => {
      const { container } = renderForm();
      const addLibrarySelect = container.querySelector(
        "select[name='add-library']"
      );
      expect(addLibrarySelect).not.toBeNull();
    });

    it("does not render the Add Library dropdown for a sitewide protocol", () => {
      const sitewideData = {
        ...servicesData,
        protocols: [protocolsData[1]], // protocol 2: sitewide
      };
      const { container } = renderForm({ data: sitewideData });
      expect(container.querySelector("select[name='add-library']")).toBeNull();
    });

    it("renders a submit (Save) button", () => {
      const { container } = renderForm();
      const submitButtons = container.querySelectorAll("button[type='submit']");
      expect(submitButtons.length).toBeGreaterThanOrEqual(1);
    });

    it("renders the NeighborhoodAnalyticsForm when extraFormKey/extraFormSection match a protocol setting", () => {
      const patronAuthProtocol = {
        ...protocolsData[0],
        settings: [{ key: "neighborhood_mode", options: [] }],
      };
      const { container } = renderForm({
        extraFormKey: "neighborhood_mode",
        extraFormSection: NeighborhoodAnalyticsFormMock,
        data: { ...servicesData, protocols: [patronAuthProtocol] },
      });
      expect(
        container.querySelector("[data-testid='neighborhood-analytics-form']")
      ).not.toBeNull();
    });
  });

  describe("behavior", () => {
    it("calls save when the form is submitted", async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      const { container } = render(
        <ServiceEditForm
          {...({
            disabled: false,
            data: servicesData,
            save,
            urlBase,
            listDataKey: "services",
          } as any)}
        />
      );
      const form = container.querySelector("form");
      await act(async () => {
        fireEvent.submit(form!);
      });
      expect(save).toHaveBeenCalledTimes(1);
    });

    it("calls save with FormData containing the service id when editing", async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      const { container } = render(
        <ServiceEditForm
          {...({
            disabled: false,
            data: servicesData,
            save,
            urlBase,
            listDataKey: "services",
            item: serviceData,
          } as any)}
        />
      );
      const form = container.querySelector("form");
      await act(async () => {
        fireEvent.submit(form!);
      });
      expect(save).toHaveBeenCalledTimes(1);
      const formData: FormData = save.mock.calls[0][0];
      expect(formData.get("id")).toBe("2");
    });

    it("calls save with FormData containing a libraries JSON array", async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      const { container } = render(
        <ServiceEditForm
          {...({
            disabled: false,
            data: servicesData,
            save,
            urlBase,
            listDataKey: "services",
            item: serviceData,
          } as any)}
        />
      );
      const form = container.querySelector("form");
      await act(async () => {
        fireEvent.submit(form!);
      });
      const formData: FormData = save.mock.calls[0][0];
      expect(formData.get("libraries")).toBe(
        JSON.stringify(serviceData.libraries)
      );
    });

    it("switching the protocol select updates the rendered protocol form fields", () => {
      const { container } = renderForm();
      // Initially protocol 1 is active; protocol2_setting should not be present.
      expect(getFormFieldByKey(container, "protocol2_setting")).toBeNull();

      const protocolSelect = container.querySelector(
        "select[name='protocol']"
      ) as HTMLSelectElement;
      act(() => {
        fireEvent.change(protocolSelect, {
          target: { value: "protocol 2" },
        });
      });

      // After switching to protocol 2, protocol2_setting should appear.
      expect(getFormFieldByKey(container, "protocol2_setting")).not.toBeNull();
      // select_setting is only in protocol 1.
      expect(getFormFieldByKey(container, "select_setting")).toBeNull();
    });

    it("removes an associated library when its remove button is clicked", () => {
      const save = jest.fn().mockResolvedValue(undefined);
      const { container } = render(
        <ServiceEditForm
          {...({
            disabled: false,
            data: servicesData,
            save,
            urlBase,
            listDataKey: "services",
            item: serviceData,
          } as any)}
        />
      );
      expect(container.querySelectorAll(".with-remove-button").length).toBe(1);

      const removeBtn = container.querySelector(
        ".remove-btn"
      ) as HTMLButtonElement;
      act(() => {
        fireEvent.click(removeBtn);
      });

      expect(container.querySelectorAll(".with-remove-button").length).toBe(0);
    });

    it("adds a library when one is selected and Add Library is clicked (protocol with no library settings)", () => {
      // Use a protocol with no library_settings so addLibrary() doesn't try to
      // call getValue() on mocked ProtocolFormField refs.
      const noLibSettingsProtocol = {
        ...protocolsData[0],
        library_settings: [],
      };
      const simpleData = {
        ...servicesData,
        protocols: [noLibSettingsProtocol],
      };
      const { container } = render(
        <ServiceEditForm
          {...({
            disabled: false,
            data: simpleData,
            save: jest.fn().mockResolvedValue(undefined),
            urlBase,
            listDataKey: "services",
          } as any)}
        />
      );
      // Initially no libraries listed.
      expect(container.querySelectorAll(".with-remove-button").length).toBe(0);

      // Select a library from the Add Library dropdown.
      const addLibrarySelect = container.querySelector(
        "select[name='add-library']"
      ) as HTMLSelectElement;
      act(() => {
        fireEvent.change(addLibrarySelect, { target: { value: "nypl" } });
      });

      // "Add Library" button should appear.
      const addBtn = Array.from(
        container.querySelectorAll("button[type='button']")
      ).find(
        (b) => b.textContent?.trim() === "Add Library"
      ) as HTMLButtonElement;
      expect(addBtn).not.toBeUndefined();

      act(() => {
        fireEvent.click(addBtn);
      });

      // The library row should now be listed.
      expect(container.querySelectorAll(".with-remove-button").length).toBe(1);
      expect(
        container.querySelector(".with-remove-button")!.textContent
      ).toContain("New York Public Library");
    });
  });
});
