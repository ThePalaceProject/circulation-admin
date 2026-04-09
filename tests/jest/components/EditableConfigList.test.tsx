import * as React from "react";
import { fireEvent } from "@testing-library/react";
import {
  EditableConfigList,
  EditFormProps,
} from "../../../src/components/EditableConfigList";
import renderWithContext from "../testUtils/renderWithContext";
import { ConfigurationSettings } from "../../../src/interfaces";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";

// NB: This adds tests to the already existing tests in:
// - `src/components/__tests__/EditableConfigList-test.tsx`.
//
// Those tests should eventually be migrated here and
// adapted to the Jest/React Testing Library paradigm.

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
    expect(container.querySelector(".library-toggle")).toBeNull();
    expect(container.querySelector(".library-count")).toBeNull();
  });

  it("shows a disabled toggle and 'no libraries' for an item with an empty libraries array", () => {
    const { container } = renderList([
      { id: 1, name: "Service A", libraries: [] },
    ]);
    const toggle = container.querySelector<HTMLButtonElement>(
      ".library-toggle"
    );
    expect(toggle).not.toBeNull();
    expect(toggle.disabled).toBe(true);
    expect(container.querySelector(".library-count").textContent).toBe(
      " (no libraries)"
    );
  });

  it("shows an enabled toggle and '1 library' for an item with one library", () => {
    const { container } = renderList([
      { id: 1, name: "Service A", libraries: [{ short_name: "alpha" }] },
    ]);
    const toggle = container.querySelector<HTMLButtonElement>(
      ".library-toggle"
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
    const toggle = container.querySelector(".library-toggle");

    expect(container.querySelector(".associated-libraries")).toBeNull();
    fireEvent.click(toggle);
    expect(container.querySelector(".associated-libraries")).not.toBeNull();
    fireEvent.click(toggle);
    expect(container.querySelector(".associated-libraries")).toBeNull();
  });

  it("sets aria-expanded correctly as the list is toggled", () => {
    const { container } = renderList([
      { id: 1, name: "Service A", libraries: [{ short_name: "alpha" }] },
    ]);
    const toggle = container.querySelector(".library-toggle");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  // ── Alt+click toggle-all ──────────────────────────────────────────────────

  it("alt+click on any toggle expands all items that have libraries", () => {
    const { container } = renderList([
      { id: 1, name: "A", libraries: [{ short_name: "alpha" }] },
      { id: 2, name: "B", libraries: [] }, // no libraries → toggle disabled
      { id: 3, name: "C", libraries: [{ short_name: "beta" }] },
      { id: 4, name: "D" }, // no libraries field → no toggle
    ]);
    const toggles = container.querySelectorAll(".library-toggle");
    // Items 1, 2 and 3 have a libraries array → 3 toggles; item 4 has none.
    expect(toggles).toHaveLength(3);

    fireEvent.click(toggles[0], { altKey: true });

    const lists = container.querySelectorAll(".associated-libraries");
    // Items 1 and 3 have libraries; item 2 is empty so no list shown even when "expanded".
    expect(lists).toHaveLength(2);
  });

  it("alt+click collapses all items when all expandable items are already expanded", () => {
    const { container } = renderList([
      { id: 1, name: "A", libraries: [{ short_name: "alpha" }] },
      { id: 2, name: "B", libraries: [{ short_name: "beta" }] },
    ]);
    const toggles = container.querySelectorAll(".library-toggle");

    // Expand all first.
    fireEvent.click(toggles[0], { altKey: true });
    expect(container.querySelectorAll(".associated-libraries")).toHaveLength(2);

    // Alt+click again should collapse all.
    fireEvent.click(toggles[0], { altKey: true });
    expect(container.querySelectorAll(".associated-libraries")).toHaveLength(0);
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
    fireEvent.click(container.querySelector(".library-toggle"));

    const items = container.querySelectorAll(".associated-libraries li");
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toBe("Alpha Library");
    expect(items[1].textContent).toBe("Beta Library");
    expect(items[2].textContent).toBe("Gamma Library");
  });

  it("renders a library with a uuid as a link to its config page", () => {
    const { container } = renderList([
      { id: 1, name: "Service A", libraries: [{ short_name: "alpha" }] },
    ]);
    fireEvent.click(container.querySelector(".library-toggle"));

    const link = container.querySelector<HTMLAnchorElement>(
      ".associated-libraries a"
    );
    expect(link).not.toBeNull();
    expect(link.textContent).toBe("Alpha Library");
    expect(link.href).toContain("/admin/web/config/libraries/edit/uuid-alpha");
  });

  it("renders a library without a uuid as plain text (no link)", () => {
    const { container } = renderList([
      { id: 1, name: "Service A", libraries: [{ short_name: "delta" }] },
    ]);
    fireEvent.click(container.querySelector(".library-toggle"));

    expect(container.querySelector(".associated-libraries a")).toBeNull();
    expect(
      container.querySelector(".associated-libraries li").textContent
    ).toBe("Delta Library");
  });

  it("falls back to short_name when no display name is available in allLibraries", () => {
    const { container } = renderList([
      { id: 1, name: "Service A", libraries: [{ short_name: "unknown" }] },
    ]);
    fireEvent.click(container.querySelector(".library-toggle"));

    expect(
      container.querySelector(".associated-libraries li").textContent
    ).toBe("unknown");
  });
});
