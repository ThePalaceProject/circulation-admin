import * as React from "react";
import { fireEvent } from "@testing-library/react";
import { DiscoveryServices } from "../../../src/components/DiscoveryServices";
import renderWithContext from "../testUtils/renderWithContext";
import {
  ConfigurationSettings,
  DiscoveryServicesData,
} from "../../../src/interfaces";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";

// NB: This adds tests to the already existing tests in:
// - `src/components/__tests__/DiscoveryServices-test.tsx`.
//
// Those tests should eventually be migrated here and
// adapted to the Jest/React Testing Library paradigm.

describe("DiscoveryServices - registered library disclosure", () => {
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

  const renderServices = (data: Partial<DiscoveryServicesData>) =>
    renderWithContext(
      <DiscoveryServices
        data={
          {
            discovery_services: [],
            allLibraries,
            ...data,
          } as DiscoveryServicesData
        }
        fetchData={jest.fn()}
        editItem={jest.fn().mockResolvedValue(undefined)}
        deleteItem={jest.fn().mockResolvedValue(undefined)}
        registerLibrary={jest.fn().mockResolvedValue(undefined)}
        fetchLibraryRegistrations={jest.fn().mockResolvedValue(undefined)}
        csrfToken="token"
        isFetching={false}
      />,
      sysAdminConfig
    );

  // ── Toggle visibility ─────────────────────────────────────────────────────

  it("shows no toggle when libraryRegistrations data has not yet loaded", () => {
    const { container } = renderServices({
      discovery_services: [{ id: 1, protocol: "p", name: "Service A" } as any],
      // libraryRegistrations omitted → undefined
    });
    expect(container.querySelector(".library-toggle")).toBeNull();
    expect(container.querySelector(".library-count")).toBeNull();
  });

  it("shows a disabled toggle and 'no registered libraries' when none are registered", () => {
    const { container } = renderServices({
      discovery_services: [{ id: 1, protocol: "p", name: "Service A" } as any],
      libraryRegistrations: [
        {
          id: 1,
          libraries: [
            {
              short_name: "alpha",
              status: "warning",
            } as any,
            {
              short_name: "beta",
              status: "failure",
            } as any,
          ],
        },
      ],
    });
    const toggle = container.querySelector<HTMLButtonElement>(
      ".library-toggle"
    );
    expect(toggle).not.toBeNull();
    expect(toggle.disabled).toBe(true);
    expect(container.querySelector(".library-count").textContent).toBe(
      " (no registered libraries)"
    );
  });

  it("shows '1 registered library' when exactly one library is registered", () => {
    const { container } = renderServices({
      discovery_services: [{ id: 1, protocol: "p", name: "Service A" } as any],
      libraryRegistrations: [
        {
          id: 1,
          libraries: [
            {
              short_name: "alpha",
              status: "success",
              stage: "production",
            } as any,
          ],
        },
      ],
    });
    const toggle = container.querySelector<HTMLButtonElement>(
      ".library-toggle"
    );
    expect(toggle.disabled).toBe(false);
    expect(container.querySelector(".library-count").textContent).toBe(
      " (1 registered library)"
    );
  });

  it("shows 'N registered libraries' when multiple are registered", () => {
    const { container } = renderServices({
      discovery_services: [{ id: 1, protocol: "p", name: "Service A" } as any],
      libraryRegistrations: [
        {
          id: 1,
          libraries: [
            {
              short_name: "alpha",
              status: "success",
              stage: "production",
            } as any,
            { short_name: "beta", status: "success", stage: "testing" } as any,
            { short_name: "gamma", status: "warning" } as any,
          ],
        },
      ],
    });
    expect(container.querySelector(".library-count").textContent).toBe(
      " (2 registered libraries)"
    );
  });

  // ── Content filtering ─────────────────────────────────────────────────────

  it("shows only registered (status=success) libraries in the expanded list", () => {
    const { container } = renderServices({
      discovery_services: [{ id: 1, protocol: "p", name: "Service A" } as any],
      libraryRegistrations: [
        {
          id: 1,
          libraries: [
            {
              short_name: "alpha",
              status: "success",
              stage: "production",
            } as any,
            { short_name: "beta", status: "warning", stage: "testing" } as any,
            { short_name: "gamma", status: "failure" } as any,
          ],
        },
      ],
    });
    fireEvent.click(container.querySelector(".library-toggle"));

    const items = container.querySelectorAll(".associated-libraries li");
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain("Alpha Library");
  });

  // ── Stage suffix ──────────────────────────────────────────────────────────

  it("shows the registration stage in the suffix", () => {
    const { container } = renderServices({
      discovery_services: [{ id: 1, protocol: "p", name: "Service A" } as any],
      libraryRegistrations: [
        {
          id: 1,
          libraries: [
            {
              short_name: "alpha",
              status: "success",
              stage: "production",
            } as any,
          ],
        },
      ],
    });
    fireEvent.click(container.querySelector(".library-toggle"));

    const item = container.querySelector(".associated-libraries li");
    expect(item.textContent).toBe("Alpha Library - registered - production");
  });

  it("shows '- registered' without a stage when stage is absent", () => {
    const { container } = renderServices({
      discovery_services: [{ id: 1, protocol: "p", name: "Service A" } as any],
      libraryRegistrations: [
        {
          id: 1,
          libraries: [{ short_name: "alpha", status: "success" } as any],
        },
      ],
    });
    fireEvent.click(container.querySelector(".library-toggle"));

    const item = container.querySelector(".associated-libraries li");
    expect(item.textContent).toBe("Alpha Library - registered");
  });

  // ── Sorting ───────────────────────────────────────────────────────────────

  it("sorts registered libraries alphabetically by display name", () => {
    const { container } = renderServices({
      discovery_services: [{ id: 1, protocol: "p", name: "Service A" } as any],
      libraryRegistrations: [
        {
          id: 1,
          libraries: [
            {
              short_name: "gamma",
              status: "success",
              stage: "production",
            } as any,
            { short_name: "alpha", status: "success", stage: "testing" } as any,
            {
              short_name: "beta",
              status: "success",
              stage: "production",
            } as any,
          ],
        },
      ],
    });
    fireEvent.click(container.querySelector(".library-toggle"));

    const items = container.querySelectorAll(".associated-libraries li");
    expect(items[0].textContent).toContain("Alpha Library");
    expect(items[1].textContent).toContain("Beta Library");
    expect(items[2].textContent).toContain("Gamma Library");
  });

  // ── Links ─────────────────────────────────────────────────────────────────

  it("links the library name to its config page when a uuid is available", () => {
    const { container } = renderServices({
      discovery_services: [{ id: 1, protocol: "p", name: "Service A" } as any],
      libraryRegistrations: [
        {
          id: 1,
          libraries: [
            {
              short_name: "alpha",
              status: "success",
              stage: "production",
            } as any,
          ],
        },
      ],
    });
    fireEvent.click(container.querySelector(".library-toggle"));

    const link = container.querySelector<HTMLAnchorElement>(
      ".associated-libraries a"
    );
    expect(link).not.toBeNull();
    expect(link.textContent).toBe("Alpha Library");
    expect(link.href).toContain("/admin/web/config/libraries/edit/uuid-alpha");
    // The suffix should not be inside the link.
    expect(link.nextSibling.textContent).toBe(" - registered - production");
  });

  it("renders the library name as plain text when no uuid is available", () => {
    const { container } = renderServices({
      discovery_services: [{ id: 1, protocol: "p", name: "Service A" } as any],
      libraryRegistrations: [
        {
          id: 1,
          libraries: [
            { short_name: "delta", status: "success", stage: "testing" } as any,
          ],
        },
      ],
    });
    fireEvent.click(container.querySelector(".library-toggle"));

    expect(container.querySelector(".associated-libraries a")).toBeNull();
    expect(
      container.querySelector(".associated-libraries li").textContent
    ).toBe("Delta Library - registered - testing");
  });

  // ── Per-service isolation ─────────────────────────────────────────────────

  it("shows each service's own registered libraries independently", () => {
    const { container } = renderServices({
      discovery_services: [
        { id: 1, protocol: "p", name: "Service A" } as any,
        { id: 2, protocol: "p", name: "Service B" } as any,
      ],
      libraryRegistrations: [
        {
          id: 1,
          libraries: [
            {
              short_name: "alpha",
              status: "success",
              stage: "production",
            } as any,
          ],
        },
        {
          id: 2,
          libraries: [
            { short_name: "beta", status: "success", stage: "testing" } as any,
            {
              short_name: "gamma",
              status: "success",
              stage: "production",
            } as any,
          ],
        },
      ],
    });

    expect(container.querySelector(".library-count").textContent).toBe(
      " (1 registered library)"
    );

    const toggles = container.querySelectorAll<HTMLButtonElement>(
      ".library-toggle"
    );
    expect(toggles).toHaveLength(2);
    expect(
      toggles[1].closest("li").querySelector(".library-count").textContent
    ).toBe(" (2 registered libraries)");
  });

  // ── Alt+click toggle-all ──────────────────────────────────────────────────

  it("alt+click expands all services that have registered libraries", () => {
    const { container } = renderServices({
      discovery_services: [
        { id: 1, protocol: "p", name: "Service A" } as any,
        { id: 2, protocol: "p", name: "Service B" } as any,
        { id: 3, protocol: "p", name: "Service C" } as any,
      ],
      libraryRegistrations: [
        {
          id: 1,
          libraries: [
            {
              short_name: "alpha",
              status: "success",
              stage: "production",
            } as any,
          ],
        },
        {
          id: 2,
          libraries: [], // no registrations → disabled toggle
        },
        {
          id: 3,
          libraries: [
            { short_name: "beta", status: "success", stage: "testing" } as any,
          ],
        },
      ],
    });

    const toggles = container.querySelectorAll(".library-toggle");
    fireEvent.click(toggles[0], { altKey: true });

    // Services 1 and 3 have registered libraries; service 2 has none.
    expect(container.querySelectorAll(".associated-libraries")).toHaveLength(2);
  });
});
