import * as React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Header } from "../../../src/components/layout/Header";
import Admin from "../../../src/models/Admin";
import { AdminRole } from "../../../src/interfaces";

const router = {
  push: jest.fn(),
  createHref: jest.fn(),
  isActive: jest.fn(),
  replace: jest.fn(),
  go: jest.fn(),
  goBack: jest.fn(),
  goForward: jest.fn(),
  setRouteLeaveHook: jest.fn(),
  getCurrentLocation: jest.fn().mockReturnValue(null),
};

const libraryManager = new Admin([
  { role: "manager" as AdminRole, library: "nypl" },
]);
const librarian = new Admin([
  { role: "librarian" as AdminRole, library: "nypl" },
]);
const systemAdmin = new Admin([{ role: "system" as AdminRole }]);

function renderHeader(
  admin: Admin,
  library?: () => string,
  props: Record<string, unknown> = {}
) {
  return render(
    <MemoryRouter>
      <Header
        {...props}
        admin={admin}
        library={library}
        router={router as any}
      />
    </MemoryRouter>
  );
}

describe("Header", () => {
  describe("rendering", () => {
    it("renders the brand logo", () => {
      renderHeader(libraryManager, () => "nypl");
      expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("shows library dropdown when libraries are available", () => {
      const libraries = [
        { short_name: "nypl", name: "NYPL" },
        { short_name: "bpl" },
      ];
      const { container } = renderHeader(libraryManager, () => "nypl", {
        libraries,
      });
      const btn = container.querySelector(".library-dropdown-toggle");
      expect(btn).not.toBeNull();
      // Button label reflects the currently selected library name
      expect(btn.textContent).toContain("NYPL");
    });

    it("shows 'Select a library' option when no library is selected", () => {
      const libraries = [
        { short_name: "nypl", name: "NYPL" },
        { short_name: "bpl" },
      ];
      // No library context function
      const { container } = renderHeader(libraryManager, undefined, {
        libraries,
      });
      const btn = container.querySelector(".library-dropdown-toggle");
      expect(btn).not.toBeNull();
      expect(btn.textContent).toContain("Select a library");
    });

    it("does not show library dropdown when no libraries are available", () => {
      const { container } = renderHeader(libraryManager, () => "nypl");
      const btn = container.querySelector(".library-dropdown-toggle");
      expect(btn).toBeNull();
    });

    it("shows Dashboard, Lists, Lanes, and System Configuration links for library manager", () => {
      const { container } = renderHeader(libraryManager, () => "nypl");
      // Dashboard is always in the top nav
      const topLinks = Array.from(
        container.querySelectorAll("a, button")
      ).map((el) => el.textContent.trim());
      expect(topLinks.some((t) => t.includes("Dashboard"))).toBe(true);

      // Open catalog dropdown to see Lists/Lanes
      const catalogToggle = container.querySelector(".catalog-dropdown-toggle");
      fireEvent.click(catalogToggle);
      const catalogLinks = Array.from(
        container.querySelectorAll("a, button")
      ).map((el) => el.textContent.trim());
      expect(catalogLinks.some((t) => t.includes("Lists"))).toBe(true);
      expect(catalogLinks.some((t) => t.includes("Lanes"))).toBe(true);

      // Close catalog dropdown first, then open settings dropdown
      fireEvent.click(catalogToggle);
      const settingsToggle = container.querySelector(
        ".settings-dropdown-toggle"
      );
      fireEvent.click(settingsToggle);
      const settingsLinks = Array.from(
        container.querySelectorAll("a, button")
      ).map((el) => el.textContent.trim());
      expect(
        settingsLinks.some((t) => t.includes("System Configuration"))
      ).toBe(true);
    });

    it("shows Patrons and Troubleshooting links for system admin", () => {
      const { container } = renderHeader(systemAdmin, () => "nypl");
      // Open settings dropdown so its links are present in the DOM
      const settingsToggle = container.querySelector(
        ".settings-dropdown-toggle"
      );
      fireEvent.click(settingsToggle);
      const linkTexts = Array.from(
        container.querySelectorAll("a, button")
      ).map((el) => el.textContent.trim());
      expect(linkTexts.some((t) => t.includes("Patrons"))).toBe(true);
      expect(linkTexts.some((t) => t.includes("Troubleshooting"))).toBe(true);
    });

    it("does not show Patrons or Troubleshooting links for library manager", () => {
      const { container } = renderHeader(libraryManager, () => "nypl");
      const linkTexts = Array.from(
        container.querySelectorAll("a, button")
      ).map((el) => el.textContent.trim());
      expect(linkTexts.some((t) => t === "Patrons")).toBe(false);
      expect(linkTexts.some((t) => t === "Troubleshooting")).toBe(false);
    });

    it("does not show Patrons or Troubleshooting links for librarian", () => {
      const { container } = renderHeader(librarian, () => "nypl");
      const linkTexts = Array.from(
        container.querySelectorAll("a, button")
      ).map((el) => el.textContent.trim());
      expect(linkTexts.some((t) => t === "Patrons")).toBe(false);
      expect(linkTexts.some((t) => t === "Troubleshooting")).toBe(false);
    });

    it("does not show Lanes link for librarian", () => {
      const { container } = renderHeader(librarian, () => "nypl");
      const linkTexts = Array.from(
        container.querySelectorAll("a, button")
      ).map((el) => el.textContent.trim());
      expect(linkTexts.some((t) => t === "Lanes")).toBe(false);
    });

    it("shows account dropdown button when admin has an email", () => {
      const adminWithEmail = new Admin(
        [{ role: "librarian" as AdminRole, library: "nypl" }],
        "admin@nypl.org"
      );
      renderHeader(adminWithEmail, () => "nypl");
      const toggle = screen.getByText(/admin@nypl\.org/);
      expect(toggle).toBeInTheDocument();
    });

    it("does not show account dropdown button when admin has no email", () => {
      const { container } = renderHeader(libraryManager, () => "nypl");
      const toggle = container.querySelector(".account-dropdown-toggle");
      expect(toggle).toBeNull();
    });
  });

  describe("behavior", () => {
    it("fetches libraries on mount when fetchLibraries is provided", () => {
      const fetchLibraries = jest.fn().mockResolvedValue([]);
      renderHeader(libraryManager, () => "nypl", { fetchLibraries });
      expect(fetchLibraries).toHaveBeenCalledTimes(1);
    });

    it("does not fetch libraries when isFetchingLibraries is true", () => {
      const fetchLibraries = jest.fn().mockResolvedValue([]);
      renderHeader(libraryManager, () => "nypl", {
        fetchLibraries,
        isFetchingLibraries: true,
      });
      expect(fetchLibraries).not.toHaveBeenCalled();
    });

    it("toggles account dropdown when toggle button is clicked", () => {
      const adminWithEmail = new Admin(
        [{ role: "librarian" as AdminRole, library: "nypl" }],
        "admin@nypl.org"
      );
      const { container } = renderHeader(adminWithEmail, () => "nypl");
      const toggle = container.querySelector(".account-dropdown-toggle");

      // Dropdown initially hidden
      expect(container.querySelector(".site-nav__dropdown-menu")).toBeNull();

      fireEvent.click(toggle);
      expect(
        container.querySelector(".site-nav__dropdown-menu")
      ).not.toBeNull();

      // Should show sign out link
      const signOutLink = container.querySelector(
        '.site-nav__dropdown-menu a[href="/admin/sign_out"]'
      );
      expect(signOutLink).not.toBeNull();
    });
  });

  it("displays the user's level of permissions via displayPermissions", () => {
    const adminWithEmail = new Admin(
      [{ role: "librarian" as AdminRole, library: "nypl" }],
      "admin@nypl.org"
    );
    const { container } = renderHeader(adminWithEmail, () => "nypl");
    const toggle = container.querySelector(".account-dropdown-toggle");
    fireEvent.click(toggle);
    // After clicking, dropdown shows permission text
    expect(container.querySelector(".site-nav__dropdown-menu")).not.toBeNull();
    expect(container.querySelector(".permissions")).not.toBeNull();
    expect(container.querySelector(".permissions").textContent).toContain(
      "Logged in as a user"
    );
  });
});
