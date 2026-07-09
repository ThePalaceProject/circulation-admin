import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AnnouncementsSection from "../../../src/components/AnnouncementsSection";
import { SettingData } from "../../../src/interfaces";

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

const setting: SettingData = {
  description: "announcements",
  format: "date-range",
  key: "announcements",
  label: "Announcements",
  type: "list",
};

const renderSection = (ref?: React.RefObject<AnnouncementsSection>) =>
  render(
    <AnnouncementsSection
      ref={ref}
      setting={setting}
      // Fresh copies so the in-place sort during render can't leak between tests.
      value={announcements.map((a) => ({ ...a }))}
    />
  );

const announcementEls = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(".announcement"));

describe("AnnouncementsSection", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders a list of announcements", () => {
    const { container } = renderSection();

    expect(
      screen.getByRole("heading", { name: "Scheduled Announcements:" })
    ).toBeInTheDocument();

    const items = announcementEls(container);
    expect(items).toHaveLength(2);

    // Sorted by start date: First (05/12) then Second (05/28).
    expect(
      within(items[0]).getByText("First Announcement")
    ).toBeInTheDocument();
    expect(
      within(items[0]).getByText("05/12/2020 – 06/12/2020")
    ).toBeInTheDocument();
    expect(
      within(items[1]).getByText("Second Announcement")
    ).toBeInTheDocument();
    expect(
      within(items[1]).getByText("05/28/2020 – 06/28/2020")
    ).toBeInTheDocument();
  });

  it("renders a form", () => {
    const { container } = renderSection();
    expect(container.querySelectorAll(".announcement-form")).toHaveLength(1);
  });

  it("adds an announcement", async () => {
    const { container } = renderSection();
    expect(announcementEls(container)).toHaveLength(2);

    // The only textbox on the page is the form's content field.
    await userEvent.type(screen.getByRole("textbox"), "Third Announcement");
    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(announcementEls(container)).toHaveLength(3);
    expect(screen.getByText("Third Announcement")).toBeInTheDocument();
  });

  it("edits an announcement", async () => {
    const { container } = renderSection();
    expect(announcementEls(container)).toHaveLength(2);

    // Each announcement has its own Edit button; edit the first one.
    await userEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);

    // The edited announcement leaves the list and is loaded into the form.
    const items = announcementEls(container);
    expect(items).toHaveLength(1);
    expect(
      within(items[0]).getByText("Second Announcement")
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("First Announcement");
  });

  it("deletes an announcement", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    const { container } = renderSection();
    expect(announcementEls(container)).toHaveLength(2);

    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    const items = announcementEls(container);
    expect(items).toHaveLength(1);
    expect(
      within(items[0]).getByText("Second Announcement")
    ).toBeInTheDocument();
  });

  it("removes any temporary IDs before submitting the list of announcements", async () => {
    const ref = React.createRef<AnnouncementsSection>();
    renderSection(ref);

    // Add a third announcement through the form; it is assigned a temporary id.
    await userEvent.type(screen.getByRole("textbox"), "Third Announcement");
    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    // `getValue` is the imperative API the parent form calls on submit: it keeps
    // the permanent ids and strips the temporary one.
    const list = ref.current.getValue();
    expect(list[0].id).toBe("perm_1");
    expect(list[1].id).toBe("perm_2");
    expect(list[2].id).toBeUndefined();
  });
});
