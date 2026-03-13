import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import AnnouncementForm from "../../../src/components/announcements/AnnouncementForm";

/** Replicate component's getDefaultDates() logic so tests can match defaults. */
function getDefaultDates(): [string, string] {
  const today = new Date();
  const twoMonths = new Date(today);
  twoMonths.setMonth(twoMonths.getMonth() + 2);
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  return [fmt(today), fmt(twoMonths)];
}

const contentString =
  "Here is some sample content which comes out to over 15 characters.";

describe("AnnouncementForm", () => {
  let add: jest.Mock;

  beforeEach(() => {
    add = jest.fn();
  });

  // ── helpers ──────────────────────────────────────────────────────────────

  function renderForm(
    props: Partial<React.ComponentProps<typeof AnnouncementForm>> = {}
  ) {
    return render(<AnnouncementForm add={add} {...props} />);
  }

  function fillOutForm(container: HTMLElement) {
    const textarea = container.querySelector("textarea")!;
    fireEvent.change(textarea, { target: { value: contentString } });

    const inputs = container.querySelectorAll("input");
    fireEvent.change(inputs[0], { target: { value: "2020-06-01" } });
    fireEvent.change(inputs[1], { target: { value: "2020-07-01" } });
  }

  function getTextareaValue(container: HTMLElement) {
    return (container.querySelector("textarea") as HTMLTextAreaElement).value;
  }
  function getDateValues(container: HTMLElement): [string, string] {
    const inputs = container.querySelectorAll("input");
    return [
      (inputs[0] as HTMLInputElement).value,
      (inputs[1] as HTMLInputElement).value,
    ];
  }

  // ── rendering ────────────────────────────────────────────────────────────

  it("renders the input fields", () => {
    const { container } = renderForm();

    const textarea = container.querySelector("textarea");
    expect(textarea).toBeTruthy();

    const dateInputs = container.querySelectorAll("input[type='date']");
    expect(dateInputs).toHaveLength(2);
  });

  it("renders EditableInput props for content field", () => {
    const { container } = renderForm();
    const textarea = container.querySelector("textarea")!;
    expect(
      textarea.getAttribute("minlength") ??
        textarea.getAttribute("data-minlength")
    ).toBeTruthy();
    // label text
    expect(container.textContent).toContain(
      "New Announcement Text (15-350 characters)"
    );
    // description
    expect(container.textContent).toContain("(Current length: 0/350)");
  });

  it("renders start and end date field labels and descriptions", () => {
    const { container } = renderForm();
    expect(container.textContent).toContain("Start Date");
    expect(container.textContent).toContain("End Date");
    expect(container.textContent).toContain(
      "If no start date is chosen, the default start date is today's date."
    );
    expect(container.textContent).toContain(
      "If no expiration date is chosen, the default expiration date is 2 months from the start date."
    );
  });

  it("renders the buttons", () => {
    const { container } = renderForm();
    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toBe("Add");
    expect(buttons[1].textContent).toBe("Cancel");
  });

  it("initialises with default date values", () => {
    const [defaultStart, defaultFinish] = getDefaultDates();
    const { container } = renderForm();
    const [startVal, finishVal] = getDateValues(container);
    expect(startVal).toBe(defaultStart);
    expect(finishVal).toBe(defaultFinish);
  });

  // ── content length / wrong-length class ──────────────────────────────────

  it("shows correct counter and wrong-length when content is empty", () => {
    const { container } = renderForm();
    const counter = container.querySelector(".description");
    expect(counter!.textContent).toBe("(Current length: 0/350)");
    expect(counter!.parentElement!.classList.contains("wrong-length")).toBe(
      true
    );
  });

  it("Add button is disabled when content is too short", () => {
    const { container } = renderForm();
    const addButton = container.querySelectorAll("button")[0];
    expect(addButton).toBeDisabled();
  });

  it("updates counter and removes wrong-length after valid content", () => {
    const { container } = renderForm();

    const textarea = container.querySelector("textarea")!;
    fireEvent.change(textarea, { target: { value: contentString } });

    const counter = container.querySelector(".description");
    expect(counter!.textContent).toBe(
      `(Current length: ${contentString.length}/350)`
    );
    expect(counter!.parentElement!.classList.contains("wrong-length")).toBe(
      false
    );
    const addButton = container.querySelectorAll("button")[0];
    expect(addButton).not.toBeDisabled();
  });

  it("shows wrong-length and disables Add for content at exactly 350 chars", () => {
    const { container } = renderForm();
    const longString =
      "Here's some extremely/gratuitously long content.  The point of the content is just to get up to 350 characters so that I can test whether the class name will change.  I realize even as I am typing this that it probably would have been a better idea to do it with filler text; oh well...?  Anyway, I have now written the most boring announcement EVER.";
    // Exactly 350 chars
    const textarea = container.querySelector("textarea")!;
    fireEvent.change(textarea, { target: { value: longString } });

    const counter = container.querySelector(".description");
    expect(counter!.textContent).toBe("(Current length: 350/350)");
    expect(counter!.parentElement!.classList.contains("wrong-length")).toBe(
      true
    );
    const addButton = container.querySelectorAll("button")[0];
    expect(addButton).toBeDisabled();
  });

  // ── add announcement ─────────────────────────────────────────────────────

  it("adds a new announcement", () => {
    const { container } = renderForm();
    fillOutForm(container);

    const addButton = container.querySelectorAll("button")[0];
    fireEvent.click(addButton);

    expect(add).toHaveBeenCalledTimes(1);
    const args = add.mock.calls[0][0];
    expect(args.content).toBe(contentString);
    expect(args.start).toBe("2020-06-01");
    expect(args.finish).toBe("2020-07-01");
  });

  it("resets to defaults after adding", () => {
    const [defaultStart, defaultFinish] = getDefaultDates();
    const { container } = renderForm();
    fillOutForm(container);

    fireEvent.click(container.querySelectorAll("button")[0]);

    expect(getTextareaValue(container)).toBe("");
    const [s, f] = getDateValues(container);
    expect(s).toBe(defaultStart);
    expect(f).toBe(defaultFinish);
  });

  // ── cancel ───────────────────────────────────────────────────────────────

  it("cancels adding a new announcement and resets defaults", () => {
    const [defaultStart, defaultFinish] = getDefaultDates();
    const { container } = renderForm();
    fillOutForm(container);

    fireEvent.click(container.querySelectorAll("button")[1]); // Cancel

    expect(add).not.toHaveBeenCalled();
    expect(getTextareaValue(container)).toBe("");
    const [s, f] = getDateValues(container);
    expect(s).toBe(defaultStart);
    expect(f).toBe(defaultFinish);
  });

  // ── edit existing announcement ────────────────────────────────────────────

  it("edits an existing announcement (rerender with props updates state)", () => {
    const { container, rerender } = renderForm();

    rerender(
      <AnnouncementForm
        add={add}
        content={contentString}
        start="07/01/2020"
        finish="08/01/2020"
      />
    );

    expect(getTextareaValue(container)).toBe(contentString);
    const [s, f] = getDateValues(container);
    expect(s).toBe("2020-07-01");
    expect(f).toBe("2020-08-01");
  });

  it("submits edited content and resets after clicking Add in edit mode", () => {
    const [defaultStart, defaultFinish] = getDefaultDates();
    const { container, rerender } = renderForm();

    rerender(
      <AnnouncementForm
        add={add}
        content={contentString}
        start="07/01/2020"
        finish="08/01/2020"
      />
    );

    // Edit the content
    const textarea = container.querySelector("textarea")!;
    const editedContent = "Here is an edited version of the content";
    fireEvent.change(textarea, { target: { value: editedContent } });

    fireEvent.click(container.querySelectorAll("button")[0]); // Add

    expect(add).toHaveBeenCalledTimes(1);
    expect(add.mock.calls[0][0].content).toBe(editedContent);

    // state resets
    expect(getTextareaValue(container)).toBe("");
    const [s, f] = getDateValues(container);
    expect(s).toBe(defaultStart);
    expect(f).toBe(defaultFinish);
  });

  it("cancels editing an existing announcement — calls add with edited content then resets", () => {
    const [defaultStart, defaultFinish] = getDefaultDates();
    const { container, rerender } = renderForm();

    rerender(
      <AnnouncementForm
        add={add}
        content={contentString}
        start="07/01/2020"
        finish="08/01/2020"
      />
    );

    const textarea = container.querySelector("textarea")!;
    const editedContent = "Here is an edited version of the content";
    fireEvent.change(textarea, { target: { value: editedContent } });

    fireEvent.click(container.querySelectorAll("button")[1]); // Cancel

    // cancel() calls add() with current state when in edit mode
    expect(add).toHaveBeenCalledTimes(1);
    expect(add.mock.calls[0][0].content).toBe(editedContent);

    // then resets
    expect(getTextareaValue(container)).toBe("");
    const [s, f] = getDateValues(container);
    expect(s).toBe(defaultStart);
    expect(f).toBe(defaultFinish);
  });
});
