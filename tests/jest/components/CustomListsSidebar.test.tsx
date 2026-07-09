import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomListsSidebar from "../../../src/components/CustomListsSidebar";

// Render react-router's Link as a marker anchor so we can assert its target
// (`data-to`), text, and className without needing a Router in the test.
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  Link: (props) => (
    <div data-testid="Link" data-to={props.to} className={props.className}>
      {props.children}
    </div>
  ),
}));

describe("CustomListsSidebar", () => {
  const makeLists = () => [
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

  const baseProps = () => ({
    filter: "owned",
    lists: makeLists(),
    library: "library_name",
    identifier: "123",
    isLibraryManager: true,
    deleteCustomList: jest.fn(),
    changeSort: jest.fn(),
    sortOrder: "asc",
  });

  it("renders a sidebar with a header and a create button", () => {
    const { container } = render(<CustomListsSidebar {...baseProps()} />);

    expect(
      container.querySelector(".custom-lists-sidebar")
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "List Manager"
    );

    const createButton = screen.getAllByTestId("Link")[0];
    expect(createButton).toHaveTextContent("Create New List");
    expect(createButton).toHaveAttribute(
      "data-to",
      "/admin/web/lists/library_name/create"
    );
  });

  it("renders filter select", () => {
    const { container } = render(<CustomListsSidebar {...baseProps()} />);

    const select = container.querySelector<HTMLSelectElement>(
      'select[name="filter"]'
    );
    expect(select).toHaveValue("owned");

    const options = within(select).getAllByRole("option");
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue("");
    expect(options[1]).toHaveValue("owned");
    expect(options[2]).toHaveValue("shared-out");
    expect(options[3]).toHaveValue("shared-in");
  });

  it("renders sort select", () => {
    const { container } = render(<CustomListsSidebar {...baseProps()} />);

    const select = container.querySelector<HTMLSelectElement>(
      'select[name="sort"]'
    );
    expect(select).toHaveValue("asc");

    const options = within(select).getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue("asc");
    expect(options[1]).toHaveValue("desc");
  });

  it("renders a list of custom list info items", async () => {
    const user = userEvent.setup();
    const deleteCustomList = jest.fn();
    const { container } = render(
      <CustomListsSidebar
        {...baseProps()}
        deleteCustomList={deleteCustomList}
      />
    );

    const listItems = container.querySelectorAll("ul > li");
    expect(listItems).toHaveLength(2);
    const [firstList, secondList] = Array.from(listItems);

    const firstInfo = firstList.querySelectorAll(".custom-list-info > div");
    expect(firstInfo[0]).toHaveTextContent("First List");
    expect(firstInfo[1]).toHaveTextContent("Books in list: 5");
    expect(firstInfo[2]).toHaveTextContent("ID-1");

    const firstButtons = firstList.querySelector<HTMLElement>(
      ".custom-list-buttons"
    );
    const firstEdit = within(firstButtons).getByTestId("Link");
    expect(firstEdit).toHaveTextContent("Edit");
    expect(firstEdit).toHaveAttribute(
      "data-to",
      "/admin/web/lists/library_name/edit/1"
    );
    const firstDelete = within(firstButtons).getByRole("button");
    expect(firstDelete).toHaveTextContent("Delete");
    await user.click(firstDelete);
    expect(deleteCustomList).toHaveBeenCalledTimes(1);

    const secondInfo = secondList.querySelectorAll(".custom-list-info > div");
    expect(secondInfo[0]).toHaveTextContent("Second List");
    expect(secondInfo[1]).toHaveTextContent("Books in list: 10");
    expect(secondInfo[2]).toHaveTextContent("ID-2");

    const secondButtons = secondList.querySelector<HTMLElement>(
      ".custom-list-buttons"
    );
    const secondEdit = within(secondButtons).getByTestId("Link");
    expect(secondEdit).toHaveTextContent("Edit");
    expect(secondEdit).toHaveAttribute(
      "data-to",
      "/admin/web/lists/library_name/edit/2"
    );
    const secondDelete = within(secondButtons).getByRole("button");
    expect(secondDelete).toHaveTextContent("Delete");
    await user.click(secondDelete);
    expect(deleteCustomList).toHaveBeenCalledTimes(2);
  });

  it("disables the edit button if the list is already being edited", () => {
    const props = baseProps();
    const { container, rerender } = render(<CustomListsSidebar {...props} />);

    const firstButtons = () =>
      container.querySelectorAll<HTMLElement>(".custom-list-buttons")[0];

    const editLink = within(firstButtons()).getByTestId("Link");
    expect(editLink).not.toHaveClass("disabled");
    expect(editLink).toHaveTextContent("EditPencil Icon");

    rerender(<CustomListsSidebar {...props} identifier="1" />);

    const editingButton = within(firstButtons()).getByRole("button", {
      name: "Editing",
    });
    expect(editingButton).toBeDisabled();
  });

  it("renders a view button instead of an edit button if a list is not owned", () => {
    const { container } = render(
      <CustomListsSidebar
        {...baseProps()}
        lists={[
          {
            id: 1,
            name: "First List",
            entry_count: 5,
            is_owner: false,
            is_shared: false,
          },
        ]}
      />
    );

    const firstButtons = container.querySelector<HTMLElement>(
      ".custom-list-buttons"
    );
    const viewLink = within(firstButtons).getByTestId("Link");
    expect(viewLink).not.toHaveClass("disabled");
    expect(viewLink).toHaveTextContent("ViewVisible Icon");
  });

  it("displays the delete button only to library managers", () => {
    const props = baseProps();
    const { container, rerender } = render(<CustomListsSidebar {...props} />);

    expect(
      container.querySelectorAll(".custom-list-buttons button")
    ).toHaveLength(2);

    rerender(<CustomListsSidebar {...props} isLibraryManager={false} />);

    expect(
      container.querySelectorAll(".custom-list-buttons button")
    ).toHaveLength(0);
  });

  it("does not render a delete button if a list is not owned", () => {
    const { container } = render(
      <CustomListsSidebar
        {...baseProps()}
        lists={[
          {
            id: 1,
            name: "First List",
            entry_count: 5,
            is_owner: false,
            is_shared: false,
          },
        ]}
      />
    );

    expect(
      container.querySelectorAll(".custom-list-buttons button")
    ).toHaveLength(0);
  });

  it("does not render a delete button if a list is shared", () => {
    const { container } = render(
      <CustomListsSidebar
        {...baseProps()}
        lists={[
          {
            id: 1,
            name: "First List",
            entry_count: 5,
            is_owner: true,
            is_shared: true,
          },
        ]}
      />
    );

    expect(
      container.querySelectorAll(".custom-list-buttons button")
    ).toHaveLength(0);
  });
});
