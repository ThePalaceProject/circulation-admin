import * as React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  EditableConfigList,
  EditFormProps,
  AdditionalContentProps,
} from "../../../src/components/EditableConfigList";
import renderWithContext from "../testUtils/renderWithContext";
import { ConfigurationSettings } from "../../../src/interfaces";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";
import * as navigate from "../../../src/utils/navigate";

describe("EditableConfigList - library association disclosure", () => {
  // ── Test doubles ──────────────────────────────────────────────────────────

  interface ServiceItem {
    id: number;
    name: string;
    libraries?: Array<{ short_name: string }>;
  }

  interface ServicesData {
    services: ServiceItem[];
    allLibraries?: Array<{ short_name: string; name?: string; uuid?: string }>;
  }

  class TestEditForm extends React.Component<
    EditFormProps<ServicesData, ServiceItem>
  > {
    render() {
      return <div />;
    }
  }

  class TestServiceList extends EditableConfigList<ServicesData, ServiceItem> {
    EditForm = TestEditForm;
    listDataKey = "services";
    itemTypeName = "service";
    urlBase = "/admin/services/";
    identifierKey = "id";
    labelKey = "name";
    canCreate() {
      return false;
    }
    canDelete() {
      return false;
    }
  }

  // ── Shared fixtures ───────────────────────────────────────────────────────

  const allLibraries = [
    { short_name: "gamma", name: "Gamma Library", uuid: "uuid-gamma" },
    { short_name: "alpha", name: "Alpha Library", uuid: "uuid-alpha" },
    { short_name: "beta", name: "Beta Library", uuid: "uuid-beta" },
    { short_name: "delta", name: "Delta Library" }, // no uuid
  ];

  const config: Partial<ConfigurationSettings> = {
    csrfToken: "",
    featureFlags: defaultFeatureFlags,
    roles: [{ role: "system" }],
  };

  const renderList = (items: ServiceItem[]) =>
    renderWithContext(
      <TestServiceList
        data={{ services: items, allLibraries }}
        fetchData={jest.fn()}
        editItem={jest.fn().mockResolvedValue(undefined)}
        deleteItem={jest.fn().mockResolvedValue(undefined)}
        csrfToken="token"
        isFetching={false}
      />,
      config
    );

  // ── Toggle visibility ─────────────────────────────────────────────────────

  it("shows no toggle for an item without a libraries field", () => {
    const { container } = renderList([{ id: 1, name: "Service A" }]);
    expect(container.querySelector(".association-toggle")).toBeNull();
    expect(container.querySelector(".library-count")).toBeNull();
  });

  it("shows a disabled toggle and 'no libraries' for an item with an empty libraries array", () => {
    const { container } = renderList([
      { id: 1, name: "Service A", libraries: [] },
    ]);
    const toggle = container.querySelector<HTMLButtonElement>(
      ".association-toggle"
    );
    expect(toggle).not.toBeNull();
    expect(toggle.disabled).toBe(true);
    // aria-expanded is omitted on a permanently-disabled toggle (it can never change state).
    expect(toggle.getAttribute("aria-expanded")).toBeNull();
    expect(container.querySelector(".library-count").textContent).toBe(
      " (no libraries)"
    );
  });

  it("shows an enabled toggle and '1 library' for an item with one library", () => {
    const { container } = renderList([
      { id: 1, name: "Service A", libraries: [{ short_name: "alpha" }] },
    ]);
    const toggle = container.querySelector<HTMLButtonElement>(
      ".association-toggle"
    );
    expect(toggle.disabled).toBe(false);
    expect(container.querySelector(".library-count").textContent).toBe(
      " (1 library)"
    );
  });

  it("shows 'N libraries' for an item with multiple libraries", () => {
    const { container } = renderList([
      {
        id: 1,
        name: "Service A",
        libraries: [
          { short_name: "alpha" },
          { short_name: "beta" },
          { short_name: "gamma" },
        ],
      },
    ]);
    expect(container.querySelector(".library-count").textContent).toBe(
      " (3 libraries)"
    );
  });

  // ── Expand / collapse ─────────────────────────────────────────────────────

  it("expands the library list on toggle click and collapses on a second click", () => {
    const { container } = renderList([
      {
        id: 1,
        name: "Service A",
        libraries: [{ short_name: "alpha" }, { short_name: "beta" }],
      },
    ]);
    const toggle = container.querySelector(".association-toggle");

    expect(container.querySelector(".associated-items")).toBeNull();
    fireEvent.click(toggle);
    expect(container.querySelector(".associated-items")).not.toBeNull();
    fireEvent.click(toggle);
    expect(container.querySelector(".associated-items")).toBeNull();
  });

  it("sets aria-expanded correctly as the list is toggled", () => {
    const { container } = renderList([
      { id: 1, name: "Service A", libraries: [{ short_name: "alpha" }] },
    ]);
    const toggle = container.querySelector(".association-toggle");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  // ── Expand all / Collapse all buttons ────────────────────────────────────

  it("shows no expand/collapse controls when no items have libraries", () => {
    const { container } = renderList([
      { id: 1, name: "A", libraries: [] },
      { id: 2, name: "B" },
    ]);
    expect(container.querySelector(".expand-collapse-controls")).toBeNull();
  });

  it("shows expand/collapse controls when at least one item has libraries", () => {
    const { container } = renderList([
      { id: 1, name: "A", libraries: [{ short_name: "alpha" }] },
    ]);
    const controlSets = container.querySelectorAll(".expand-collapse-controls");
    // One set above the list and one below (visual duplicate).
    expect(controlSets).toHaveLength(2);
    // Top set: functional, in tab order, not hidden from accessibility tree.
    const topSet = controlSets[0];
    expect(topSet.closest("[aria-hidden]")).toBeNull();
    expect(
      topSet.querySelector<HTMLButtonElement>(".expand-all").tabIndex
    ).not.toBe(-1);
    expect(
      topSet.querySelector<HTMLButtonElement>(".expand-all").disabled
    ).toBe(false);
    expect(
      topSet.querySelector<HTMLButtonElement>(".collapse-all").disabled
    ).toBe(true);
    // Bottom set: hidden from accessibility tree and removed from tab order.
    const bottomSet = controlSets[1];
    expect(bottomSet.closest("[aria-hidden='true']")).not.toBeNull();
    expect(
      bottomSet.querySelector<HTMLButtonElement>(".expand-all").tabIndex
    ).toBe(-1);
    expect(
      bottomSet.querySelector<HTMLButtonElement>(".collapse-all").tabIndex
    ).toBe(-1);
  });

  it("Expand all expands all items that have libraries", () => {
    const { container } = renderList([
      { id: 1, name: "A", libraries: [{ short_name: "alpha" }] },
      { id: 2, name: "B", libraries: [] }, // no libraries → toggle disabled
      { id: 3, name: "C", libraries: [{ short_name: "beta" }] },
      { id: 4, name: "D" }, // no libraries field → no toggle
    ]);

    fireEvent.click(container.querySelector(".expand-all"));

    const lists = container.querySelectorAll(".associated-items");
    // Items 1 and 3 have libraries; item 2 is empty so no list shown even when expanded.
    expect(lists).toHaveLength(2);
    expect(
      container.querySelector<HTMLButtonElement>(".expand-all").disabled
    ).toBe(true);
    expect(
      container.querySelector<HTMLButtonElement>(".collapse-all").disabled
    ).toBe(false);
  });

  it("Collapse all collapses all expanded items", () => {
    const { container } = renderList([
      { id: 1, name: "A", libraries: [{ short_name: "alpha" }] },
      { id: 2, name: "B", libraries: [{ short_name: "beta" }] },
    ]);

    fireEvent.click(container.querySelector(".expand-all"));
    expect(container.querySelectorAll(".associated-items")).toHaveLength(2);

    fireEvent.click(container.querySelector(".collapse-all"));
    expect(container.querySelectorAll(".associated-items")).toHaveLength(0);
    expect(
      container.querySelector<HTMLButtonElement>(".collapse-all").disabled
    ).toBe(true);
  });

  // ── Alt+click toggle-all ──────────────────────────────────────────────────

  it("alt+click on any toggle expands all items that have libraries", () => {
    const { container } = renderList([
      { id: 1, name: "A", libraries: [{ short_name: "alpha" }] },
      { id: 2, name: "B", libraries: [] }, // no libraries → toggle disabled
      { id: 3, name: "C", libraries: [{ short_name: "beta" }] },
      { id: 4, name: "D" }, // no libraries field → no toggle
    ]);
    const toggles = container.querySelectorAll(".association-toggle");
    // Items 1, 2 and 3 have a libraries array → 3 toggles; item 4 has none.
    expect(toggles).toHaveLength(3);

    fireEvent.click(toggles[0], { altKey: true });

    const lists = container.querySelectorAll(".associated-items");
    // Items 1 and 3 have libraries; item 2 is empty so no list shown even when "expanded".
    expect(lists).toHaveLength(2);
  });

  it("alt+click collapses all items when all expandable items are already expanded", () => {
    const { container } = renderList([
      { id: 1, name: "A", libraries: [{ short_name: "alpha" }] },
      { id: 2, name: "B", libraries: [{ short_name: "beta" }] },
    ]);
    const toggles = container.querySelectorAll(".association-toggle");

    // Expand all first.
    fireEvent.click(toggles[0], { altKey: true });
    expect(container.querySelectorAll(".associated-items")).toHaveLength(2);

    // Alt+click again should collapse all.
    fireEvent.click(toggles[0], { altKey: true });
    expect(container.querySelectorAll(".associated-items")).toHaveLength(0);
  });

  // ── Sorted library list ───────────────────────────────────────────────────

  it("renders associated libraries sorted alphabetically by display name", () => {
    const { container } = renderList([
      {
        id: 1,
        name: "Service A",
        libraries: [
          { short_name: "gamma" },
          { short_name: "alpha" },
          { short_name: "beta" },
        ],
      },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toBe("Alpha Library");
    expect(items[1].textContent).toBe("Beta Library");
    expect(items[2].textContent).toBe("Gamma Library");
  });

  it("renders a library with a uuid as a link to its config page", () => {
    const { container } = renderList([
      { id: 1, name: "Service A", libraries: [{ short_name: "alpha" }] },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const link = container.querySelector<HTMLAnchorElement>(
      ".associated-items a"
    );
    expect(link).not.toBeNull();
    expect(link.textContent).toBe("Alpha Library");
    expect(link.href).toContain("/admin/web/config/libraries/edit/uuid-alpha");
  });

  it("renders a library without a uuid as plain text (no link)", () => {
    const { container } = renderList([
      { id: 1, name: "Service A", libraries: [{ short_name: "delta" }] },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    expect(container.querySelector(".associated-items a")).toBeNull();
    expect(container.querySelector(".associated-items li").textContent).toBe(
      "Delta Library"
    );
  });

  it("falls back to short_name when no display name is available in allLibraries", () => {
    const { container } = renderList([
      { id: 1, name: "Service A", libraries: [{ short_name: "unknown" }] },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    expect(container.querySelector(".associated-items li").textContent).toBe(
      "unknown"
    );
  });

  it("renders multiple libraries that are not in allLibraries, each falling back to its short_name", () => {
    // Neither library is in allLibraries, so both fall back to their short_name
    // as the display label. Distinct short_names → distinct labels → no key collision.
    const { container } = renderList([
      {
        id: 1,
        name: "Service A",
        libraries: [{ short_name: "dup-a" }, { short_name: "dup-b" }],
      },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toBe("dup-a");
    expect(items[1].textContent).toBe("dup-b");
  });

  describe("renderAssociatedLibraries", () => {
    it("renders no associated-items panel when the item has no libraries property", () => {
      const { container } = renderList([{ id: 1, name: "A" }]);
      expect(container.querySelector(".associated-items")).toBeNull();
    });

    it("renders no associated-items panel when the item has an empty libraries array", () => {
      const { container } = renderList([{ id: 1, name: "A", libraries: [] }]);
      expect(container.querySelector(".associated-items")).toBeNull();
    });

    it("renders library names resolved from allLibraries on expand", () => {
      const { container } = renderList([
        {
          id: 1,
          name: "Service A",
          libraries: [{ short_name: "alpha" }, { short_name: "beta" }],
        },
      ]);
      fireEvent.click(container.querySelector(".association-toggle"));
      const items = container.querySelectorAll(".associated-items li");
      expect(items).toHaveLength(2);
      // Sorted alphabetically by resolved display name.
      expect(items[0].textContent).toBe("Alpha Library");
      expect(items[1].textContent).toBe("Beta Library");
    });

    it("falls back to short_name when allLibraries is absent from the data", () => {
      const { container } = renderWithContext(
        <TestServiceList
          data={{
            services: [
              { id: 1, name: "Service A", libraries: [{ short_name: "nypl" }] },
            ],
          }}
          fetchData={jest.fn()}
          editItem={jest.fn().mockResolvedValue(undefined)}
          deleteItem={jest.fn().mockResolvedValue(undefined)}
          csrfToken="token"
          isFetching={false}
        />,
        config
      );
      fireEvent.click(container.querySelector(".association-toggle"));
      expect(container.querySelector(".associated-items li").textContent).toBe(
        "nypl"
      );
    });
  });
});

// These exercise the abstract base class through concrete test subclasses,
// asserting observable DOM instead of reaching into instances.
describe("EditableConfigList - base class via test subclasses", () => {
  interface Thing {
    id: number;
    label: string;
    level?: number;
  }

  interface Things {
    things: Thing[];
  }

  // Closure-controlled permission flags.
  let canCreate: boolean;
  let canDelete: boolean;
  let canEdit: boolean;

  // A test EditForm that surfaces the props the base class passes to it, so
  // prop-only assertions can be checked against the rendered DOM.
  class ThingEditForm extends React.Component<EditFormProps<Things, Thing>> {
    render(): JSX.Element {
      const { disabled, save, item, listDataKey, adminLevel } = this.props;
      return (
        <div className="thing-edit-form">
          <span data-testid="ef-disabled">{String(disabled)}</span>
          <span data-testid="ef-has-save">{String(!!save)}</span>
          <span data-testid="ef-datakey">{listDataKey}</span>
          <span data-testid="ef-item">{item ? String(item.id) : "none"}</span>
          <span data-testid="ef-adminlevel">{String(adminLevel)}</span>
          <button
            type="button"
            data-testid="ef-save"
            onClick={() => save && save(new FormData())}
          >
            submit form
          </button>
        </div>
      );
    }
  }

  class ThingAdditionalContent extends React.Component<
    AdditionalContentProps<Things, Thing>
  > {
    render(): JSX.Element {
      return (
        <div
          className="additional-content"
          data-item-id={String((this.props.item as any)?.id)}
          data-csrf={this.props.csrfToken}
        >
          Test Additional Content
        </div>
      );
    }
  }

  // Uses the base implementations of canCreate/canDelete/canEdit.
  class BaseThingList extends EditableConfigList<Things, Thing> {
    EditForm = ThingEditForm;
    listDataKey = "things";
    itemTypeName = "thing";
    urlBase = "/admin/things/";
    identifierKey = "id";
    labelKey = "label";
  }

  // Overrides permission checks from the closure flags.
  class ThingEditableConfigList extends BaseThingList {
    label(item): string {
      return "test " + super.label(item);
    }
    canCreate() {
      return canCreate;
    }
    canDelete() {
      return canDelete;
    }
    canEdit() {
      return canEdit;
    }
  }

  class OneThingEditableConfigList extends ThingEditableConfigList {
    limitOne = true;
  }

  class ThingAdditionalContentEditableConfigList extends ThingEditableConfigList {
    AdditionalContent = ThingAdditionalContent;
  }

  class CapsThingList extends BaseThingList {
    itemTypeName = "CDN";
  }

  class ThingWithSelfTests extends ThingEditableConfigList {
    links = {
      info: (
        <>
          Self-tests for the things have been moved to{" "}
          <a href="/admin/web/troubleshooting/self-tests/thingServices">
            the troubleshooting page
          </a>
          .
        </>
      ),
      footer: (
        <>
          Problems with your things? Please visit{" "}
          <a href="/admin/web/troubleshooting/self-tests/thingServices">
            the troubleshooting page
          </a>
          .
        </>
      ),
    };
  }

  const thingData: Thing = { id: 5, label: "label" };
  const thingsData: Things = { things: [thingData] };

  let fetchData: jest.Mock;
  let editItem: jest.Mock;
  let deleteItem: jest.Mock;

  const systemConfig: Partial<ConfigurationSettings> = {
    csrfToken: "token",
    featureFlags: defaultFeatureFlags,
    roles: [{ role: "system", library: "nypl" }],
  };

  const configWithRoles = (
    roles: Partial<ConfigurationSettings>["roles"]
  ): Partial<ConfigurationSettings> => ({
    csrfToken: "token",
    featureFlags: defaultFeatureFlags,
    roles,
  });

  const baseProps = (overrides: Record<string, any> = {}) => ({
    data: thingsData,
    fetchData,
    editItem,
    deleteItem,
    csrfToken: "token",
    isFetching: false,
    ...overrides,
  });

  beforeEach(() => {
    fetchData = jest.fn();
    editItem = jest.fn().mockResolvedValue(undefined);
    deleteItem = jest.fn().mockResolvedValue(undefined);
    canCreate = true;
    canDelete = true;
    canEdit = true;
    jest.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows an error message if there's a problem loading the list", () => {
    const { container, rerender } = renderWithContext(
      <ThingEditableConfigList {...baseProps()} />,
      systemConfig
    );
    expect(container.querySelector(".alert-danger")).toBeNull();

    const fetchError = {
      status: 404,
      response: "test load error",
      url: "test url",
    };
    rerender(<ThingEditableConfigList {...baseProps({ fetchError })} />);
    expect(container.querySelector(".alert-danger")).not.toBeNull();
    expect(screen.getByText("Error: test load error")).toBeInTheDocument();

    // Hidden when the user goes to the form.
    rerender(
      <ThingEditableConfigList
        {...baseProps({ fetchError, editOrCreate: "create" })}
      />
    );
    expect(container.querySelector(".alert-danger")).toBeNull();
  });

  it("shows form submission error message only if the form is displayed", () => {
    const formError = {
      status: 400,
      response: "test submission error",
      url: "test url",
    };
    const { container, rerender } = renderWithContext(
      <ThingEditableConfigList {...baseProps({ formError })} />,
      systemConfig
    );
    // Not displayed while looking at the list.
    expect(container.querySelector(".alert-danger")).toBeNull();

    rerender(
      <ThingEditableConfigList
        {...baseProps({ formError, editOrCreate: "create" })}
      />
    );
    expect(container.querySelector(".alert-danger")).not.toBeNull();
    expect(
      screen.getByText("Error: test submission error")
    ).toBeInTheDocument();

    // Hidden when the user goes back to the list.
    rerender(
      <ThingEditableConfigList
        {...baseProps({ formError, editOrCreate: "" })}
      />
    );
    expect(container.querySelector(".alert-danger")).toBeNull();
  });

  it("shows a success message with an edit link on create", () => {
    const { container } = renderWithContext(
      <ThingEditableConfigList
        {...baseProps({ responseBody: "itemType", editOrCreate: "create" })}
      />,
      systemConfig
    );
    const success = container.querySelector(".alert-success");
    expect(success).not.toBeNull();
    expect(success.textContent).toBe("Successfully created a new thing");
    const link = success.querySelector<HTMLAnchorElement>("a");
    expect(link).not.toBeNull();
    expect(link.getAttribute("href")).toBe("/admin/things/edit/itemType");
  });

  it("shows a success message without a link on edit", () => {
    const { container } = renderWithContext(
      <ThingEditableConfigList
        {...baseProps({ responseBody: "itemType", editOrCreate: "edit" })}
      />,
      systemConfig
    );
    const success = container.querySelector(".alert-success");
    expect(success).not.toBeNull();
    expect(success.textContent).toBe("Successfully edited this thing");
    expect(success.querySelector("a")).toBeNull();
  });

  it("keeps all-caps item type names uppercase in the success message", () => {
    const { container } = renderWithContext(
      <CapsThingList
        {...baseProps({ responseBody: "itemType", editOrCreate: "create" })}
      />,
      systemConfig
    );
    const success = container.querySelector(".alert-success");
    expect(success.textContent).toBe("Successfully created a new CDN");
  });

  it("shows a loading indicator only while fetching", () => {
    const { rerender } = renderWithContext(
      <ThingEditableConfigList {...baseProps()} />,
      systemConfig
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(<ThingEditableConfigList {...baseProps({ isFetching: true })} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows the thing header", () => {
    renderWithContext(
      <ThingEditableConfigList {...baseProps()} />,
      systemConfig
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Thing configuration" })
    ).toBeInTheDocument();
  });

  it("shows the thing list with an edit link and a count", () => {
    const { container } = renderWithContext(
      <ThingEditableConfigList {...baseProps()} />,
      systemConfig
    );
    const items = container.querySelectorAll("ul > li");
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain("test label");
    const editLink = items[0].querySelector<HTMLAnchorElement>(".edit-item");
    expect(editLink.getAttribute("href")).toBe("/admin/things/edit/5");
    expect(
      container.querySelector(".list-container header div").textContent
    ).toBe("1 configured");
  });

  it("updates the thing list when new data arrives", () => {
    const { container, rerender } = renderWithContext(
      <ThingEditableConfigList {...baseProps()} />,
      systemConfig
    );
    const newThingsData = {
      things: [thingData, { id: 6, label: "another thing" }],
    };
    rerender(
      <ThingEditableConfigList {...baseProps({ data: newThingsData })} />
    );
    const items = container.querySelectorAll("ul > li");
    expect(items).toHaveLength(2);
    expect(items[1].textContent).toContain("test another thing");
    expect(
      items[1]
        .querySelector<HTMLAnchorElement>(".edit-item")
        .getAttribute("href")
    ).toBe("/admin/things/edit/6");
  });

  it("shows the create link, which respects canCreate", () => {
    const { container, rerender } = renderWithContext(
      <ThingEditableConfigList {...baseProps()} />,
      systemConfig
    );
    const createLink =
      container.querySelector<HTMLAnchorElement>(".create-item");
    expect(createLink.textContent).toBe("Create new thing");
    expect(createLink.getAttribute("href")).toBe("/admin/things/create");

    canCreate = false;
    rerender(<ThingEditableConfigList {...baseProps()} />);
    expect(container.querySelector(".create-item")).toBeNull();
  });

  it("uses the base canCreate (true) when a subclass does not override it", () => {
    const { container } = renderWithContext(
      <BaseThingList {...baseProps()} />,
      systemConfig
    );
    expect(container.querySelector(".create-item")).not.toBeNull();
  });

  it("hides the create link if only one item is allowed and it already exists", () => {
    const { container, rerender } = renderWithContext(
      <OneThingEditableConfigList {...baseProps()} />,
      systemConfig
    );
    expect(container.querySelector(".create-item")).toBeNull();

    rerender(
      <OneThingEditableConfigList {...baseProps({ data: { things: [] } })} />
    );
    const createLink =
      container.querySelector<HTMLAnchorElement>(".create-item");
    expect(createLink).not.toBeNull();
    expect(createLink.getAttribute("href")).toBe("/admin/things/create");
  });

  it("shows a view button instead of an edit button when canEdit is false", () => {
    canEdit = false;
    const { container } = renderWithContext(
      <ThingEditableConfigList
        {...baseProps({
          data: { things: [{ id: 6, label: "View Only", level: 3 }] },
        })}
      />,
      configWithRoles([{ role: "manager", library: "nypl" }])
    );
    const editItemLink = container.querySelector(".edit-item");
    expect(editItemLink.textContent).toContain("View");
    expect(editItemLink.textContent).not.toContain("Edit");
  });

  it("shows a delete button when canDelete is true and hides it otherwise", () => {
    // Base canDelete: system admin (level 3) → delete button shown.
    const shown = renderWithContext(
      <BaseThingList {...baseProps()} />,
      systemConfig
    );
    expect(shown.container.querySelector(".delete-item")).not.toBeNull();
    shown.unmount();

    // Base canDelete for a librarian (level 1) → no delete button.
    const hiddenByRole = renderWithContext(
      <BaseThingList {...baseProps()} />,
      configWithRoles([{ role: "librarian", library: "nypl" }])
    );
    expect(hiddenByRole.container.querySelector(".delete-item")).toBeNull();
    hiddenByRole.unmount();

    // Explicit override returning false → no delete button.
    canDelete = false;
    const hiddenByOverride = renderWithContext(
      <ThingEditableConfigList {...baseProps()} />,
      systemConfig
    );
    expect(hiddenByOverride.container.querySelector(".delete-item")).toBeNull();
  });

  it("deletes an item only after the user confirms", async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);
    const { container } = renderWithContext(
      <BaseThingList {...baseProps()} />,
      systemConfig
    );
    const deleteButton =
      container.querySelector<HTMLButtonElement>(".delete-item");
    expect(deleteButton).not.toBeNull();

    await user.click(deleteButton);
    expect(deleteItem).toHaveBeenCalledTimes(0);

    confirmSpy.mockReturnValue(true);
    await user.click(deleteButton);
    await waitFor(() => expect(deleteItem).toHaveBeenCalledTimes(1));
    expect(deleteItem).toHaveBeenCalledWith(5);
  });

  it("renders the create form and its header", () => {
    renderWithContext(
      <ThingEditableConfigList {...baseProps({ editOrCreate: "create" })} />,
      systemConfig
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Create a new thing" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("ef-item")).toHaveTextContent("none");
    expect(screen.getByTestId("ef-disabled")).toHaveTextContent("false");
    expect(screen.getByTestId("ef-datakey")).toHaveTextContent("things");
    expect(screen.getByTestId("ef-has-save")).toHaveTextContent("true");
  });

  it("renders the edit form with the item and an editable header", () => {
    renderWithContext(
      <ThingEditableConfigList
        {...baseProps({ editOrCreate: "edit", identifier: "5" })}
      />,
      systemConfig
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Edit test label" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("ef-item")).toHaveTextContent("5");
    expect(screen.getByTestId("ef-disabled")).toHaveTextContent("false");
    expect(screen.getByTestId("ef-has-save")).toHaveTextContent("true");
  });

  it("shows a non-editable header, no save function, and a disabled form when canEdit is false", () => {
    canEdit = false;
    renderWithContext(
      <ThingEditableConfigList
        {...baseProps({ editOrCreate: "edit", identifier: "5" })}
      />,
      systemConfig
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "test label" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("ef-has-save")).toHaveTextContent("false");
    expect(screen.getByTestId("ef-disabled")).toHaveTextContent("true");
  });

  it("updates the edit-form header when the item's label changes", () => {
    const { rerender } = renderWithContext(
      <ThingEditableConfigList
        {...baseProps({ editOrCreate: "edit", identifier: "5" })}
      />,
      systemConfig
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Edit test label" })
    ).toBeInTheDocument();

    rerender(
      <ThingEditableConfigList
        {...baseProps({
          editOrCreate: "edit",
          identifier: "5",
          data: { things: [{ id: 5, label: "new thing!" }] },
        })}
      />
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Edit test new thing!" })
    ).toBeInTheDocument();
  });

  it("fetches on mount, passes a working save function, and refetches on save", async () => {
    const user = userEvent.setup();
    renderWithContext(
      <ThingEditableConfigList {...baseProps({ editOrCreate: "create" })} />,
      systemConfig
    );
    expect(fetchData).toHaveBeenCalledTimes(1);
    expect(editItem).toHaveBeenCalledTimes(0);

    await user.click(screen.getByTestId("ef-save"));
    expect(editItem).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(2));
  });

  it("does not fetch on mount if a fetch is already in progress", () => {
    renderWithContext(
      <ThingEditableConfigList {...baseProps({ isFetching: true })} />,
      systemConfig
    );
    expect(fetchData).toHaveBeenCalledTimes(0);
  });

  it("navigates to the edit page after successfully creating a limit-one item", async () => {
    const user = userEvent.setup();
    const navigateSpy = jest
      .spyOn(navigate, "navigateTo")
      .mockImplementation(() => undefined);
    renderWithContext(
      <OneThingEditableConfigList
        {...baseProps({ editOrCreate: "create", responseBody: "99" })}
      />,
      systemConfig
    );
    await user.click(screen.getByTestId("ef-save"));
    await waitFor(
      () => expect(navigateSpy).toHaveBeenCalledWith("/admin/things/edit/99"),
      { timeout: 3000 }
    );
  });

  it("does not render AdditionalContent unless the subclass supplies it", () => {
    const { container, unmount } = renderWithContext(
      <ThingEditableConfigList {...baseProps()} />,
      systemConfig
    );
    expect(container.querySelector(".additional-content")).toBeNull();
    unmount();

    const withContent = renderWithContext(
      <ThingAdditionalContentEditableConfigList {...baseProps()} />,
      systemConfig
    );
    const additional = withContent.container.querySelector<HTMLElement>(
      ".additional-content"
    );
    expect(additional).not.toBeNull();
    expect(additional.textContent).toBe("Test Additional Content");
    expect(additional.getAttribute("data-item-id")).toBe("5");
    expect(additional.getAttribute("data-csrf")).toBe("token");
  });

  it("shows the troubleshooting link and info alert only when there are self-tests", () => {
    const { container, unmount } = renderWithContext(
      <ThingEditableConfigList {...baseProps()} />,
      systemConfig
    );
    // No self-tests configured → neither the info alert nor the footer link.
    expect(container.querySelector(".alert-info")).toBeNull();
    expect(screen.queryByText(/visit the troubleshooting page/)).toBeNull();
    unmount();

    const withSelfTests = renderWithContext(
      <ThingWithSelfTests {...baseProps()} />,
      systemConfig
    );
    const info = withSelfTests.container.querySelector(".alert-info");
    expect(info.textContent).toBe(
      "Self-tests for the things have been moved to the troubleshooting page."
    );
    expect(info.querySelector("a").getAttribute("href")).toBe(
      "/admin/web/troubleshooting/self-tests/thingServices"
    );

    const footer = withSelfTests.container.querySelector("p");
    expect(footer.textContent).toBe(
      "Problems with your things? Please visit the troubleshooting page."
    );
    expect(footer.querySelector("a").getAttribute("href")).toBe(
      "/admin/web/troubleshooting/self-tests/thingServices"
    );
  });

  it("figures out what level of permissions the admin has", () => {
    const adminLevelFor = (roles) => {
      const { getByTestId, unmount } = renderWithContext(
        <BaseThingList {...baseProps({ editOrCreate: "create" })} />,
        configWithRoles(roles)
      );
      const level = getByTestId("ef-adminlevel").textContent;
      unmount();
      return level;
    };

    expect(adminLevelFor([{ role: "system", library: "nypl" }])).toBe("3");
    expect(adminLevelFor([{ role: "manager", library: "nypl" }])).toBe("2");
    expect(adminLevelFor([{ role: "librarian", library: "nypl" }])).toBe("1");
  });
});
