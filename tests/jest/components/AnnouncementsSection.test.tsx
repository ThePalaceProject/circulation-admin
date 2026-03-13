import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AnnouncementsSection from "../../../src/components/announcements/AnnouncementsSection";

const announcements = [
  {
    content: "First Announcement",
    start: "2020-05-12",
    finish: "2020-06-12",
    id: "perm_1",
  },
  {
    content: "Second Announcement",
    start: "2020-05-28",
    finish: "2020-06-28",
    id: "perm_2",
  },
];

const setting = {
  description: "announcements",
  format: "date-range",
  key: "announcements",
  label: "Announcements",
  type: "list",
};

describe("AnnouncementsSection", () => {
  it("renders a list of announcements", () => {
    const { container } = render(
      <AnnouncementsSection setting={setting} value={announcements} />
    );
    expect(container.querySelector("h4").textContent).toContain(
      "Scheduled Announcements:"
    );
    const items = container.querySelectorAll(".announcement");
    expect(items).toHaveLength(2);
    expect(items[0].querySelector("span").textContent).toBe(
      "First Announcement"
    );
    expect(items[0].querySelector(".dates").textContent).toBe(
      "05/12/2020 \u2013 06/12/2020"
    );
    expect(items[1].querySelector("span").textContent).toBe(
      "Second Announcement"
    );
  });

  it("renders a form for adding announcements", () => {
    const { container } = render(
      <AnnouncementsSection setting={setting} value={announcements} />
    );
    expect(container.querySelector(".announcement-form")).toBeInTheDocument();
  });

  it("adds an announcement when form is submitted", () => {
    const { container } = render(
      <AnnouncementsSection setting={setting} value={announcements} />
    );
    const textarea = container.querySelector(
      ".announcement-form textarea"
    ) as HTMLTextAreaElement;
    // Set content and fire change
    fireEvent.change(textarea, { target: { value: "Third Announcement" } });
    const addButton = container
      .querySelector(".announcement-form")
      .querySelector("button");
    fireEvent.click(addButton);
    const items = container.querySelectorAll(".announcement");
    expect(items).toHaveLength(3);
  });

  it("deletes an announcement", () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const { container } = render(
      <AnnouncementsSection setting={setting} value={announcements} />
    );
    const deleteButton = container
      .querySelector(".announcement")
      .querySelectorAll("button")[1];
    expect(deleteButton.textContent).toBe("Delete");
    fireEvent.click(deleteButton);
    const items = container.querySelectorAll(".announcement");
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain("Second Announcement");
    confirmSpy.mockRestore();
  });
});
