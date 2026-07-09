import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AnnouncementForm from "../../../src/components/AnnouncementForm";

// 66 characters — within the 15-350 valid range.
const CONTENT =
  "Here is some sample content which comes out to over 15 characters.";

const getTextarea = () => screen.getByRole("textbox") as HTMLTextAreaElement;
const getDateInputs = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLInputElement>('input[type="date"]')
  );
const getCounter = () => screen.getByText(/Current length:/);

// Mirrors the legacy `fillOutForm`: enter valid content and a start/finish date.
const fillOutForm = async (container: HTMLElement) => {
  const user = userEvent.setup();
  await user.type(getTextarea(), CONTENT);
  const [start, finish] = getDateInputs(container);
  // Date inputs are read via a ref, so `fireEvent.change` (set value + dispatch)
  // is the reliable equivalent of the legacy `getDOMNode().value = ...`.
  fireEvent.change(start, { target: { value: "2020-06-01" } });
  fireEvent.change(finish, { target: { value: "2020-07-01" } });
};

describe("AnnouncementForm", () => {
  let add: jest.Mock;
  beforeEach(() => {
    add = jest.fn();
  });

  it("renders the input fields", () => {
    const { container } = render(<AnnouncementForm add={add} />);

    // Content field: a textarea carrying the 15/350 length constraints.
    const textarea = getTextarea();
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("minlength", "15");
    expect(textarea).toHaveAttribute("maxlength", "350");
    expect(
      screen.getByText("New Announcement Text (15-350 characters)")
    ).toBeInTheDocument();
    expect(screen.getByText("(Current length: 0/350)")).toBeInTheDocument();

    // Two date fields, each with its label and description.
    const dates = getDateInputs(container);
    expect(dates).toHaveLength(2);
    expect(screen.getByText("Start Date")).toBeInTheDocument();
    expect(screen.getByText(/If no start date is chosen/)).toBeInTheDocument();
    expect(screen.getByText("End Date")).toBeInTheDocument();
    expect(
      screen.getByText(/If no expiration date is chosen/)
    ).toBeInTheDocument();
  });

  it("renders the buttons", () => {
    render(<AnnouncementForm add={add} />);
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("keeps track of whether the content is too short or too long", async () => {
    const { container } = render(<AnnouncementForm add={add} />);

    // Empty content: 0/350, flagged as the wrong length, Add disabled.
    expect(getCounter()).toHaveTextContent("(Current length: 0/350)");
    expect(getCounter().parentElement).toHaveClass("wrong-length");
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();

    // Valid content: length flag cleared and Add enabled.
    await fillOutForm(container);
    expect(getCounter()).toHaveTextContent("(Current length: 66/350)");
    expect(getCounter().parentElement).not.toHaveClass("wrong-length");
    expect(screen.getByRole("button", { name: "Add" })).not.toBeDisabled();

    // Content at the 350-character cap is flagged as too long again.
    const longString =
      "Here's some extremely/gratuitously long content.  The point of the content is just to get up to 350 characters so that I can test whether the class name will change.  I realize even as I am typing this that it probably would have been a better idea to do it with filler text; oh well...?  Anyway, I have now written the most boring announcement EVER.";
    fireEvent.change(getTextarea(), { target: { value: longString } });
    expect(getCounter()).toHaveTextContent("(Current length: 350/350)");
    expect(getCounter().parentElement).toHaveClass("wrong-length");
  });

  it("adds a new announcement", async () => {
    const user = userEvent.setup();
    const { container } = render(<AnnouncementForm add={add} />);
    await fillOutForm(container);

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(add).toHaveBeenCalledTimes(1);
    expect(add.mock.calls[0][0].content).toBe(CONTENT);
    expect(add.mock.calls[0][0].start).toBe("2020-06-01");
    expect(add.mock.calls[0][0].finish).toBe("2020-07-01");
  });

  it("cancels adding a new announcement", async () => {
    const user = userEvent.setup();
    const { container } = render(<AnnouncementForm add={add} />);
    const [start0, finish0] = getDateInputs(container);
    const defaultStart = start0.value;
    const defaultFinish = finish0.value;

    await fillOutForm(container);
    expect(getTextarea()).toHaveValue(CONTENT);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    // Cancelling a brand-new announcement adds nothing and restores the
    // empty content field and the default dates.
    expect(add).not.toHaveBeenCalled();
    expect(getTextarea()).toHaveValue("");
    expect(getCounter()).toHaveTextContent("(Current length: 0/350)");
    const [start1, finish1] = getDateInputs(container);
    expect(start1.value).toBe(defaultStart);
    expect(finish1.value).toBe(defaultFinish);
  });

  it("edits an existing announcement", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<AnnouncementForm add={add} />);
    const [start0, finish0] = getDateInputs(container);
    const defaultStart = start0.value;
    const defaultFinish = finish0.value;

    // Supplying an existing announcement's props switches the form to edit mode.
    rerender(
      <AnnouncementForm
        add={add}
        content={CONTENT}
        start="07/01/2020"
        finish="08/01/2020"
      />
    );

    // The form is populated with the existing announcement (dates reformatted).
    expect(getTextarea()).toHaveValue(CONTENT);
    const [start1, finish1] = getDateInputs(container);
    expect(start1.value).toBe("2020-07-01");
    expect(finish1.value).toBe("2020-08-01");

    // Edit the content and save it.
    fireEvent.change(getTextarea(), {
      target: { value: "Here is an edited version of the content" },
    });
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(add).toHaveBeenCalledTimes(1);
    expect(add.mock.calls[0][0].content).toBe(
      "Here is an edited version of the content"
    );

    // The form resets to an empty content field and the default dates.
    expect(getTextarea()).toHaveValue("");
    const [start2, finish2] = getDateInputs(container);
    expect(start2.value).toBe(defaultStart);
    expect(finish2.value).toBe(defaultFinish);
  });

  it("cancels editing an existing announcement", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<AnnouncementForm add={add} />);
    const [start0, finish0] = getDateInputs(container);
    const defaultStart = start0.value;
    const defaultFinish = finish0.value;

    rerender(
      <AnnouncementForm
        add={add}
        content={CONTENT}
        start="07/01/2020"
        finish="08/01/2020"
      />
    );

    expect(getTextarea()).toHaveValue(CONTENT);
    const [start1, finish1] = getDateInputs(container);
    expect(start1.value).toBe("2020-07-01");
    expect(finish1.value).toBe("2020-08-01");

    fireEvent.change(getTextarea(), {
      target: { value: "Here is an edited version of the content" },
    });
    // Cancelling while editing re-submits the (edited) announcement rather than
    // discarding it — unlike cancelling a brand-new one.
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(add).toHaveBeenCalledTimes(1);
    expect(add.mock.calls[0][0].content).toBe(
      "Here is an edited version of the content"
    );

    expect(getTextarea()).toHaveValue("");
    const [start2, finish2] = getDateInputs(container);
    expect(start2.value).toBe(defaultStart);
    expect(finish2.value).toBe(defaultFinish);
  });
});
