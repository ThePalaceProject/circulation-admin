import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import Announcement from "../../../src/components/announcements/Announcement";

const defaultProps = {
  content: "test",
  start: "2020-05-12",
  finish: "2020-05-28",
  id: "1",
  delete: jest.fn(),
  edit: jest.fn(),
};

describe("Announcement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the content and formatted dates", () => {
    const { container, getByText } = render(<Announcement {...defaultProps} />);
    expect(getByText("test")).toBeInTheDocument();
    const dates = container.querySelector(".dates");
    expect(dates!.textContent).toBe("05/12/2020 \u2013 05/28/2020");
  });

  it("renders an Edit button that calls edit with the announcement id", () => {
    const edit = jest.fn();
    const { getByText } = render(
      <Announcement {...defaultProps} edit={edit} />
    );
    const editButton = getByText("Edit");
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);
    expect(edit).toHaveBeenCalledTimes(1);
    expect(edit).toHaveBeenCalledWith("1");
  });

  it("renders a Delete button that calls delete with the announcement id", () => {
    const deleteFn = jest.fn();
    const { getByText } = render(
      <Announcement {...defaultProps} delete={deleteFn} />
    );
    const deleteButton = getByText("Delete");
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);
    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(deleteFn).toHaveBeenCalledWith("1");
  });
});
