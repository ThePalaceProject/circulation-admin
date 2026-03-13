import * as React from "react";
import PropTypes from "prop-types";
import { render, fireEvent, waitFor } from "@testing-library/react";
import Admin from "../../../src/models/Admin";
import {
  Collections,
  CollectionEditForm,
} from "../../../src/components/config/Collections";
import buildStore from "../../../src/store";

// ── context helpers ──────────────────────────────────────────────────────────

const systemAdmin = new Admin([{ role: "system", library: "nypl" }]);

class AdminContextProvider extends React.Component<{
  children: React.ReactNode;
  admin?: Admin;
}> {
  static childContextTypes = {
    admin: PropTypes.object.isRequired,
  };
  getChildContext() {
    return { admin: this.props.admin || systemAdmin };
  }
  render() {
    return <>{this.props.children}</>;
  }
}

// ── fixtures ─────────────────────────────────────────────────────────────────

const collections = [
  {
    id: "2",
    protocol: "test protocol",
    marked_for_deletion: false,
    name: "ODL",
  },
  {
    id: "3",
    protocol: "test protocol",
    marked_for_deletion: true,
    name: "Enki",
  },
  {
    id: "4",
    protocol: "test protocol",
    marked_for_deletion: false,
    name: "RBDigital",
  },
];

const initialLibraries = [
  { short_name: "palace", name: "Palace" },
  { short_name: "another-library", name: "Another Library" },
] as const;

const collection = {
  id: 7,
  name: "An OPDS Collection",
  protocol: "OPDS Import",
  libraries: [...initialLibraries],
};

// ── Collections (list/create mode) ───────────────────────────────────────────

describe("Collections — list/create mode", () => {
  let registerLibrary: jest.Mock;
  let fetchLibraryRegistrations: jest.Mock;

  function renderCollections() {
    const store = buildStore();
    return render(
      <AdminContextProvider>
        <Collections
          csrfToken="token"
          store={store}
          data={{ collections, protocols: [] }}
          registerLibrary={registerLibrary}
          fetchLibraryRegistrations={fetchLibraryRegistrations}
          importCollection={jest.fn().mockResolvedValue(undefined)}
        />
      </AdminContextProvider>
    );
  }

  beforeEach(() => {
    registerLibrary = jest.fn().mockResolvedValue(undefined);
    fetchLibraryRegistrations = jest.fn();
  });

  it("renders a list of collections", () => {
    const { container } = renderCollections();
    const items = container.querySelectorAll("ul li");
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it("marks the second collection as deleted with the correct class", () => {
    const { container } = renderCollections();
    const deleted = container.querySelectorAll(".deleted-collection");
    expect(deleted.length).toBe(1);
  });

  it("shows description text for deleted collection", () => {
    const { container } = renderCollections();
    const deleted = container.querySelector(".deleted-collection")!;
    expect(deleted.textContent).toContain(
      "This collection cannot be edited and is currently being deleted."
    );
  });

  it("does not show edit/delete buttons for deleted collection", () => {
    const { container } = renderCollections();
    const deleted = container.querySelector(".deleted-collection")!;
    expect(deleted.querySelector("a.edit-item")).toBeFalsy();
    expect(deleted.querySelector("button.delete-item")).toBeFalsy();
  });

  it("shows edit and delete buttons for non-deleted collections", () => {
    const { container } = renderCollections();
    const allItems = Array.from(container.querySelectorAll("ul li"));
    const nonDeleted = allItems.filter(
      (li) => !li.classList.contains("deleted-collection")
    );
    expect(nonDeleted.length).toBeGreaterThan(0);
    // At least one non-deleted collection has an edit link
    const hasEditLink = nonDeleted.some((li) =>
      li.querySelector("a.edit-item")
    );
    expect(hasEditLink).toBe(true);
  });
});

// ── Collections (edit mode) ───────────────────────────────────────────────────

describe("Collections — edit mode", () => {
  let registerLibrary: jest.Mock;
  let fetchLibraryRegistrations: jest.Mock;

  function renderEditMode() {
    return render(
      <AdminContextProvider>
        <Collections
          csrfToken="token"
          editOrCreate="edit"
          data={{ collections, protocols: [] }}
          identifier="2"
          registerLibrary={registerLibrary}
          fetchLibraryRegistrations={fetchLibraryRegistrations}
          importCollection={jest.fn().mockResolvedValue(undefined)}
        />
      </AdminContextProvider>
    );
  }

  beforeEach(() => {
    registerLibrary = jest.fn().mockResolvedValue(undefined);
    fetchLibraryRegistrations = jest.fn();
  });

  it("fetches library registrations on mount", () => {
    renderEditMode();
    expect(fetchLibraryRegistrations).toHaveBeenCalledTimes(1);
  });
});

// ── CollectionEditForm — library removal confirmation ─────────────────────────

describe("CollectionEditForm — confirm before disassociating libraries", () => {
  let confirmSpy: jest.SpyInstance;

  function renderEditForm() {
    return render(
      <CollectionEditForm
        disabled={false}
        data={{
          collections: [collection],
          protocols: [],
          allLibraries: [...initialLibraries],
        }}
        item={collection}
        urlBase="/collections"
        listDataKey="collections"
      />
    );
  }

  beforeEach(() => {
    confirmSpy = jest.spyOn(window, "confirm");
  });

  afterEach(() => {
    confirmSpy.mockRestore();
  });

  it("prompts for confirmation before removing a library", () => {
    confirmSpy.mockReturnValue(false);
    const { container } = renderEditForm();

    const removeButtons = container.querySelectorAll("button.remove-btn");
    expect(removeButtons.length).toBeGreaterThan(0);

    fireEvent.click(removeButtons[0]);
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    const message = confirmSpy.mock.calls[0][0] as string;
    expect(message).toBe(
      'Disassociating library "Palace" from this collection will ' +
        "remove all loans and holds for its patrons. Do you wish to continue?"
    );
  });

  it("removes library when confirmation is accepted", () => {
    confirmSpy.mockReturnValue(true);
    const { container } = renderEditForm();

    const removeButtons = container.querySelectorAll("button.remove-btn");
    fireEvent.click(removeButtons[0]);

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    // After removal, only one library should remain
    const remainingButtons = container.querySelectorAll("button.remove-btn");
    expect(remainingButtons.length).toBe(1);
  });

  it("does not remove library when confirmation is canceled", () => {
    confirmSpy.mockReturnValue(false);
    const { container } = renderEditForm();

    const removeButtons = container.querySelectorAll("button.remove-btn");
    const initialCount = removeButtons.length;
    fireEvent.click(removeButtons[0]);

    const afterCount = container.querySelectorAll("button.remove-btn").length;
    expect(afterCount).toBe(initialCount);
  });

  it("uses library short_name in confirmation when full name is not available", () => {
    // Render with a library that has no matching entry in allLibraries
    const noNameCollection = {
      ...collection,
      libraries: [{ short_name: "unknown-lib", name: "Unknown" }],
    };
    confirmSpy.mockReturnValue(false);

    render(
      <CollectionEditForm
        disabled={false}
        data={{
          collections: [noNameCollection],
          protocols: [],
          allLibraries: [], // no matching library in full list → falls back to short_name
        }}
        item={noNameCollection}
        urlBase="/collections"
        listDataKey="collections"
      />
    );

    const removeBtn = document.querySelector("button.remove-btn")!;
    fireEvent.click(removeBtn);

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    const message = confirmSpy.mock.calls[0][0] as string;
    expect(message).toContain("unknown-lib");
  });
});
