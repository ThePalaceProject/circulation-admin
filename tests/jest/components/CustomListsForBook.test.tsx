import * as React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { CustomListsForBook } from "../../../src/components/lists/CustomListsForBook";

// react-router's Link needs a router context — mock it as a plain anchor
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: any;
    className?: string;
  }) => {
    const href =
      typeof to === "string"
        ? to
        : typeof to === "object" && to.pathname
        ? to.pathname
        : "";
    return (
      <a href={href} className={className} data-to={JSON.stringify(to)}>
        {children}
      </a>
    );
  },
}));

// ── fixtures ──────────────────────────────────────────────────────────────────

const bookData = { id: "id", title: "test title" };

const allCustomLists = [
  { id: "1", name: "list 1", is_owner: true, is_shared: false },
  { id: "2", name: "list 2", is_owner: true, is_shared: false },
  { id: "3", name: "list 3", is_owner: true, is_shared: false },
];

const customListsForBook = [
  { id: "2", name: "list 2", is_owner: true, is_shared: false },
];

function buildProps(
  overrides: Partial<React.ComponentProps<typeof CustomListsForBook>> = {}
): React.ComponentProps<typeof CustomListsForBook> {
  return {
    csrfToken: "token",
    book: bookData,
    bookUrl: "works/book url",
    library: "library",
    allCustomLists,
    customListsForBook,
    fetchAllCustomLists: jest.fn(),
    fetchCustomListsForBook: jest.fn(),
    editCustomListsForBook: jest.fn().mockResolvedValue(undefined),
    refreshCatalog: jest.fn(),
    ...overrides,
  };
}

function renderComponent(
  overrides: Partial<React.ComponentProps<typeof CustomListsForBook>> = {}
) {
  const props = buildProps(overrides);
  const utils = render(<CustomListsForBook {...props} />);
  return { ...utils, props };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe("CustomListsForBook", () => {
  describe("rendering", () => {
    it("shows error message when fetchError is provided", () => {
      const { container, rerender } = renderComponent();
      expect(container.querySelector(".error-message")).toBeFalsy();

      rerender(
        <CustomListsForBook
          {...buildProps({
            fetchError: { status: 500, response: "error", url: "" },
          })}
        />
      );
      expect(container.querySelector("[role=alert]")).toBeTruthy();
    });

    it("shows book title", () => {
      const { container } = renderComponent();
      const h2 = container.querySelector("h2");
      expect(h2!.textContent).toBe("test title");
    });

    it("shows current lists with links", () => {
      const { container } = renderComponent();
      const h4 = container.querySelector("h4");
      expect(h4).toBeTruthy();
      expect(h4!.textContent).toBe("Current Lists");

      // "list 2" should appear as a removable item with a link
      const links = container.querySelectorAll<HTMLAnchorElement>("a");
      const listLink = Array.from(links).find((a) =>
        a.textContent?.includes("list 2")
      );
      expect(listLink).toBeTruthy();
      expect(listLink!.getAttribute("href")).toBe(
        "/admin/web/lists/library/edit/2"
      );
    });

    it("shows placeholder text if there are no current lists", () => {
      const { container, rerender } = renderComponent();
      // When there are current lists, no placeholder
      expect(container.querySelector(".input-list > span")).toBeFalsy();

      rerender(
        <CustomListsForBook {...buildProps({ customListsForBook: [] })} />
      );
      // With no current lists, the altValue placeholder appears
      expect(container.textContent).toContain(
        "This book is not currently on any lists."
      );
    });

    it("creates a URL based on list name", () => {
      const { container } = renderComponent();
      const links = container.querySelectorAll<HTMLAnchorElement>("a");
      const list2Link = Array.from(links).find((a) =>
        a.textContent?.includes("list 2")
      );
      expect(list2Link!.getAttribute("href")).toBe(
        "/admin/web/lists/library/edit/2"
      );
    });

    it("shows a menu of available lists (not already on)", () => {
      const { container } = renderComponent();
      const select = container.querySelector<HTMLSelectElement>("select");
      expect(select).toBeTruthy();

      // allCustomLists has 3; list 2 is already on the book
      const options = Array.from(select!.querySelectorAll("option"));
      const values = options.map((o) => o.getAttribute("value"));
      // list 1 and list 3 should appear (not list 2)
      expect(values).toContain("list 1");
      expect(values).toContain("list 3");
      expect(values).not.toContain("list 2");

      const label = select!.closest("label");
      expect(label!.textContent).toContain("Select an existing list");

      const addButton = container.querySelector<HTMLButtonElement>(
        ".add-list-item-container button, button.add-list-item"
      );
      expect(addButton).toBeTruthy();
    });

    it("does not show the menu if the book is already on all the lists", () => {
      const { container } = renderComponent({
        customListsForBook: allCustomLists,
      });
      expect(container.querySelector("select")).toBeFalsy();
      expect(container.textContent).toContain(
        "This book has been added to all the available lists."
      );
    });

    it("does not show the InputList if no lists exist", () => {
      const { container } = renderComponent({ allCustomLists: [] });
      // select and list should be absent
      expect(container.querySelector("select")).toBeFalsy();
      expect(container.textContent).toContain("There are no available lists.");
    });

    it("disables while fetching", () => {
      const { container } = renderComponent({ isFetching: true });
      // All interactive elements (inputs, buttons, selects) should be disabled
      const disabledEls = container.querySelectorAll<HTMLElement>(
        "[disabled], [aria-disabled='true']"
      );
      expect(disabledEls.length).toBeGreaterThan(0);
    });

    it("displays a link to the list creator", () => {
      const { container } = renderComponent();
      const links = container.querySelectorAll<HTMLAnchorElement>("a");
      const createLink = Array.from(links).find((a) =>
        a.textContent?.includes("Create a new list")
      );
      expect(createLink).toBeTruthy();
      expect(createLink!.getAttribute("href")).toBe(
        "/admin/web/lists/library/create"
      );
      expect(container.textContent).toContain(
        "The book title will be automatically copied"
      );
    });
  });

  describe("behavior", () => {
    it("fetches lists on mount", () => {
      const fetchCustomListsForBook = jest.fn();
      const fetchAllCustomLists = jest.fn();
      renderComponent({ fetchCustomListsForBook, fetchAllCustomLists });

      expect(fetchCustomListsForBook).toHaveBeenCalledWith(
        "admin/works/book url/lists"
      );
      // allCustomLists is provided, so fetchAllCustomLists is NOT called
      expect(fetchAllCustomLists).not.toHaveBeenCalled();
    });

    it("fetches all custom lists on mount if they have not been fetched", () => {
      const fetchAllCustomLists = jest.fn();
      const fetchCustomListsForBook = jest.fn();
      renderComponent({
        allCustomLists: undefined,
        fetchAllCustomLists,
        fetchCustomListsForBook,
      });
      expect(fetchAllCustomLists).toHaveBeenCalledTimes(1);
    });

    it("adds a list when select and add button are used", async () => {
      const editCustomListsForBook = jest.fn().mockResolvedValue(undefined);
      const { container } = renderComponent({ editCustomListsForBook });

      const select = container.querySelector<HTMLSelectElement>("select");
      fireEvent.change(select!, { target: { value: "list 1" } });

      const addButton = container.querySelector<HTMLButtonElement>(
        "button.add-list-item"
      );
      fireEvent.click(addButton!);

      await waitFor(() =>
        expect(editCustomListsForBook).toHaveBeenCalledTimes(1)
      );

      const [url, formData] = editCustomListsForBook.mock.calls[0];
      expect(url).toBe("admin/works/book url/lists");
      const lists = JSON.parse((formData as FormData).get("lists") as string);
      // Should have list 2 (existing) + list 1 (newly added)
      expect(lists.map((l: any) => l.name)).toContain("list 2");
      expect(lists.map((l: any) => l.name)).toContain("list 1");
    });

    it("removes a list when the remove button is clicked", async () => {
      const editCustomListsForBook = jest.fn().mockResolvedValue(undefined);
      const { container } = renderComponent({ editCustomListsForBook });

      // Find the remove button for "list 2"
      const removeButton = container.querySelector<HTMLButtonElement>(
        ".remove-btn"
      );
      expect(removeButton).toBeTruthy();
      fireEvent.click(removeButton!);

      await waitFor(() =>
        expect(editCustomListsForBook).toHaveBeenCalledTimes(1)
      );

      const [url, formData] = editCustomListsForBook.mock.calls[0];
      expect(url).toBe("admin/works/book url/lists");
      const lists = JSON.parse((formData as FormData).get("lists") as string);
      expect(lists).toEqual([]);
    });
  });
});
