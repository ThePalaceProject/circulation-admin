import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import CustomListsSidebar from "../../../src/components/lists/CustomListsSidebar";

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
      <a href={href} className={className}>
        {children}
      </a>
    );
  },
}));

// ── fixtures ──────────────────────────────────────────────────────────────────

const lists = [
  {
    id: 1,
    name: "First List",
    entry_count: 5,
    is_owner: true,
    is_shared: false,
  },
  {
    id: 2,
    name: "Second List",
    entry_count: 10,
    is_owner: true,
    is_shared: false,
  },
];

function buildProps(
  overrides: Partial<React.ComponentProps<typeof CustomListsSidebar>> = {}
): React.ComponentProps<typeof CustomListsSidebar> {
  return {
    filter: "owned",
    lists,
    library: "library_name",
    identifier: "123",
    isLibraryManager: true,
    deleteCustomList: jest.fn(),
    changeSort: jest.fn(),
    sortOrder: "asc",
    ...overrides,
  };
}

function renderSidebar(
  overrides: Partial<React.ComponentProps<typeof CustomListsSidebar>> = {}
) {
  const props = buildProps(overrides);
  const utils = render(<CustomListsSidebar {...props} />);
  return { ...utils, props };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe("CustomListsSidebar", () => {
  it("renders a sidebar with a header and a create button", () => {
    const { container } = renderSidebar();
    expect(container.querySelector(".custom-lists-sidebar")).toBeTruthy();
    expect(container.querySelector("h2")!.textContent).toBe("List Manager");

    const createLink = container.querySelector<HTMLAnchorElement>(
      "a[href='/admin/web/lists/library_name/create']"
    );
    expect(createLink).toBeTruthy();
    expect(createLink!.textContent).toBe("Create New List");
  });

  it("renders filter select", () => {
    const { container } = renderSidebar();
    const select = container.querySelector<HTMLSelectElement>(
      'select[name="filter"]'
    );
    expect(select).toBeTruthy();
    expect(select!.value).toBe("owned");

    const options = select!.querySelectorAll("option");
    expect(options.length).toBe(4);
    expect(options[0].getAttribute("value")).toBe("");
    expect(options[1].getAttribute("value")).toBe("owned");
    expect(options[2].getAttribute("value")).toBe("shared-out");
    expect(options[3].getAttribute("value")).toBe("shared-in");
  });

  it("renders sort select", () => {
    const { container } = renderSidebar();
    const select = container.querySelector<HTMLSelectElement>(
      'select[name="sort"]'
    );
    expect(select).toBeTruthy();
    expect(select!.value).toBe("asc");

    const options = select!.querySelectorAll("option");
    expect(options.length).toBe(2);
    expect(options[0].getAttribute("value")).toBe("asc");
    expect(options[1].getAttribute("value")).toBe("desc");
  });

  it("renders a list of custom list info items", () => {
    const deleteCustomList = jest.fn();
    const { container } = renderSidebar({ deleteCustomList });
    const listItems = container.querySelectorAll("ul li");
    expect(listItems.length).toBe(2);

    // First list
    const firstInfoDivs = listItems[0].querySelectorAll(
      ".custom-list-info > div"
    );
    expect(firstInfoDivs[0].textContent).toBe("First List");
    expect(firstInfoDivs[1].textContent).toBe("Books in list: 5");
    expect(firstInfoDivs[2].textContent).toBe("ID-1");

    const firstButtons = listItems[0].querySelector(".custom-list-buttons")!;
    const firstEditLink = firstButtons.querySelector<HTMLAnchorElement>("a");
    expect(firstEditLink!.textContent).toContain("Edit");
    expect(firstEditLink!.getAttribute("href")).toBe(
      "/admin/web/lists/library_name/edit/1"
    );
    const firstDeleteBtn = firstButtons.querySelector<HTMLButtonElement>(
      "button"
    );
    expect(firstDeleteBtn!.textContent).toContain("Delete");
    fireEvent.click(firstDeleteBtn!);
    expect(deleteCustomList).toHaveBeenCalledTimes(1);

    // Second list
    const secondInfoDivs = listItems[1].querySelectorAll(
      ".custom-list-info > div"
    );
    expect(secondInfoDivs[0].textContent).toBe("Second List");
    expect(secondInfoDivs[1].textContent).toBe("Books in list: 10");
    expect(secondInfoDivs[2].textContent).toBe("ID-2");

    const secondButtons = listItems[1].querySelector(".custom-list-buttons")!;
    const secondEditLink = secondButtons.querySelector<HTMLAnchorElement>("a");
    expect(secondEditLink!.textContent).toContain("Edit");
    expect(secondEditLink!.getAttribute("href")).toBe(
      "/admin/web/lists/library_name/edit/2"
    );
    const secondDeleteBtn = secondButtons.querySelector<HTMLButtonElement>(
      "button"
    );
    expect(secondDeleteBtn!.textContent).toContain("Delete");
    fireEvent.click(secondDeleteBtn!);
    expect(deleteCustomList).toHaveBeenCalledTimes(2);
  });

  it("disables the edit button if the list is already being edited", () => {
    const { container, rerender } = renderSidebar({ identifier: "123" });

    // identifier "123" does not match list id 1 (or 2), so edit links should show
    const firstButtons = container.querySelectorAll(".custom-list-buttons")[0];
    const editLink = firstButtons.querySelector<HTMLAnchorElement>("a");
    expect(editLink).toBeTruthy();
    expect(editLink!.textContent).toContain("Edit");

    // Set identifier to match list with id=1
    rerender(<CustomListsSidebar {...buildProps({ identifier: "1" })} />);
    const firstButtonsAfter = container.querySelectorAll(
      ".custom-list-buttons"
    )[0];
    // Should show "Editing" button (disabled), no link
    const editingBtn = firstButtonsAfter.querySelector<HTMLButtonElement>(
      "button"
    );
    expect(editingBtn).toBeTruthy();
    expect(editingBtn!.textContent).toBe("Editing");
    expect(editingBtn!.disabled).toBe(true);
    expect(firstButtonsAfter.querySelector("a")).toBeFalsy();
  });

  it("renders a view button instead of an edit button if a list is not owned", () => {
    const { container } = renderSidebar({
      lists: [
        {
          id: 1,
          name: "First List",
          entry_count: 5,
          is_owner: false,
          is_shared: false,
        },
      ],
    });

    const firstButtons = container.querySelector(".custom-list-buttons")!;
    const viewLink = firstButtons.querySelector<HTMLAnchorElement>("a");
    expect(viewLink).toBeTruthy();
    expect(viewLink!.textContent).toContain("View");
  });

  it("displays the delete button only to library managers", () => {
    const { container, rerender } = renderSidebar({ isLibraryManager: true });
    let deleteButtons = container.querySelectorAll(
      ".custom-list-buttons button"
    );
    expect(deleteButtons.length).toBe(2);

    rerender(
      <CustomListsSidebar {...buildProps({ isLibraryManager: false })} />
    );
    deleteButtons = container.querySelectorAll(".custom-list-buttons button");
    expect(deleteButtons.length).toBe(0);
  });

  it("does not render a delete button if a list is not owned", () => {
    const { container } = renderSidebar({
      lists: [
        {
          id: 1,
          name: "First List",
          entry_count: 5,
          is_owner: false,
          is_shared: false,
        },
      ],
    });
    expect(
      container.querySelectorAll(".custom-list-buttons button").length
    ).toBe(0);
  });

  it("does not render a delete button if a list is shared", () => {
    const { container } = renderSidebar({
      lists: [
        {
          id: 1,
          name: "First List",
          entry_count: 5,
          is_owner: true,
          is_shared: true,
        },
      ],
    });
    expect(
      container.querySelectorAll(".custom-list-buttons button").length
    ).toBe(0);
  });
});
