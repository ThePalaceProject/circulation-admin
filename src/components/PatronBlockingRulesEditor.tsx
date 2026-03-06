import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { PatronBlockingRule } from "../interfaces";
import EditableInput from "./EditableInput";
import WithRemoveButton from "./WithRemoveButton";
import { validatePatronBlockingRuleExpression } from "../api/patronBlockingRules";

function extractErrorMessage(error: FetchErrorData): string | null {
  if (!error || error.status < 400) return null;
  const resp = error.response as string;
  if (!resp) return null;
  try {
    return JSON.parse(resp).detail || resp;
  } catch {
    return resp;
  }
}

export interface PatronBlockingRulesEditorProps {
  value?: PatronBlockingRule[];
  disabled?: boolean;
  error?: FetchErrorData;
  csrfToken?: string;
  serviceId?: number;
}

export interface PatronBlockingRulesEditorHandle {
  getValue: () => PatronBlockingRule[];
  validateAndGetValue: () => PatronBlockingRule[] | null;
}

type RuleEntry = PatronBlockingRule & { _id: number };
type ClientErrors = { [index: number]: { name?: boolean; rule?: boolean } };
type ServerErrors = { [index: number]: string | null };

interface RuleFormListItemProps {
  rule: RuleEntry;
  index: number;
  disabled: boolean;
  rowErrors: { name?: boolean; rule?: boolean };
  serverRuleError?: string | null;
  error?: FetchErrorData;
  onRemove: () => void;
  onUpdate: (field: keyof PatronBlockingRule, value: string) => void;
  onRuleBlur: () => void;
}

function RuleFormListItem({
  rule,
  index,
  disabled,
  rowErrors,
  serverRuleError,
  error,
  onRemove,
  onUpdate,
  onRuleBlur,
}: RuleFormListItemProps) {
  const nameClientError = !!rowErrors.name;
  const ruleClientError = !!rowErrors.rule;

  return (
    <li className="patron-blocking-rule-row">
      <WithRemoveButton disabled={disabled} onRemove={onRemove}>
        <div className="patron-blocking-rule-fields">
          {nameClientError && (
            <p className="patron-blocking-rule-field-error text-danger">
              Rule Name is required.
            </p>
          )}
          <EditableInput
            elementType="input"
            type="text"
            label="Rule Name"
            name={`patron_blocking_rule_name_${index}`}
            value={rule.name}
            required={true}
            disabled={disabled}
            readOnly={disabled}
            optionalText={false}
            clientError={rowErrors.name}
            error={error}
            onChange={(value) => onUpdate("name", value)}
          />
          {ruleClientError && (
            <p className="patron-blocking-rule-field-error text-danger">
              Rule Expression is required.
            </p>
          )}
          {serverRuleError && (
            <p className="patron-blocking-rule-field-error text-danger">
              {serverRuleError}
            </p>
          )}
          {/* This div captures the focusout event that bubbles up from the
              textarea inside it, triggering server-side rule validation on blur.
              It is not an interactive element and has no keyboard/mouse role —
              the textarea itself handles all user interaction. */}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div onBlur={onRuleBlur}>
            <EditableInput
              elementType="textarea"
              label="Rule Expression"
              name={`patron_blocking_rule_rule_${index}`}
              value={rule.rule}
              required={true}
              disabled={disabled}
              readOnly={disabled}
              optionalText={false}
              clientError={rowErrors.rule}
              error={error}
              onChange={(value) => onUpdate("rule", value)}
            />
          </div>
          <EditableInput
            elementType="textarea"
            label="Message (optional)"
            name={`patron_blocking_rule_message_${index}`}
            value={rule.message || ""}
            disabled={disabled}
            readOnly={disabled}
            optionalText={false}
            onChange={(value) => onUpdate("message", value)}
          />
        </div>
      </WithRemoveButton>
    </li>
  );
}

/** Protocol-agnostic editor for a list of patron blocking rules stored in library settings. */
const PatronBlockingRulesEditor = React.forwardRef<
  PatronBlockingRulesEditorHandle,
  PatronBlockingRulesEditorProps
>(({ value = [], disabled = false, error, csrfToken, serviceId }, ref) => {
  const nextId = React.useRef(0);
  const newId = () => nextId.current++;

  const [rules, setRules] = React.useState<RuleEntry[]>(() =>
    (value || []).map((r) => ({ ...r, _id: newId() }))
  );
  const [clientErrors, setClientErrors] = React.useState<ClientErrors>({});
  const [serverErrors, setServerErrors] = React.useState<ServerErrors>({});

  const serverErrorMessage = extractErrorMessage(error);

  React.useImperativeHandle(
    ref,
    () => ({
      getValue: () => rules.map(({ _id, ...r }) => r),
      validateAndGetValue: () => {
        const errors: ClientErrors = {};
        let valid = true;
        rules.forEach((r, i) => {
          const rowErrors: { name?: boolean; rule?: boolean } = {};
          if (!r.name) {
            rowErrors.name = true;
            valid = false;
          }
          if (!r.rule) {
            rowErrors.rule = true;
            valid = false;
          }
          if (Object.keys(rowErrors).length > 0) {
            errors[i] = rowErrors;
          }
        });
        setClientErrors(errors);
        return valid ? rules.map(({ _id, ...r }) => r) : null;
      },
    }),
    [rules]
  );

  const addRule = () => {
    setRules((prev) => [
      ...prev,
      { name: "", rule: "", message: "", _id: newId() },
    ]);
  };

  const removeRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
    setClientErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setServerErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const updateRule = (
    index: number,
    field: keyof PatronBlockingRule,
    value: string
  ) => {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
    if (field === "name" || field === "rule") {
      setClientErrors((prev) => {
        if (!prev[index]) return prev;
        return { ...prev, [index]: { ...prev[index], [field]: !value } };
      });
    }
    if (field === "rule") {
      setServerErrors((prev) => ({ ...prev, [index]: null }));
    }
  };

  const handleRuleBlur = async (index: number) => {
    const rule = rules[index];
    if (!rule || !rule.rule) {
      return;
    }
    const errorMessage = await validatePatronBlockingRuleExpression(
      serviceId,
      rule,
      csrfToken
    );
    setServerErrors((prev) => ({ ...prev, [index]: errorMessage }));
  };

  const hasIncompleteRule = rules.some((r) => !r.name || !r.rule);

  return (
    <div className="patron-blocking-rules-editor">
      <div className="patron-blocking-rules-header">
        <label className="control-label">Patron Blocking Rules</label>
        <Button
          type="button"
          className="add-patron-blocking-rule"
          disabled={disabled || hasIncompleteRule}
          callback={addRule}
          content="Add Rule"
        />
      </div>
      {serverErrorMessage && (
        <p className="patron-blocking-rule-field-error text-danger">
          {serverErrorMessage}
        </p>
      )}
      {rules.length === 0 && (
        <p className="no-rules-message">No patron blocking rules defined.</p>
      )}
      <ul className="patron-blocking-rules-list list-unstyled">
        {rules.map((rule, index) => (
          <RuleFormListItem
            key={rule._id}
            rule={rule}
            index={index}
            disabled={disabled}
            rowErrors={clientErrors[index] || {}}
            serverRuleError={serverErrors[index]}
            error={error}
            onRemove={() => removeRule(index)}
            onUpdate={(field, value) => updateRule(index, field, value)}
            onRuleBlur={() => handleRuleBlur(index)}
          />
        ))}
      </ul>
    </div>
  );
});

PatronBlockingRulesEditor.displayName = "PatronBlockingRulesEditor";

export default PatronBlockingRulesEditor;
