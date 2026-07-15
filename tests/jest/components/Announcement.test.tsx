import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Announcement from "../../../src/components/Announcement";

describe("Announcement", () => {
  let stubDelete: jest.Mock;
  let stubEdit: jest.Mock;

  beforeEach(() => {
    stubDelete = jest.fn();
    stubEdit = jest.fn();
  });

  const renderAnnouncement = (
    overrides: Partial<React.ComponentProps<typeof Announcement>> = {}
  ) =>
    render(
      <Announcement
        content="test"
        start="2020-05-12"
        finish="2020-05-28"
        id="1"
        delete={stubDelete}
        edit={stubEdit}
        {...overrides}
      />
    );

  it("renders the content and dates", () => {
    const { container } = renderAnnouncement();

    expect(
      container.querySelector("section.announcement-info")
    ).toBeInTheDocument();
    expect(container.querySelector(".dates")).toHaveTextContent(
      "05/12/2020 – 05/28/2020"
    );
    expect(screen.getByText("test")).toBeInTheDocument();
  });

  it("renders an edit button", async () => {
    const user = userEvent.setup();
    renderAnnouncement();

    const editButton = screen.getByRole("button", { name: "Edit" });
    await user.click(editButton);

    expect(stubEdit).toHaveBeenCalledTimes(1);
    expect(stubEdit).toHaveBeenCalledWith("1");
  });

  it("renders a delete button", async () => {
    const user = userEvent.setup();
    renderAnnouncement();

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    expect(stubDelete).toHaveBeenCalledTimes(1);
    expect(stubDelete).toHaveBeenCalledWith("1");
  });

  it("formats dates", () => {
    // The dates are stored as year-month-day but displayed as month/day/year.
    const { container } = renderAnnouncement({
      start: "2020-03-14",
      finish: "2021-12-25",
    });

    expect(container.querySelector(".dates")).toHaveTextContent(
      "03/14/2020 – 12/25/2021"
    );
  });
});
