import * as React from "react";
import { Modal } from "react-bootstrap";
import { Button } from "library-simplified-reusable-components";
import patronBlockingFunctionsHtml from "../content/patronBlockingFunctionsHtml";

const SIMPLEEVAL_URL = "https://github.com/danthedeckie/simpleeval";

export interface PatronBlockingRulesHelpModalProps {
  show: boolean;
  onHide: () => void;
  /** Live patron data dictionary fetched via the remote patron information call. */
  availableFields: Record<string, unknown> | null;
  /** True while the initial available-fields fetch is in progress. */
  fieldsLoading: boolean;
  /** Error message from the available-fields fetch, if any. */
  fieldsError: string | null;
}

export function PatronBlockingRulesHelpModal({
  show,
  onHide,
  availableFields,
  fieldsLoading,
  fieldsError,
}: PatronBlockingRulesHelpModalProps) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      className="patron-blocking-rules-help-modal"
      bsSize="large"
    >
      <Modal.Header closeButton>
        <Modal.Title>Patron Blocking Rules — Help</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <section className="pbr-help-section">
          <h4 className="pbr-help-section-title">Template Variables</h4>
          <p className="pbr-help-section-description">
            These are the patron data fields returned by the remote patron
            information call using the service's test credentials. Reference
            them in rule expressions as <code>{"{field_name}"}</code>.
          </p>
          {fieldsLoading && (
            <p className="pbr-help-loading">Loading available fields…</p>
          )}
          {!fieldsLoading && fieldsError && (
            <p className="pbr-help-unavailable text-warning">{fieldsError}</p>
          )}
          {!fieldsLoading && !fieldsError && availableFields && (
            <table className="pbr-help-fields-table table table-condensed table-bordered">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Sample Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(availableFields).map(([key, value]) => (
                  <tr key={key}>
                    <td>
                      <code>{key}</code>
                    </td>
                    <td className="pbr-help-field-value">
                      {value === null || value === undefined ? (
                        <em className="text-muted">null</em>
                      ) : (
                        String(value)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!fieldsLoading && !fieldsError && !availableFields && (
            <p className="pbr-help-unavailable text-muted">
              No field data available. Ensure the service is saved and test
              credentials are configured.
            </p>
          )}
        </section>

        <section className="pbr-help-section">
          <h4 className="pbr-help-section-title">Available Functions</h4>
          {/* Content is generated at build time from the trusted
              circulation/docs/FUNCTIONS.md source by the sync script. */}
          {/* eslint-disable-next-line react/no-danger */}
          <div
            className="pbr-help-functions-content"
            dangerouslySetInnerHTML={{ __html: patronBlockingFunctionsHtml }}
          />
        </section>

        <section className="pbr-help-section pbr-help-section--last">
          <h4 className="pbr-help-section-title">Syntax Reference</h4>
          <p>
            Rule expressions use{" "}
            <a href={SIMPLEEVAL_URL} target="_blank" rel="noopener noreferrer">
              simpleeval
            </a>{" "}
            syntax — a safe, sandboxed subset of Python expression syntax.
            Boolean operators (<code>and</code>, <code>or</code>,{" "}
            <code>not</code>), comparisons (<code>==</code>, <code>!=</code>,{" "}
            <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>,{" "}
            <code>&gt;=</code>), and string methods are all supported.
          </p>
          <p>
            <a href={SIMPLEEVAL_URL} target="_blank" rel="noopener noreferrer">
              Full simpleeval documentation →
            </a>
          </p>
        </section>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="inverted left-align small inline"
          callback={onHide}
          content="Close"
          title="Close help modal"
        />
      </Modal.Footer>
    </Modal>
  );
}

export default PatronBlockingRulesHelpModal;
