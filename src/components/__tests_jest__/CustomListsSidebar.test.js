import * as React from "react";
import { render } from "../../testUtils/testUtils";
import { fireEvent, screen, within } from "@testing-library/react";

import CustomListsSidebar from "../CustomListsSidebar";
import {
  changeSort,
  deleteCustomList,
  library,
  listData,
  lists,
  resetResponseBodyState,
} from "../../testUtils/mockValues";

describe("CustomListsSidebar", () => {
  let utils;
  beforeEach(() => {
    utils = render(
      <CustomListsSidebar
        changeSort={changeSort}
        deleteCustomList={deleteCustomList}
        identifier={listData.id}
        isSortedAtoZ
        library={library.short_name}
        lists={lists}
        resetResponseBodyState={resetResponseBodyState}
      />
    );
  });

  it("renders the `List Manager` heading, new list button, and sort radios", () => {
    const listManagerHeading = screen.getByRole("heading", { level: 2 });

    expect(listManagerHeading).toHaveTextContent(/list manager/i);

    const newListButton = screen.getAllByRole("button")[0];

    expect(newListButton).toHaveTextContent(/create new list/i);

    const sortFieldset = screen.getByRole("group");

    const sortRadios = within(sortFieldset).getAllByRole("radio");

    expect(sortRadios.length).toEqual(2);

    expect(sortRadios[0]).toHaveAccessibleName(/sort/i);
    expect(sortRadios[0].checked).toBe(true);
    expect(sortRadios[1]).toHaveAccessibleName(/sort/i);
    expect(sortRadios[1].checked).toBe(false);
  });

  it("calls the changeSort function if the unchecked radio is clicked", async () => {
    const sortFieldset = screen.getByRole("group");

    const sortRadios = within(sortFieldset).getAllByRole("radio");

    expect(sortRadios[0].checked).toBe(true);
    expect(sortRadios[1].checked).toBe(false);

    await fireEvent.click(sortRadios[1]);

    expect(sortRadios[0].checked).toBe(false);
    expect(sortRadios[1].checked).toBe(true);

    expect(changeSort).toHaveBeenCalled();
  });

  it("renders a list of lists", () => {
    const sidebarList = screen.getByRole("list");

    expect(sidebarList).toBeInTheDocument();

    const lists = within(sidebarList).getAllByRole("listitem");

    expect(lists.length).toEqual(4);

    const firstList = lists[0];
    const lastList = lists[3];

    expect(firstList).toHaveTextContent(/list a/i);

    expect(firstList).toHaveTextContent(/id-1/i);

    expect(lastList).toHaveTextContent(/list d/i);

    expect(lastList).toHaveTextContent(/id-4/i);

    const firstListButtons = within(firstList).getAllByRole("button");

    const lastListButtons = within(lastList).getAllByRole("button");

    // The active list has 2 buttons, non-active lists have 1 button and 1 link
    expect(firstListButtons.length).toEqual(2);
    expect(lastListButtons.length).toEqual(1);

    expect(firstListButtons[0]).toHaveTextContent(/editing/i);

    expect(firstListButtons[1]).toHaveTextContent(/delete/i);
  });

  it("calls the appropriate function if the delete button is clicked", async () => {
    const sidebarList = screen.getByRole("list");

    const lists = within(sidebarList).getAllByRole("listitem");

    const firstList = lists[0];

    const firstListButtons = within(firstList).getAllByRole("button");
    const deleteButton = firstListButtons[1];

    await fireEvent.click(deleteButton);
    expect(deleteCustomList).toHaveBeenCalled();
  });
});
