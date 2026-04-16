import * as React from "react";
import { fireEvent } from "@testing-library/react";
import { Collections } from "../../../src/components/Collections";
import renderWithContext from "../testUtils/renderWithContext";
import {
  CollectionsData,
  ConfigurationSettings,
} from "../../../src/interfaces";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";

// NB: This adds tests to the already existing tests in:
// - `src/components/__tests__/Collections-test.tsx`.
//
// Those tests should eventually be migrated here and
// adapted to the Jest/React Testing Library paradigm.

describe("Collections - associated library disclosure", () => {
  // ── Shared fixtures ───────────────────────────────────────────────────────

  const allLibraries = [
    { short_name: "gamma", name: "Gamma Library", uuid: "uuid-gamma" },
    { short_name: "alpha", name: "Alpha Library", uuid: "uuid-alpha" },
    { short_name: "beta", name: "Beta Library", uuid: "uuid-beta" },
    { short_name: "delta", name: "Delta Library" }, // no uuid
  ];

  const sysAdminConfig: Partial<ConfigurationSettings> = {
    csrfToken: "",
    featureFlags: defaultFeatureFlags,
    roles: [{ role: "system" }],
  };

  const renderCollections = (data: Partial<CollectionsData>) =>
    renderWithContext(
      <Collections
        data={
          {
            collections: [],
            protocols: [],
            allLibraries,
            ...data,
          } as CollectionsData
        }
        fetchData={jest.fn()}
        editItem={jest.fn().mockResolvedValue(undefined)}
        deleteItem={jest.fn().mockResolvedValue(undefined)}
        registerLibrary={jest.fn().mockResolvedValue(undefined)}
        importCollection={jest.fn().mockResolvedValue(undefined)}
        csrfToken="token"
        isFetching={false}
      />,
      sysAdminConfig
    );

  // ── Toggle visibility ─────────────────────────────────────────────────────

  it("shows no toggle for a collection without a libraries field", () => {
    const { container } = renderCollections({
      collections: [{ id: 1, protocol: "p", name: "My Collection" } as any],
    });
    expect(container.querySelector(".association-toggle")).toBeNull();
    expect(container.querySelector(".library-count")).toBeNull();
  });

  it("shows a disabled toggle and 'no libraries' for a collection with an empty libraries array", () => {
    const { container } = renderCollections({
      collections: [
        { id: 1, protocol: "p", name: "My Collection", libraries: [] } as any,
      ],
    });
    const toggle = container.querySelector<HTMLButtonElement>(
      ".association-toggle"
    );
    expect(toggle).not.toBeNull();
    expect(toggle.disabled).toBe(true);
    expect(container.querySelector(".library-count").textContent).toBe(
      " (no libraries)"
    );
  });

  it("shows '1 library' for a collection with one associated library", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [{ short_name: "alpha" }],
        } as any,
      ],
    });
    const toggle = container.querySelector<HTMLButtonElement>(
      ".association-toggle"
    );
    expect(toggle.disabled).toBe(false);
    expect(container.querySelector(".library-count").textContent).toBe(
      " (1 library)"
    );
  });

  it("shows 'N libraries' for a collection with multiple associated libraries", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [
            { short_name: "alpha" },
            { short_name: "beta" },
            { short_name: "gamma" },
          ],
        } as any,
      ],
    });
    expect(container.querySelector(".library-count").textContent).toBe(
      " (3 libraries)"
    );
  });

  // ── Expand / collapse ─────────────────────────────────────────────────────

  it("expands the library list on toggle click and collapses on a second click", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [{ short_name: "alpha" }, { short_name: "beta" }],
        } as any,
      ],
    });
    const toggle = container.querySelector(".association-toggle");
    expect(container.querySelector(".associated-items")).toBeNull();
    fireEvent.click(toggle);
    expect(container.querySelector(".associated-items")).not.toBeNull();
    fireEvent.click(toggle);
    expect(container.querySelector(".associated-items")).toBeNull();
  });

  // ── allLibraries injection from mapStateToProps ───────────────────────────

  it("resolves library display names from allLibraries", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [{ short_name: "alpha" }, { short_name: "beta" }],
        } as any,
      ],
    });
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    // Sorted alphabetically: Alpha, Beta
    expect(items[0].textContent).toBe("Alpha Library");
    expect(items[1].textContent).toBe("Beta Library");
  });

  it("links a library name to its config page when a uuid is available", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [{ short_name: "alpha" }],
        } as any,
      ],
    });
    fireEvent.click(container.querySelector(".association-toggle"));

    const link = container.querySelector<HTMLAnchorElement>(
      ".associated-items a"
    );
    expect(link).not.toBeNull();
    expect(link.textContent).toBe("Alpha Library");
    expect(link.href).toContain("/admin/web/config/libraries/edit/uuid-alpha");
  });

  it("renders a library without a uuid as plain text", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [{ short_name: "delta" }],
        } as any,
      ],
    });
    fireEvent.click(container.querySelector(".association-toggle"));

    expect(container.querySelector(".associated-items a")).toBeNull();
    expect(container.querySelector(".associated-items li").textContent).toBe(
      "Delta Library"
    );
  });

  it("falls back to short_name when the library is not in allLibraries", () => {
    const { container } = renderCollections({
      collections: [
        {
          id: 1,
          protocol: "p",
          name: "My Collection",
          libraries: [{ short_name: "unknown" }],
        } as any,
      ],
    });
    fireEvent.click(container.querySelector(".association-toggle"));

    expect(container.querySelector(".associated-items li").textContent).toBe(
      "unknown"
    );
  });
});
