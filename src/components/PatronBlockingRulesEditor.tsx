import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { PatronBlockingRule } from "../interfaces";
import EditableInput from "./EditableInput";
import WithRemoveButton from "./WithRemoveButton";
import { validatePatronBlockingRuleExpression } from "../api/patronBlockingRules";

function hasDuplicateRuleNames(rules: RuleEntry[]): boolean {
  const names = rules.map((r) => r.name).filter((n) => n !== "");
  return new Set(names).size < names.length;
}

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
  /** Called whenever the "save should be blocked" state changes.
   *  True while any rule is awaiting or has failed server-side validation,
   *  or while any two rules share the same name. */
  onValidationStateChange?: (isBlocking: boolean) => void;
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
>(
  (
    {
      value = [],
      disabled = false,
      error,
      csrfToken,
      serviceId,
      onValidationStateChange,
    },
    ref
  ) => {
    const nextId = React.useRef(0);
    const newId = () => nextId.current++;

    const [rules, setRules] = React.useState<RuleEntry[]>(() =>
      (value || []).map((r) => ({ ...r, _id: newId() }))
    );
    const [clientErrors, setClientErrors] = React.useState<ClientErrors>({});
    const [serverErrors, setServerErrors] = React.useState<ServerErrors>({});
    const [pendingValidationIds, setPendingValidationIds] = React.useState<
      Set<number>
    >(new Set());

    // Keep a stable ref to the latest callback so the useEffect below does not
    // need it as a dependency (avoids extra calls when a class-component parent
    // creates a new arrow function on every render).
    const onValidationStateChangeRef = React.useRef(onValidationStateChange);
    React.useLayoutEffect(() => {
      onValidationStateChangeRef.current = onValidationStateChange;
    });

    React.useEffect(() => {
      const isBlocking =
        pendingValidationIds.size > 0 || hasDuplicateRuleNames(rules);
      onValidationStateChangeRef.current?.(isBlocking);
    }, [pendingValidationIds, rules]);

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
      const newEntry: RuleEntry = {
        name: "",
        rule: "",
        message: "",
        _id: newId(),
      };
      setRules((prev) => [...prev, newEntry]);
      // Only track pending validation when we have a saved service to validate against.
      if (serviceId !== undefined) {
        setPendingValidationIds((prev) => new Set(prev).add(newEntry._id));
      }
    };

    const removeRule = (index: number) => {
      const removedId = rules[index]._id;
      setRules((prev) => prev.filter((_, i) => i !== index));
      setPendingValidationIds((prev) => {
        const next = new Set(prev);
        next.delete(removedId);
        return next;
      });
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
        // Mark as needing re-validation whenever the expression changes.
        if (serviceId !== undefined) {
          setPendingValidationIds((prev) =>
            new Set(prev).add(rules[index]._id)
          );
        }
      }
    };

    const handleRuleBlur = async (index: number) => {
      const rule = rules[index];
      if (!rule || !rule.rule) {
        // Empty expression — skip server call; leave in pending so Save stays
        // disabled until the user fills in the expression or removes the rule.
        return;
      }
      const errorMessage = await validatePatronBlockingRuleExpression(
        serviceId,
        rule,
        csrfToken
      );
      setServerErrors((prev) => ({ ...prev, [index]: errorMessage }));
      if (!errorMessage) {
        // Validation passed — unblock save for this rule.
        setPendingValidationIds((prev) => {
          const next = new Set(prev);
          next.delete(rule._id);
          return next;
        });
      }
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
  }
);

PatronBlockingRulesEditor.displayName = "PatronBlockingRulesEditor";

export default PatronBlockingRulesEditor;
