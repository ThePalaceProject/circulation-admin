import * as React from "react";
import { fireEvent } from "@testing-library/react";
import { IndividualAdmins } from "../../../src/components/IndividualAdmins";
import renderWithContext from "../testUtils/renderWithContext";
import {
  ConfigurationSettings,
  IndividualAdminsData,
} from "../../../src/interfaces";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";

// NB: This adds tests to the already existing tests in:
// - `src/components/__tests__/IndividualAdmins-test.tsx`.
//
// Those tests should eventually be migrated here and
// adapted to the Jest/React Testing Library paradigm.

describe("IndividualAdmins - role association disclosure", () => {
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

  const renderAdmins = (
    admins: IndividualAdminsData["individualAdmins"],
    config = sysAdminConfig
  ) =>
    renderWithContext(
      <IndividualAdmins
        data={{ individualAdmins: admins, allLibraries }}
        fetchData={jest.fn()}
        editItem={jest.fn().mockResolvedValue(undefined)}
        deleteItem={jest.fn().mockResolvedValue(undefined)}
        csrfToken="token"
        isFetching={false}
      />,
      config
    );

  // ── Toggle visibility ─────────────────────────────────────────────────────

  it("shows no toggle for an admin with no roles field", () => {
    const { container } = renderAdmins([{ email: "noroles@example.com" }]);
    expect(container.querySelector(".association-toggle")).toBeNull();
    expect(container.querySelector(".library-count")).toBeNull();
  });

  it("shows 'no roles' and a disabled toggle for an admin with an empty roles array", () => {
    const { container } = renderAdmins([
      { email: "empty@example.com", roles: [] },
    ]);
    const toggle = container.querySelector<HTMLButtonElement>(
      ".association-toggle"
    );
    expect(toggle).not.toBeNull();
    expect(toggle.disabled).toBe(true);
    expect(container.querySelector(".library-count").textContent).toBe(
      " (no roles)"
    );
  });

  it("shows '1 role' for a system admin", () => {
    const { container } = renderAdmins([
      { email: "sys@example.com", roles: [{ role: "system" }] },
    ]);
    expect(container.querySelector(".library-count").textContent).toBe(
      " (1 role)"
    );
  });

  it("shows 'N roles' for an admin with multiple role entries", () => {
    const { container } = renderAdmins([
      {
        email: "mgr@example.com",
        roles: [
          { role: "manager", library: "alpha" },
          { role: "manager", library: "beta" },
          { role: "librarian", library: "gamma" },
        ],
      },
    ]);
    expect(container.querySelector(".library-count").textContent).toBe(
      " (3 roles)"
    );
  });

  it("counts deduplicated display entries, not raw roles, when a library has both manager and librarian roles", () => {
    // Two raw roles for the same library collapse to one display entry (highest wins).
    // The count shown to the user should reflect what is displayed, not item.roles.length.
    const { container } = renderAdmins([
      {
        email: "mgr@example.com",
        roles: [
          { role: "librarian", library: "alpha" },
          { role: "manager", library: "alpha" },
        ],
      },
    ]);
    expect(container.querySelector(".library-count").textContent).toBe(
      " (1 role)"
    );
  });

  // ── System admin ──────────────────────────────────────────────────────────

  it("shows only 'sysadmin' in the expanded list for a system-role admin", () => {
    const { container } = renderAdmins([
      { email: "sys@example.com", roles: [{ role: "system" }] },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toBe("sysadmin");
  });

  it("shows only 'sysadmin' even when other roles are also present", () => {
    const { container } = renderAdmins([
      {
        email: "sys@example.com",
        roles: [{ role: "system" }, { role: "manager", library: "alpha" }],
      },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toBe("sysadmin");
  });

  // ── Library-specific roles ────────────────────────────────────────────────

  it("shows '<library> - Manager' for a library manager role", () => {
    const { container } = renderAdmins([
      {
        email: "mgr@example.com",
        roles: [{ role: "manager", library: "alpha" }],
      },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toBe("Alpha Library - Manager");
  });

  it("shows '<library> - Librarian' for a librarian role", () => {
    const { container } = renderAdmins([
      {
        email: "lib@example.com",
        roles: [{ role: "librarian", library: "beta" }],
      },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toBe("Beta Library - Librarian");
  });

  it("shows the highest role (Manager) when a library has both manager and librarian roles", () => {
    const { container } = renderAdmins([
      {
        email: "mgr@example.com",
        roles: [
          { role: "librarian", library: "alpha" },
          { role: "manager", library: "alpha" },
        ],
      },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toBe("Alpha Library - Manager");
  });

  // ── Sitewide roles ────────────────────────────────────────────────────────

  it("shows 'All libraries - Manager' for a manager-all role", () => {
    const { container } = renderAdmins([
      { email: "mgr@example.com", roles: [{ role: "manager-all" }] },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    expect(items[0].textContent).toBe("All libraries - Manager");
  });

  it("shows 'All libraries - Librarian' for a librarian-all role", () => {
    const { container } = renderAdmins([
      { email: "lib@example.com", roles: [{ role: "librarian-all" }] },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    expect(items[0].textContent).toBe("All libraries - Librarian");
  });

  it("shows Manager (not Librarian) when both manager-all and librarian-all are present", () => {
    const { container } = renderAdmins([
      {
        email: "mgr@example.com",
        roles: [{ role: "librarian-all" }, { role: "manager-all" }],
      },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    // Only the manager-all entry; librarian-all is superseded.
    expect(Array.from(items).map((li) => li.textContent)).toEqual([
      "All libraries - Manager",
    ]);
  });

  // ── Combined sitewide + library-specific roles ────────────────────────────

  it("shows both 'All libraries' and per-library entries when manager-all and library roles coexist", () => {
    const { container } = renderAdmins([
      {
        email: "mgr@example.com",
        roles: [
          { role: "manager-all" },
          { role: "manager", library: "alpha" },
          { role: "librarian", library: "beta" },
        ],
      },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    const texts = Array.from(items).map((li) => li.textContent);
    expect(texts).toContain("All libraries - Manager");
    expect(texts).toContain("Alpha Library - Manager");
    expect(texts).toContain("Beta Library - Librarian");
  });

  it("shows both 'All libraries' and per-library entries when librarian-all and library roles coexist", () => {
    const { container } = renderAdmins([
      {
        email: "lib@example.com",
        roles: [
          { role: "librarian-all" },
          { role: "librarian", library: "gamma" },
        ],
      },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    const texts = Array.from(items).map((li) => li.textContent);
    expect(texts).toContain("All libraries - Librarian");
    expect(texts).toContain("Gamma Library - Librarian");
  });

  // ── Sorting ───────────────────────────────────────────────────────────────

  it("sorts library role entries alphabetically by library display name", () => {
    const { container } = renderAdmins([
      {
        email: "mgr@example.com",
        roles: [
          { role: "manager", library: "gamma" },
          { role: "manager", library: "alpha" },
          { role: "librarian", library: "beta" },
        ],
      },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const items = container.querySelectorAll(".associated-items li");
    expect(items[0].textContent).toBe("Alpha Library - Manager");
    expect(items[1].textContent).toBe("Beta Library - Librarian");
    expect(items[2].textContent).toBe("Gamma Library - Manager");
  });

  // ── Links ─────────────────────────────────────────────────────────────────

  it("links the library name to its config page when a uuid is available", () => {
    const { container } = renderAdmins([
      {
        email: "mgr@example.com",
        roles: [{ role: "manager", library: "alpha" }],
      },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    const link = container.querySelector<HTMLAnchorElement>(
      ".associated-items a"
    );
    expect(link).not.toBeNull();
    expect(link.textContent).toBe("Alpha Library");
    expect(link.href).toContain("/admin/web/config/libraries/edit/uuid-alpha");
    // The role suffix should not be part of the link.
    expect(link.nextSibling.textContent).toBe(" - Manager");
  });

  it("renders the library name as plain text when no uuid is available", () => {
    const { container } = renderAdmins([
      {
        email: "lib@example.com",
        roles: [{ role: "librarian", library: "delta" }],
      },
    ]);
    fireEvent.click(container.querySelector(".association-toggle"));

    expect(container.querySelector(".associated-items a")).toBeNull();
    expect(container.querySelector(".associated-items li").textContent).toBe(
      "Delta Library - Librarian"
    );
  });

  // ── Expand all / Collapse all buttons ────────────────────────────────────

  it("Expand all expands all admins that have roles", () => {
    const { container } = renderAdmins([
      { email: "sys@example.com", roles: [{ role: "system" }] },
      {
        email: "mgr@example.com",
        roles: [{ role: "manager", library: "alpha" }],
      },
      { email: "none@example.com" }, // no roles field → no toggle
    ]);

    fireEvent.click(container.querySelector(".expand-all"));

    expect(container.querySelectorAll(".associated-items")).toHaveLength(2);
  });

  it("Collapse all collapses all expanded admins", () => {
    const { container } = renderAdmins([
      { email: "sys@example.com", roles: [{ role: "system" }] },
      {
        email: "mgr@example.com",
        roles: [{ role: "manager", library: "alpha" }],
      },
    ]);

    fireEvent.click(container.querySelector(".expand-all"));
    expect(container.querySelectorAll(".associated-items")).toHaveLength(2);

    fireEvent.click(container.querySelector(".collapse-all"));
    expect(container.querySelectorAll(".associated-items")).toHaveLength(0);
  });

  // ── Alt+click toggle-all ──────────────────────────────────────────────────

  it("alt+click expands all admins that have roles", () => {
    const { container } = renderAdmins([
      { email: "sys@example.com", roles: [{ role: "system" }] },
      {
        email: "mgr@example.com",
        roles: [{ role: "manager", library: "alpha" }],
      },
      { email: "none@example.com" }, // no roles field → no toggle
    ]);
    const toggles = container.querySelectorAll(".association-toggle");
    expect(toggles).toHaveLength(2);

    fireEvent.click(toggles[0], { altKey: true });

    expect(container.querySelectorAll(".associated-items")).toHaveLength(2);
  });

  it("alt+click collapses all when all are already expanded", () => {
    const { container } = renderAdmins([
      { email: "sys@example.com", roles: [{ role: "system" }] },
      {
        email: "mgr@example.com",
        roles: [{ role: "manager", library: "alpha" }],
      },
    ]);
    const toggles = container.querySelectorAll(".association-toggle");

    fireEvent.click(toggles[0], { altKey: true });
    expect(container.querySelectorAll(".associated-items")).toHaveLength(2);

    fireEvent.click(toggles[0], { altKey: true });
    expect(container.querySelectorAll(".associated-items")).toHaveLength(0);
  });
});
