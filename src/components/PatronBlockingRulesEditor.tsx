import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { PatronBlockingRule } from "../interfaces";
import EditableInput from "./EditableInput";
import WithRemoveButton from "./WithRemoveButton";

export interface PatronBlockingRulesEditorProps {
  value?: PatronBlockingRule[];
  disabled?: boolean;
  error?: FetchErrorData;
}

interface PatronBlockingRulesEditorState {
  rules: PatronBlockingRule[];
  clientErrors: { [index: number]: { name?: boolean; rule?: boolean } };
}

/** Protocol-agnostic editor for a list of patron blocking rules stored in library settings. */
export default class PatronBlockingRulesEditor extends React.Component<
  PatronBlockingRulesEditorProps,
  PatronBlockingRulesEditorState
> {
  static defaultProps: Partial<PatronBlockingRulesEditorProps> = {
    value: [],
    disabled: false,
  };

  constructor(props: PatronBlockingRulesEditorProps) {
    super(props);
    this.state = {
      rules: (props.value || []).map((r) => ({ ...r })),
      clientErrors: {},
    };
    this.addRule = this.addRule.bind(this);
  }

  /** Returns the current list of rules; called via ref by parent form logic. */
  getValue(): PatronBlockingRule[] {
    return this.state.rules;
  }

  addRule() {
    const rules = [...this.state.rules, { name: "", rule: "", message: "" }];
    this.setState({ rules });
  }

  removeRule(index: number) {
    const rules = this.state.rules.filter((_, i) => i !== index);
    const clientErrors = { ...this.state.clientErrors };
    delete clientErrors[index];
    this.setState({ rules, clientErrors });
  }

  updateRule(index: number, field: keyof PatronBlockingRule, value: string) {
    const rules = this.state.rules.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    );
    const clientErrors = { ...this.state.clientErrors };
    if (field === "name" || field === "rule") {
      if (clientErrors[index]) {
        clientErrors[index] = { ...clientErrors[index], [field]: !value };
      }
    }
    this.setState({ rules, clientErrors });
  }

  validateAndGetValue(): PatronBlockingRule[] | null {
    const clientErrors: {
      [index: number]: { name?: boolean; rule?: boolean };
    } = {};
    let valid = true;
    this.state.rules.forEach((r, i) => {
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
        clientErrors[i] = rowErrors;
      }
    });
    this.setState({ clientErrors });
    return valid ? this.state.rules : null;
  }

  render(): JSX.Element {
    const { disabled, error } = this.props;
    const { rules, clientErrors } = this.state;

    return (
      <div className="patron-blocking-rules-editor">
        <div className="patron-blocking-rules-header">
          <label className="control-label">Patron Blocking Rules</label>
          <Button
            type="button"
            className="add-patron-blocking-rule"
            disabled={disabled}
            callback={this.addRule}
            content="Add Rule"
          />
        </div>
        {rules.length === 0 && (
          <p className="no-rules-message">No patron blocking rules defined.</p>
        )}
        <ul className="patron-blocking-rules-list list-unstyled">
          {rules.map((rule, index) => {
            const rowErrors = clientErrors[index] || {};
            return (
              <li key={index} className="patron-blocking-rule-row">
                <WithRemoveButton
                  disabled={disabled}
                  onRemove={() => this.removeRule(index)}
                >
                  <div className="patron-blocking-rule-fields">
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
                      onChange={(value) =>
                        this.updateRule(index, "name", value)
                      }
                    />
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
                      onChange={(value) =>
                        this.updateRule(index, "rule", value)
                      }
                    />
                    <EditableInput
                      elementType="textarea"
                      label="Message (optional)"
                      name={`patron_blocking_rule_message_${index}`}
                      value={rule.message || ""}
                      disabled={disabled}
                      readOnly={disabled}
                      optionalText={false}
                      onChange={(value) =>
                        this.updateRule(index, "message", value)
                      }
                    />
                  </div>
                </WithRemoveButton>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
