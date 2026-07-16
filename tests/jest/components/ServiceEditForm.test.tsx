import * as React from "react";
import { installFormDataShim, FormDataShim } from "../testUtils/formDataShim";
import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ServiceEditForm, {
  ServiceEditFormProps,
  ServiceEditFormState,
} from "../../../src/components/ServiceEditForm";
import NeighborhoodAnalyticsForm from "../../../src/components/NeighborhoodAnalyticsForm";
import { ServicesData } from "../../../src/interfaces";
// The reusable-components `Form` builds `new FormData(formElement)` on
// submit, which the unit jsdom env's undici FormData rejects; install the
// shared shim that reads the form's successful controls.
installFormDataShim();
describe("ServiceEditForm", () => {
  // ServiceEditForm is a generic class; expose a concrete constructor type so
  // JSX works without generic inference.
  const TestServiceEditForm: new (
    props: ServiceEditFormProps<ServicesData>
  ) => React.Component<
    ServiceEditFormProps<ServicesData>,
    ServiceEditFormState
  > = ServiceEditForm;

  let save: jest.Mock;
  const urlBase = "/services";

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
  const servicesData = {
    services: [serviceData],
    protocols: protocolsData,
    allLibraries: allLibraries,
  };

  // Renders the form with the standard set of props; `props` overrides them.
  const renderForm = (
    props: Partial<ServiceEditFormProps<ServicesData>> = {}
  ) =>
    render(
      <TestServiceEditForm
        disabled={false}
        data={servicesData}
        save={save}
        urlBase={urlBase}
        listDataKey="services"
        {...props}
      />
    );

  // Re-renders (keeping the same instance) with the standard props + overrides.
  const rerenderForm = (
    rerender: (el: React.ReactElement) => void,
    props: Partial<ServiceEditFormProps<ServicesData>> = {}
  ) =>
    rerender(
      <TestServiceEditForm
        disabled={false}
        data={servicesData}
        save={save}
        urlBase={urlBase}
        listDataKey="services"
        {...props}
      />
    );

  beforeEach(() => {
    save = jest.fn();
  });

  describe("rendering", () => {
    it("renders hidden id", () => {
      const { container, rerender } = renderForm();
      expect(container.querySelector('input[name="id"]')).toBeNull();

      rerenderForm(rerender, { item: serviceData });
      const input = container.querySelector(
        'input[name="id"]'
      ) as HTMLInputElement;
      expect(input.type).toBe("hidden");
      expect(input.value).toBe("2");
    });

    it("renders protocol", () => {
      // Starts with the first protocol in the list, and is editable (all
      // protocols available as options).
      const { container, unmount } = renderForm();
      let select = container.querySelector(
        'select[name="protocol"]'
      ) as HTMLSelectElement;
      expect(select.value).toBe("protocol 1");
      let options = select.querySelectorAll("option");
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveTextContent("protocol 1 label");
      expect(options[1]).toHaveTextContent("protocol 2 label");
      expect(options[2]).toHaveTextContent("instructions label");
      expect(
        within(container).getByText("protocol 1 description")
      ).toBeInTheDocument();

      // When editing an existing service, the protocol can't be changed, so
      // there is only a single option.
      unmount();
      const { container: c2 } = renderForm({ item: serviceData });
      select = c2.querySelector('select[name="protocol"]') as HTMLSelectElement;
      expect(select.value).toBe("protocol 1");
      options = select.querySelectorAll("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("protocol 1 label");
      expect(
        within(c2).getByText("protocol 1 description")
      ).toBeInTheDocument();
    });

    it("renders protocol fields", () => {
      const { container, unmount } = renderForm();
      expect(
        (
          container.querySelector(
            'input[name="text_setting"]'
          ) as HTMLInputElement
        ).value
      ).toBe("");
      expect(
        container.querySelector('select[name="select_setting"]')
      ).toBeInTheDocument();
      expect(container.querySelector('[name="protocol2_setting"]')).toBeNull();

      unmount();
      const { container: c2 } = renderForm({ item: serviceData });
      expect(
        (c2.querySelector('input[name="text_setting"]') as HTMLInputElement)
          .value
      ).toBe("text setting");
      expect(
        (c2.querySelector('select[name="select_setting"]') as HTMLSelectElement)
          .value
      ).toBe("option2");
      expect(c2.querySelector('[name="protocol2_setting"]')).toBeNull();
    });

    it("renders a collapsible component", async () => {
      const user = userEvent.setup();
      const { container } = renderForm();
      await user.selectOptions(
        container.querySelector('select[name="protocol"]') as HTMLSelectElement,
        "protocol with instructions"
      );

      const panels = container.querySelectorAll(".panel");
      expect(panels).toHaveLength(3);
      expect(panels[0].querySelector(".panel-title")).toHaveTextContent(
        "click for instructions"
      );
      expect(panels[0].querySelector(".panel-body")).toHaveTextContent(
        "Instructions!"
      );
    });

    it("doesn't render parent dropdown for protocol with no child settings", () => {
      const { container } = renderForm();
      expect(container.querySelector('select[name="parent_id"]')).toBeNull();
    });

    it("doesn't render parent dropdown when there are no available parents", () => {
      const newService = Object.assign({}, serviceData, {
        protocol: "protocol 3",
      });
      const { container } = renderForm({ item: newService });
      expect(container.querySelector('select[name="parent_id"]')).toBeNull();
    });

    it("renders parent dropdown for protocol with child settings and available parents", () => {
      const parentService = Object.assign({}, serviceData, {
        protocol: "protocol 3",
        name: "Parent",
      });
      const childService = Object.assign({}, serviceData, {
        protocol: "protocol 3",
        id: 3,
        name: "Child",
      });
      const servicesDataWithParent = Object.assign({}, servicesData, {
        services: [parentService, childService],
      });

      const { container, unmount } = renderForm({
        data: servicesDataWithParent,
        item: childService,
      });
      let select = container.querySelector(
        'select[name="parent_id"]'
      ) as HTMLSelectElement;
      expect(select).toBeInTheDocument();
      // No parent selected, so the "None" option (value "") is active.
      expect(select.value).toBe("");
      let options = select.querySelectorAll("option");
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent("None");
      expect(options[1]).toHaveTextContent("Parent");

      unmount();
      const childWithParent = Object.assign({}, childService, {
        parent_id: parentService.id,
      });
      const { container: c2 } = renderForm({
        data: servicesDataWithParent,
        item: childWithParent,
      });
      select = c2.querySelector(
        'select[name="parent_id"]'
      ) as HTMLSelectElement;
      expect(select).toBeInTheDocument();
      expect(select.value).toBe("2");
      options = select.querySelectorAll("option");
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent("None");
      expect(options[1]).toHaveTextContent("Parent");
    });

    it("renders protocol fields for child", () => {
      const parentService = Object.assign({}, serviceData, {
        protocol: "protocol 3",
        name: "Parent",
      });
      const childNoParent = Object.assign({}, serviceData, {
        protocol: "protocol 3",
        id: 3,
        name: "Child",
        settings: { ...serviceData.settings },
      });
      const servicesDataWithParent = Object.assign({}, servicesData, {
        services: [parentService, childNoParent],
      });

      // Editing a "parent" service (no parent selected) shows the parent
      // settings, not the child settings.
      const { container, rerender, unmount } = renderForm({
        data: servicesDataWithParent,
        item: childNoParent,
      });
      expect(
        (
          container.querySelector(
            'input[name="parent_setting"]'
          ) as HTMLInputElement
        ).value
      ).toBe("");
      expect(container.querySelector('input[name="child_setting"]')).toBeNull();

      rerenderForm(rerender, {
        data: servicesDataWithParent,
        item: {
          ...childNoParent,
          settings: {
            ...childNoParent.settings,
            parent_setting: "parent setting",
          },
        },
      });
      expect(
        (
          container.querySelector(
            'input[name="parent_setting"]'
          ) as HTMLInputElement
        ).value
      ).toBe("parent setting");

      // Once the service has a parent, only the child settings are shown.
      unmount();
      const childWithParent = {
        ...childNoParent,
        parent_id: parentService.id,
        settings: { ...serviceData.settings },
      };
      const { container: c2, rerender: rerender2 } = renderForm({
        data: servicesDataWithParent,
        item: childWithParent,
      });
      expect(c2.querySelector('input[name="parent_setting"]')).toBeNull();
      expect(
        (c2.querySelector('input[name="child_setting"]') as HTMLInputElement)
          .value
      ).toBe("");

      rerenderForm(rerender2, {
        data: servicesDataWithParent,
        item: {
          ...childWithParent,
          settings: {
            ...childWithParent.settings,
            child_setting: "child setting",
          },
        },
      });
      expect(
        (c2.querySelector('input[name="child_setting"]') as HTMLInputElement)
          .value
      ).toBe("child setting");
    });

    it("doesn't render libraries for sitewide protocol without library settings", () => {
      const servicesDataSitewide = Object.assign({}, servicesData, {
        protocols: [servicesData.protocols[1]],
      });

      const { container, unmount } = renderForm({ data: servicesDataSitewide });
      expect(container.querySelectorAll(".with-remove-button")).toHaveLength(0);

      unmount();
      const serviceDataSitewide = Object.assign({}, servicesData, {
        libraries: [],
        protocol: "",
      });
      const { container: c2 } = renderForm({
        data: servicesDataSitewide,
        item: serviceDataSitewide,
      });
      expect(c2.querySelectorAll(".with-remove-button")).toHaveLength(0);
    });

    it("renders libraries for a sitewide protocol with library settings", () => {
      const servicesDataSitewide = Object.assign({}, servicesData, {
        protocols: [
          Object.assign({}, servicesData.protocols[1], { sitewide: true }),
        ],
      });

      const { container } = renderForm({
        data: servicesDataSitewide,
        item: serviceData,
      });
      const libraries = container.querySelectorAll(".with-remove-button");
      expect(libraries).toHaveLength(1);
      expect(libraries[0]).toHaveTextContent("New York Public Library");
    });

    it("renders removable and editable libraries", () => {
      const { container, unmount } = renderForm();
      expect(container.querySelectorAll(".with-remove-button")).toHaveLength(0);

      unmount();
      const { container: c2 } = renderForm({ item: serviceData });
      const libraries = c2.querySelectorAll(".with-remove-button");
      expect(libraries).toHaveLength(1);
      const editable = c2.querySelectorAll(".with-edit-button");
      expect(editable).toHaveLength(1);
      expect(editable[0]).toHaveTextContent("New York Public Library");
    });

    it("renders removable but not editable libraries", () => {
      const { container, unmount } = renderForm();
      expect(container.querySelectorAll(".with-remove-button")).toHaveLength(0);

      unmount();
      const newServiceData = Object.assign({}, serviceData, {
        protocol: "protocol 3",
      });
      const { container: c2 } = renderForm({ item: newServiceData });
      const libraries = c2.querySelectorAll(".with-remove-button");
      expect(libraries).toHaveLength(1);
      // protocol 3 has no library settings, so there is no edit button.
      expect(c2.querySelectorAll(".with-edit-button")).toHaveLength(0);
      expect(libraries[0]).toHaveTextContent("New York Public Library");
    });

    it("doesn't render library add dropdown for sitewide protocol", () => {
      const servicesDataSitewide = Object.assign({}, servicesData, {
        protocols: [servicesData.protocols[1]],
      });

      const { container, unmount } = renderForm({ data: servicesDataSitewide });
      expect(container.querySelector('select[name="add-library"]')).toBeNull();

      unmount();
      const serviceDataSitewide = Object.assign({}, servicesData, {
        libraries: [],
        protocol: "",
      });
      const { container: c2 } = renderForm({
        data: servicesDataSitewide,
        item: serviceDataSitewide,
      });
      expect(c2.querySelector('select[name="add-library"]')).toBeNull();
    });

    it("renders library add dropdown for a sitewide protocol with library settings", () => {
      const servicesDataSitewide = Object.assign({}, servicesData, {
        protocols: [
          Object.assign({}, servicesData.protocols[1], { sitewide: true }),
        ],
      });

      const { container } = renderForm({
        data: servicesDataSitewide,
        item: serviceData,
      });
      expect(
        container.querySelector('select[name="add-library"]')
      ).toBeInTheDocument();
    });

    it("renders library add dropdown for a non-sitewide protocol", () => {
      const { container, unmount } = renderForm();
      let select = container.querySelector(
        'select[name="add-library"]'
      ) as HTMLSelectElement;
      expect(within(container).getByText("Add Library")).toBeInTheDocument();

      let options = select.querySelectorAll("option");
      expect(options).toHaveLength(3);
      expect((options[0] as HTMLOptionElement).value).toBe("none");
      expect((options[1] as HTMLOptionElement).value).toBe("nypl");
      expect((options[2] as HTMLOptionElement).value).toBe("bpl");

      // No library selected yet, so no per-library settings are rendered.
      expect(
        container.querySelector('input[name="library_text_setting"]')
      ).toBeNull();
      expect(
        container.querySelector('select[name="library_select_setting"]')
      ).toBeNull();

      // When editing an existing service, the already-associated library
      // (nypl) is not offered in the add dropdown.
      unmount();
      const { container: c2 } = renderForm({ item: serviceData });
      select = c2.querySelector(
        'select[name="add-library"]'
      ) as HTMLSelectElement;
      expect(within(c2).getByText("Add Library")).toBeInTheDocument();
      options = select.querySelectorAll("option");
      expect(options).toHaveLength(2);
      expect((options[0] as HTMLOptionElement).value).toBe("none");
      expect((options[1] as HTMLOptionElement).value).toBe("bpl");
    });

    it("renders neighborhood analytics form for a relevant patron auth protocol", () => {
      const { container, rerender } = renderForm();
      expect(
        within(container).queryByText(/Patron Neighborhood Analytics/)
      ).not.toBeInTheDocument();

      const patronAuthProtocol = {
        ...protocolsData[0],
        ...{ settings: [{ key: "neighborhood_mode", options: [] }] },
      };
      rerenderForm(rerender, {
        extraFormKey: "neighborhood_mode",
        extraFormSection: NeighborhoodAnalyticsForm,
        // The pared-down protocol setting omits `label`, so the data is cast to
        // `any` to bypass the prop type.
        data: {
          ...servicesData,
          ...{ protocols: [patronAuthProtocol] },
        } as any,
      });
      // The ": Disabled" suffix is unique to the panel title (the form's
      // visually-hidden legend has the bare heading text too).
      expect(
        within(container).getByText(/Patron Neighborhood Analytics: Disabled/)
      ).toBeInTheDocument();
    });

    it("renders neighborhood analytics form for a relevant analytics protocol", () => {
      const { container, rerender } = renderForm();
      expect(
        within(container).queryByText(/Patron Neighborhood Analytics/)
      ).not.toBeInTheDocument();

      const analyticsProtocol = {
        ...protocolsData[0],
        ...{ settings: [{ key: "location_source", options: [] }] },
      };
      rerenderForm(rerender, {
        extraFormKey: "location_source",
        extraFormSection: NeighborhoodAnalyticsForm,
        // The pared-down protocol setting omits `label`, so the data is cast to
        // `any` to bypass the prop type.
        data: { ...servicesData, ...{ protocols: [analyticsProtocol] } } as any,
      });
      expect(
        within(container).getByText(/Patron Neighborhood Analytics: Disabled/)
      ).toBeInTheDocument();
    });

    it("has a save button", () => {
      const { container } = renderForm();
      // The form's submit button (the collapsible panel headers are also
      // <button>s, so this is the only reusable-components Button).
      expect(
        within(container).getByRole("button", { name: "Submit" })
      ).toBeInTheDocument();
    });
  });

  describe("behavior", () => {
    it("changes fields and description when protocol changes", async () => {
      const user = userEvent.setup();
      const { container } = renderForm();

      // Select a library so the library settings are shown.
      await user.selectOptions(
        container.querySelector(
          'select[name="add-library"]'
        ) as HTMLSelectElement,
        "nypl"
      );

      expect(
        container.querySelector('input[name="text_setting"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('select[name="select_setting"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('input[name="library_text_setting"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('select[name="library_select_setting"]')
      ).toBeInTheDocument();
      expect(container.querySelector('[name="protocol2_setting"]')).toBeNull();
      expect(
        within(container).getByText("protocol 1 description")
      ).toBeInTheDocument();

      // Switch to protocol 2.
      await user.selectOptions(
        container.querySelector('select[name="protocol"]') as HTMLSelectElement,
        "protocol 2"
      );
      expect(
        container.querySelector('input[name="text_setting"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('select[name="select_setting"]')
      ).toBeNull();
      // protocol 2 is sitewide with no library settings, so the whole
      // libraries section (and its fields) disappears.
      expect(
        container.querySelector('input[name="library_text_setting"]')
      ).toBeNull();
      expect(
        container.querySelector('select[name="library_select_setting"]')
      ).toBeNull();
      expect(
        container.querySelector('input[name="protocol2_setting"]')
      ).toBeInTheDocument();
      expect(
        within(container).getByText("protocol 2 description")
      ).toBeInTheDocument();

      // Switch back to protocol 1.
      await user.selectOptions(
        container.querySelector('select[name="protocol"]') as HTMLSelectElement,
        "protocol 1"
      );
      expect(
        container.querySelector('input[name="text_setting"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('select[name="select_setting"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('input[name="library_text_setting"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('select[name="library_select_setting"]')
      ).toBeInTheDocument();
      expect(container.querySelector('[name="protocol2_setting"]')).toBeNull();
      expect(
        within(container).getByText("protocol 1 description")
      ).toBeInTheDocument();
    });

    it("changes fields when parent changes", async () => {
      const user = userEvent.setup();
      const parentService = Object.assign({}, serviceData, {
        protocol: "protocol 3",
        name: "Parent",
      });
      const servicesDataWithParent = Object.assign({}, servicesData, {
        services: [parentService],
        protocols: [parentProtocol],
      });
      const { container } = renderForm({ data: servicesDataWithParent });

      expect(
        container.querySelector('input[name="parent_setting"]')
      ).toBeInTheDocument();
      expect(container.querySelector('input[name="child_setting"]')).toBeNull();

      // Selecting a parent switches to the child settings.
      await user.selectOptions(
        container.querySelector(
          'select[name="parent_id"]'
        ) as HTMLSelectElement,
        "2"
      );
      expect(
        container.querySelector('input[name="parent_setting"]')
      ).toBeNull();
      expect(
        container.querySelector('input[name="child_setting"]')
      ).toBeInTheDocument();

      // Clearing the parent switches back to the parent settings.
      await user.selectOptions(
        container.querySelector(
          'select[name="parent_id"]'
        ) as HTMLSelectElement,
        ""
      );
      expect(
        container.querySelector('input[name="parent_setting"]')
      ).toBeInTheDocument();
      expect(container.querySelector('input[name="child_setting"]')).toBeNull();
    });

    it("adds a library with settings", async () => {
      const user = userEvent.setup();
      const { container } = renderForm();

      expect(container.querySelectorAll(".with-remove-button")).toHaveLength(0);
      expect(
        container.querySelector('input[name="library_text_setting"]')
      ).toBeNull();
      expect(
        container.querySelector('select[name="library_select_setting"]')
      ).toBeNull();

      const addLibrarySelect = () =>
        container.querySelector(
          'select[name="add-library"]'
        ) as HTMLSelectElement;

      // Selecting a library reveals its settings fields...
      await user.selectOptions(addLibrarySelect(), "bpl");
      expect(
        container.querySelector('input[name="library_text_setting"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('select[name="library_select_setting"]')
      ).toBeInTheDocument();

      // ...and deselecting hides them again.
      await user.selectOptions(addLibrarySelect(), "none");
      expect(
        container.querySelector('input[name="library_text_setting"]')
      ).toBeNull();
      expect(
        container.querySelector('select[name="library_select_setting"]')
      ).toBeNull();

      // Re-select and fill out the settings.
      await user.selectOptions(addLibrarySelect(), "bpl");
      const textInput = container.querySelector(
        'input[name="library_text_setting"]'
      ) as HTMLInputElement;
      await user.clear(textInput);
      await user.type(textInput, "library text");
      await user.selectOptions(
        container.querySelector(
          'select[name="library_select_setting"]'
        ) as HTMLSelectElement,
        "option4"
      );

      // The buttons live inside a collapsed (aria-hidden) panel, so click them
      // by class rather than by accessible role.
      await user.click(
        container.querySelector("button.left-align") as HTMLElement
      );

      // The library is added, showing its name plus Delete and Edit controls.
      const libraries = container.querySelectorAll(".with-remove-button");
      expect(libraries).toHaveLength(1);
      expect(libraries[0]).toHaveTextContent("Brooklyn Public Library");
      expect(libraries[0]).toHaveTextContent("Delete");
      expect(libraries[0]).toHaveTextContent("Edit");

      // Expanding the library shows the settings that were saved with it,
      // proving the added library retained its short_name and settings.
      await user.click(
        (libraries[0] as HTMLElement).querySelector(
          "button.edit-btn"
        ) as HTMLElement
      );
      const editSection = container.querySelector(
        ".edit-library-settings"
      ) as HTMLElement;
      expect(
        (
          editSection.querySelector(
            'input[name="library_text_setting"]'
          ) as HTMLInputElement
        ).value
      ).toBe("library text");
      expect(
        (
          editSection.querySelector(
            'select[name="library_select_setting"]'
          ) as HTMLSelectElement
        ).value
      ).toBe("option4");
      // Collapse the edit section again.
      await user.click(
        (libraries[0] as HTMLElement).querySelector(
          "button.edit-btn"
        ) as HTMLElement
      );

      // Selecting a different library resets the add-new-library settings.
      await user.selectOptions(addLibrarySelect(), "nypl");
      expect(
        (
          container.querySelector(
            'input[name="library_text_setting"]'
          ) as HTMLInputElement
        ).value
      ).toBe("");
      expect(
        (
          container.querySelector(
            'select[name="library_select_setting"]'
          ) as HTMLSelectElement
        ).value
      ).toBe("option3");
    });

    it("removes a library", async () => {
      const user = userEvent.setup();
      const { container } = renderForm({ item: serviceData });

      let libraries = container.querySelectorAll(".with-remove-button");
      expect(libraries).toHaveLength(1);
      expect(libraries[0]).toHaveTextContent("New York Public Library");

      // The remove button lives inside a collapsed (aria-hidden) panel, so
      // click it by class rather than by accessible role.
      await user.click(
        (libraries[0] as HTMLElement).querySelector(
          "button.remove-btn"
        ) as HTMLElement
      );

      libraries = container.querySelectorAll(".with-remove-button");
      expect(libraries).toHaveLength(0);
    });

    it("edits a library", async () => {
      const user = userEvent.setup();
      const { container } = renderForm({ item: serviceData });

      const libraryItem = container.querySelector(
        ".with-remove-button"
      ) as HTMLElement;
      expect(libraryItem).toHaveTextContent("New York Public Library");

      // The edit button lives inside a collapsed (aria-hidden) panel, so click
      // it by class rather than by accessible role.
      const clickEdit = () =>
        user.click(libraryItem.querySelector("button.edit-btn") as HTMLElement);

      // Open the edit settings; they start with the library's current values.
      await clickEdit();
      let editSection = container.querySelector(
        ".edit-library-settings"
      ) as HTMLElement;
      expect(editSection).toBeInTheDocument();
      let textInput = editSection.querySelector(
        'input[name="library_text_setting"]'
      ) as HTMLInputElement;
      let selectInput = editSection.querySelector(
        'select[name="library_select_setting"]'
      ) as HTMLSelectElement;
      expect(textInput.value).toBe("library text setting");
      expect(selectInput.value).toBe("option4");

      // Change the values but collapse without saving.
      await user.clear(textInput);
      await user.type(textInput, "new library text");
      await user.selectOptions(selectInput, "option3");
      await clickEdit();
      expect(container.querySelector(".edit-library-settings")).toBeNull();

      // Reopening shows the original (unsaved) values.
      await clickEdit();
      editSection = container.querySelector(
        ".edit-library-settings"
      ) as HTMLElement;
      textInput = editSection.querySelector(
        'input[name="library_text_setting"]'
      ) as HTMLInputElement;
      selectInput = editSection.querySelector(
        'select[name="library_select_setting"]'
      ) as HTMLSelectElement;
      expect(textInput.value).toBe("library text setting");
      expect(selectInput.value).toBe("option4");

      // This time change the values and click Save.
      await user.clear(textInput);
      await user.type(textInput, "new library text");
      await user.selectOptions(selectInput, "option3");
      await user.click(
        editSection.querySelector("button.edit-library") as HTMLElement
      );

      // The library remains (short_name unchanged) and reopening the editor
      // shows the newly saved values.
      const libraries = container.querySelectorAll(".with-remove-button");
      expect(libraries).toHaveLength(1);
      await clickEdit();
      editSection = container.querySelector(
        ".edit-library-settings"
      ) as HTMLElement;
      expect(
        (
          editSection.querySelector(
            'input[name="library_text_setting"]'
          ) as HTMLInputElement
        ).value
      ).toBe("new library text");
      expect(
        (
          editSection.querySelector(
            'select[name="library_select_setting"]'
          ) as HTMLSelectElement
        ).value
      ).toBe("option3");
    });

    it("calls save when the form is submitted", async () => {
      // The reusable Form wires submission solely through its submit button's
      // onClick, so clicking it is the only way to submit; assert the resulting
      // save receives the built form data.
      const user = userEvent.setup();
      const { container } = renderForm();

      await user.click(
        within(container).getByRole("button", { name: "Submit" })
      );
      expect(save).toHaveBeenCalledTimes(1);
      expect(save.mock.calls[0][0]).toBeInstanceOf(FormDataShim);
    });

    it("calls save on submit even if there is a collapsible panel", async () => {
      const user = userEvent.setup();
      const { container } = renderForm();

      await user.selectOptions(
        container.querySelector('select[name="protocol"]') as HTMLSelectElement,
        "protocol with instructions"
      );
      expect(container.querySelectorAll(".panel")).toHaveLength(3);

      await user.click(
        within(container).getByRole("button", { name: "Submit" })
      );
      expect(save).toHaveBeenCalledTimes(1);
    });

    it("calls handleData", async () => {
      // handleData has no direct DOM effect; observe it via the side effect it
      // performs on submit — appending the JSON-encoded libraries to the data
      // passed to `save`.
      const user = userEvent.setup();
      const { container } = renderForm({ item: serviceData });

      await user.click(
        within(container).getByRole("button", { name: "Submit" })
      );

      expect(save).toHaveBeenCalledTimes(1);
      const formData = save.mock.calls[0][0];
      expect(formData.get("libraries")).toBe(
        JSON.stringify(serviceData.libraries)
      );
    });

    it("submits data", async () => {
      const user = userEvent.setup();
      const { container } = renderForm({ item: serviceData });

      await user.click(
        within(container).getByRole("button", { name: "Submit" })
      );

      expect(save).toHaveBeenCalledTimes(1);
      const formData = save.mock.calls[0][0];
      expect(formData.get("id")).toBe("2");
      expect(formData.get("protocol")).toBe("protocol 1");
      expect(formData.get("text_setting")).toBe("text setting");
      expect(formData.get("select_setting")).toBe("option2");
      expect(formData.get("libraries")).toBe(
        JSON.stringify(serviceData.libraries)
      );
    });

    it("clears the form", async () => {
      const user = userEvent.setup();
      const { container, rerender } = renderForm();

      const nameInput = () =>
        container.querySelector('input[name="name"]') as HTMLInputElement;
      await user.type(nameInput(), "new service");
      expect(nameInput().value).toBe("new service");

      // A successful response (no error) clears the form fields.
      rerenderForm(rerender, { responseBody: "new service" });
      expect(nameInput().value).toBe("");
    });

    it("doesn't clear the form if there's an error message", async () => {
      const user = userEvent.setup();
      const { container, rerender } = renderForm();

      const nameInput = () =>
        container.querySelector('input[name="name"]') as HTMLInputElement;
      await user.type(nameInput(), "new service");
      expect(nameInput().value).toBe("new service");

      // A response accompanied by a fetch error must NOT clear the form.
      // `fetchError` is read by the component but is not a declared prop, so it
      // is passed via an untyped props object.
      const propsWithError: any = {
        disabled: false,
        data: servicesData,
        save,
        urlBase,
        listDataKey: "services",
        responseBody: "new service",
        fetchError: "ERROR",
      };
      rerender(<TestServiceEditForm {...propsWithError} />);
      expect(nameInput().value).toBe("new service");
    });
  });

  describe("library removal confirmation", () => {
    // The base class's `isLibraryRemovalPermitted` always returns true and is a
    // documented override hook. Rather than stubbing a live instance method
    // (impossible in RTL), subclass the form to control the return value and
    // assert the observable outcome of clicking the real remove button.
    class AllowRemovalServiceEditForm extends ServiceEditForm<ServicesData> {
      isLibraryRemovalPermitted(): boolean {
        return true;
      }
    }
    class BlockRemovalServiceEditForm extends ServiceEditForm<ServicesData> {
      isLibraryRemovalPermitted(): boolean {
        return false;
      }
    }

    const commonProps = () => ({
      disabled: false,
      data: servicesData,
      save,
      item: serviceData,
      urlBase,
      listDataKey: "services",
    });

    const clickRemove = async (container: HTMLElement) => {
      const user = userEvent.setup();
      // The remove button lives inside a collapsed (aria-hidden) panel, so
      // click it by class rather than by accessible role.
      const removeButton = container.querySelector(
        ".with-remove-button button.remove-btn"
      ) as HTMLElement;
      await user.click(removeButton);
    };

    it("should allow removal by default", async () => {
      // Base class: removal permitted by default.
      const { container } = render(<TestServiceEditForm {...commonProps()} />);
      expect(container.querySelectorAll(".with-remove-button")).toHaveLength(1);

      await clickRemove(container);

      expect(container.querySelectorAll(".with-remove-button")).toHaveLength(0);
    });

    it("should allow remove if isLibraryRemovalPermitted returns true", async () => {
      const { container } = render(
        <AllowRemovalServiceEditForm {...commonProps()} />
      );
      expect(container.querySelectorAll(".with-remove-button")).toHaveLength(1);

      await clickRemove(container);

      expect(container.querySelectorAll(".with-remove-button")).toHaveLength(0);
    });

    it("should not allow remove if isLibraryRemovalPermitted returns false", async () => {
      const { container } = render(
        <BlockRemovalServiceEditForm {...commonProps()} />
      );
      expect(container.querySelectorAll(".with-remove-button")).toHaveLength(1);

      await clickRemove(container);

      // Removal is blocked: the library remains.
      const libraries = container.querySelectorAll(".with-remove-button");
      expect(libraries).toHaveLength(1);
      expect(libraries[0]).toHaveTextContent("New York Public Library");
    });
  });
});
