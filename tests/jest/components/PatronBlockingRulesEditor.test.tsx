import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fetchMock from "fetch-mock-jest";
import PatronBlockingRulesEditor, {
  PatronBlockingRulesEditorHandle,
} from "../../../src/components/PatronBlockingRulesEditor";
import { PatronBlockingRule } from "../../../src/interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";

const VALIDATE_URL = "/admin/patron_auth_service_validate_patron_blocking_rule";

const existingRules: PatronBlockingRule[] = [
  { name: "Rule A", rule: "expr_a", message: "msg a" },
  { name: "Rule B", rule: "expr_b" },
];

/**
 * Both describe blocks share a beforeEach/afterEach that provides a default
 * successful validation response.  This ensures that any incidental blur events
 * fired by user interactions in non-blur-focused tests don't throw
 * "only absolute URLs are supported" errors from the fetch polyfill.
 *
 * Blur-specific tests that need a non-200 response call fetchMock.mockReset()
 * at the start and then set up their own route.
 *
 * Note: in userEvent.type, curly braces are special key sequences.  Use {{
 * and }} to type literal { and } characters.
 */

describe("PatronBlockingRulesEditor — save-blocking (onValidationStateChange)", () => {
  beforeEach(() => {
    fetchMock.post(VALIDATE_URL, { status: 200 });
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it("calls onValidationStateChange(true) when a rule is added with a known serviceId", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <PatronBlockingRulesEditor
        value={[]}
        serviceId={42}
        csrfToken="tok"
        onValidationStateChange={onChange}
      />
    );

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(true));
  });

  it("calls onValidationStateChange(false) after successful validation on blur", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <PatronBlockingRulesEditor
        value={[]}
        serviceId={42}
        csrfToken="tok"
        onValidationStateChange={onChange}
      />
    );

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "My Rule");
    await user.type(screen.getByLabelText(/Rule Expression/i), "{{fines}} > 0");
    await user.tab();

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(false));
  });

  it("leaves onValidationStateChange(true) after failed validation on blur", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    fetchMock.mockReset();
    fetchMock.post(VALIDATE_URL, {
      status: 400,
      body: { detail: "Bad expression" },
    });

    render(
      <PatronBlockingRulesEditor
        value={[]}
        serviceId={42}
        csrfToken="tok"
        onValidationStateChange={onChange}
      />
    );

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "My Rule");
    await user.type(screen.getByLabelText(/Rule Expression/i), "bad_syntax");
    await user.tab();

    // Wait for the error to appear; the rule stays in pending so the last
    // call must have been true (not unblocked by the failed validation).
    await screen.findByText(/Bad expression/i);
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it("calls onValidationStateChange(true) when two rules have the same name", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const rules: PatronBlockingRule[] = [
      { name: "Rule A", rule: "expr_a" },
      { name: "Rule B", rule: "expr_b" },
    ];

    render(
      <PatronBlockingRulesEditor
        value={rules}
        serviceId={42}
        csrfToken="tok"
        onValidationStateChange={onChange}
      />
    );

    // Initially not blocking (no duplicates, no pending)
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(false));

    // Rename rule B to match rule A
    const nameInputs = screen.getAllByLabelText(
      /Rule Name/i
    ) as HTMLInputElement[];
    await user.clear(nameInputs[1]);
    await user.type(nameInputs[1], "Rule A");

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(true));
  });

  it("calls onValidationStateChange(false) after a duplicate name is resolved", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const rules: PatronBlockingRule[] = [
      { name: "Rule A", rule: "expr_a" },
      { name: "Rule A", rule: "expr_b" }, // duplicate
    ];

    render(
      <PatronBlockingRulesEditor
        value={rules}
        serviceId={42}
        csrfToken="tok"
        onValidationStateChange={onChange}
      />
    );

    // Initially blocking due to duplicate name
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(true));

    // Fix the duplicate
    const nameInputs = screen.getAllByLabelText(
      /Rule Name/i
    ) as HTMLInputElement[];
    await user.clear(nameInputs[1]);
    await user.type(nameInputs[1], "Rule B");

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(false));
  });

  it("does not call onValidationStateChange(true) when a rule is added without a serviceId", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <PatronBlockingRulesEditor
        value={[]}
        csrfToken="tok"
        onValidationStateChange={onChange}
        // No serviceId — new service not yet saved
      />
    );

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));

    // Should be called with false — no pending server validation without a serviceId
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(false));
    expect(onChange).not.toHaveBeenCalledWith(true);
  });

  it("removes blocking state when the pending rule is deleted", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <PatronBlockingRulesEditor
        value={[]}
        serviceId={42}
        csrfToken="tok"
        onValidationStateChange={onChange}
      />
    );

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(true));

    // Delete the only rule — blocking should clear
    await user.click(screen.getByRole("button", { name: /Delete/i }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(false));
  });
});

describe("PatronBlockingRulesEditor — on-blur server validation", () => {
  beforeEach(() => {
    fetchMock.post(VALIDATE_URL, { status: 200 });
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it("calls the validation API when the user leaves the Rule Expression field", async () => {
    const user = userEvent.setup();

    render(
      <PatronBlockingRulesEditor value={[]} serviceId={42} csrfToken="tok" />
    );

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "My Rule");
    await user.type(
      screen.getByLabelText(/Rule Expression/i),
      "{{fines}} > 10.0"
    );
    await user.tab();

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        VALIDATE_URL,
        expect.objectContaining({ method: "POST" })
      )
    );
  });

  it("shows a server error message inline after a failed validation", async () => {
    const user = userEvent.setup();
    fetchMock.mockReset();
    fetchMock.post(VALIDATE_URL, {
      status: 400,
      body: { detail: "Unknown placeholder: {x}" },
    });

    render(
      <PatronBlockingRulesEditor value={[]} serviceId={42} csrfToken="tok" />
    );

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "Bad Rule");
    await user.type(screen.getByLabelText(/Rule Expression/i), "{{x}} > 0");
    await user.tab();

    expect(await screen.findByText(/Unknown placeholder: \{x\}/i)).toBeTruthy();
  });

  it("clears the server error immediately when the user edits the rule field", async () => {
    const user = userEvent.setup();
    fetchMock.mockReset();
    fetchMock.post(VALIDATE_URL, {
      status: 400,
      body: { detail: "Bad expression" },
    });

    render(
      <PatronBlockingRulesEditor value={[]} serviceId={42} csrfToken="tok" />
    );

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "My Rule");
    await user.type(screen.getByLabelText(/Rule Expression/i), "bad");
    await user.tab();

    await screen.findByText(/Bad expression/i);

    // Typing in the rule field clears the server error immediately (no re-fetch needed)
    await user.click(screen.getByLabelText(/Rule Expression/i));
    await user.type(screen.getByLabelText(/Rule Expression/i), "x");

    expect(screen.queryByText(/Bad expression/i)).toBeNull();
  });

  it("does not call the validation API when the rule field is empty on blur", async () => {
    const user = userEvent.setup();
    fetchMock.mockReset();

    render(
      <PatronBlockingRulesEditor value={[]} serviceId={42} csrfToken="tok" />
    );

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "My Rule");
    // Click the Rule Expression textarea then tab away without typing
    await user.click(screen.getByLabelText(/Rule Expression/i));
    await user.tab();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("still calls the validation API when serviceId is undefined and shows the server error", async () => {
    const user = userEvent.setup();
    fetchMock.mockReset();
    fetchMock.post(VALIDATE_URL, {
      status: 400,
      body: {
        detail:
          "Patron auth service not found. Save the service before validating rules.",
      },
    });

    // No serviceId — simulates a new service that has not yet been saved
    render(<PatronBlockingRulesEditor value={[]} csrfToken="tok" />);

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "My Rule");
    await user.type(screen.getByLabelText(/Rule Expression/i), "{{fines}} > 0");
    await user.tab();

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        VALIDATE_URL,
        expect.objectContaining({ method: "POST" })
      )
    );
    expect(
      await screen.findByText(/Save the service before validating rules/i)
    ).toBeTruthy();
  });

  it("shows no error after a successful re-validation that follows a failure", async () => {
    const user = userEvent.setup();
    fetchMock.mockReset();
    fetchMock.post(VALIDATE_URL, {
      status: 400,
      body: { detail: "Syntax error in rule" },
    });

    render(
      <PatronBlockingRulesEditor value={[]} serviceId={42} csrfToken="tok" />
    );

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    await user.type(screen.getByLabelText(/Rule Name/i), "My Rule");
    await user.type(screen.getByLabelText(/Rule Expression/i), "bad_syntax");
    await user.tab();

    await screen.findByText(/Syntax error in rule/i);

    // Switch mock to success, correct the rule, and blur again
    fetchMock.mockReset();
    fetchMock.post(VALIDATE_URL, { status: 200 });

    await user.clear(screen.getByLabelText(/Rule Expression/i));
    await user.type(screen.getByLabelText(/Rule Expression/i), "{{fines}} > 0");
    await user.tab();

    await waitFor(() =>
      expect(screen.queryByText(/Syntax error in rule/i)).toBeNull()
    );
  });
});

describe("PatronBlockingRulesEditor", () => {
  // Provide a default successful validation response so that tests which
  // incidentally trigger blur on the Rule Expression field (e.g. by typing in
  // the Message textarea) don't produce "only absolute URLs" fetch errors.
  beforeEach(() => {
    fetchMock.post(VALIDATE_URL, { status: 200 });
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

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
    const ref = React.createRef<PatronBlockingRulesEditorHandle>();
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
    const ref = React.createRef<PatronBlockingRulesEditorHandle>();
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

  it("disables Add Rule button when an existing rule is missing required fields", async () => {
    const user = userEvent.setup();
    render(<PatronBlockingRulesEditor value={[]} />);

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));

    expect(screen.getByRole("button", { name: /Add Rule/i })).toBeDisabled();
  });

  it("re-enables Add Rule button once all required fields are filled", async () => {
    const user = userEvent.setup();
    render(<PatronBlockingRulesEditor value={[]} />);

    await user.click(screen.getByRole("button", { name: /Add Rule/i }));
    expect(screen.getByRole("button", { name: /Add Rule/i })).toBeDisabled();

    await user.type(screen.getByLabelText(/Rule Name/i), "My Rule");
    await user.type(
      screen.getByLabelText(/Rule Expression/i),
      "blocked = true"
    );

    expect(
      screen.getByRole("button", { name: /Add Rule/i })
    ).not.toBeDisabled();
  });

  it("shows server error message even when there are no rules", () => {
    const error: FetchErrorData = {
      status: 500,
      response: JSON.stringify({ detail: "Internal server error" }),
      url: "",
    };
    render(<PatronBlockingRulesEditor value={[]} error={error} />);
    expect(screen.getByText(/Internal server error/i)).toBeTruthy();
  });

  it("getValue does not include internal _id field in returned rules", () => {
    const ref = React.createRef<PatronBlockingRulesEditorHandle>();
    render(<PatronBlockingRulesEditor ref={ref} value={existingRules} />);
    const value = ref.current.getValue();
    value.forEach((rule) => {
      expect(rule).not.toHaveProperty("_id");
    });
  });
});
