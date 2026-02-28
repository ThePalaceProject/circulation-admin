import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatronBlockingRulesEditor from "../../../src/components/PatronBlockingRulesEditor";
import { PatronBlockingRule } from "../../../src/interfaces";

const existingRules: PatronBlockingRule[] = [
  { name: "Rule A", rule: "expr_a", message: "msg a" },
  { name: "Rule B", rule: "expr_b" },
];

describe("PatronBlockingRulesEditor", () => {
  it("renders with no rules when no value provided", () => {
    render(<PatronBlockingRulesEditor />);
    expect(screen.getByText(/No patron blocking rules defined/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Add Rule/i })).toBeTruthy();
  });

  it("renders existing rules from value prop", () => {
    render(<PatronBlockingRulesEditor value={existingRules} />);
    expect(screen.getAllByLabelText(/Rule Name/i)).toHaveLength(2);
    expect(screen.getAllByLabelText(/Rule Expression/i)).toHaveLength(2);

    const nameInputs = screen.getAllByLabelText(
      /Rule Name/i
    ) as HTMLInputElement[];
    expect(nameInputs[0].value).toBe("Rule A");
    expect(nameInputs[1].value).toBe("Rule B");

    const ruleTextareas = screen.getAllByLabelText(
      /Rule Expression/i
    ) as HTMLTextAreaElement[];
    expect(ruleTextareas[0].value).toBe("expr_a");
    expect(ruleTextareas[1].value).toBe("expr_b");
  });

  it("adds a new blank rule row when Add Rule is clicked", async () => {
    const user = userEvent.setup();
    render(<PatronBlockingRulesEditor value={[]} />);

    expect(screen.queryByLabelText(/Rule Name/i)).toBeNull();

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));

    expect(screen.getAllByLabelText(/Rule Name/i)).toHaveLength(1);
    expect(screen.getAllByLabelText(/Rule Expression/i)).toHaveLength(1);
    expect(screen.getAllByLabelText(/Message/i)).toHaveLength(1);
  });

  it("removes a rule row when Delete is clicked", async () => {
    const user = userEvent.setup();
    render(<PatronBlockingRulesEditor value={existingRules} />);

    expect(screen.getAllByLabelText(/Rule Name/i)).toHaveLength(2);

    const deleteButtons = screen.getAllByRole("button", { name: /Delete/i });
    await user.click(deleteButtons[0]);

    expect(screen.getAllByLabelText(/Rule Name/i)).toHaveLength(1);
    const remaining = screen.getAllByLabelText(
      /Rule Name/i
    ) as HTMLInputElement[];
    expect(remaining[0].value).toBe("Rule B");
  });

  it("getValue returns current rules including edits", async () => {
    const user = userEvent.setup();
    const ref = React.createRef<PatronBlockingRulesEditor>();
    render(<PatronBlockingRulesEditor ref={ref} value={[]} />);

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));

    const nameInput = screen.getByLabelText(/Rule Name/i);
    const ruleTextarea = screen.getByLabelText(/Rule Expression/i);
    const messageInput = screen.getByLabelText(/Message/i);

    await user.clear(nameInput);
    await user.type(nameInput, "My Rule");
    await user.clear(ruleTextarea);
    await user.type(ruleTextarea, "blocked = true");
    await user.clear(messageInput);
    await user.type(messageInput, "You are blocked");

    const value = ref.current.getValue();
    expect(value).toHaveLength(1);
    expect(value[0].name).toBe("My Rule");
    expect(value[0].rule).toBe("blocked = true");
    expect(value[0].message).toBe("You are blocked");
  });

  it("getValue returns an empty array when no rules exist", () => {
    const ref = React.createRef<PatronBlockingRulesEditor>();
    render(<PatronBlockingRulesEditor ref={ref} value={[]} />);
    expect(ref.current.getValue()).toEqual([]);
  });

  it("disables all inputs and buttons when disabled prop is true", () => {
    render(<PatronBlockingRulesEditor value={existingRules} disabled={true} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => expect(btn).toBeDisabled());

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => expect(input).toBeDisabled());
  });

  it("does not show 'no rules' message when rules exist", () => {
    render(<PatronBlockingRulesEditor value={existingRules} />);
    expect(screen.queryByText(/No patron blocking rules defined/i)).toBeNull();
  });
});
