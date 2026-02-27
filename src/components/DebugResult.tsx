import * as React from "react";
import { Panel } from "library-simplified-reusable-components";
import { PatronDebugResult, ResultDetails } from "../api/patronDebug";

export interface DebugResultProps {
  result: PatronDebugResult;
  sequence: number;
}

/** Render a single ResultDetails value as a React node. */
const renderValue = (value: ResultDetails): React.ReactNode => {
  if (value === null || typeof value === "boolean") {
    return <code>{String(value)}</code>;
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  // Array or object — show as pretty-printed JSON
  return (
    <pre>
      <code>{JSON.stringify(value, null, 2)}</code>
    </pre>
  );
};

/** Renders a single patron debug authentication result. */
const DebugResult: React.FC<DebugResultProps> = ({ result, sequence }) => {
  const statusClass = result.success ? "success" : "failure";
  const panelStyle = result.success ? "success" : "danger";
  const statusText = result.success ? "passed" : "failed";
  const detailId = `detail-${sequence}`;

  const renderDetails = () => {
    if (result.details === null || result.details === undefined) {
      return null;
    }

    if (typeof result.details === "string") {
      const content = (
        <pre className="debug-result-detail">{result.details}</pre>
      );
      if (result.details.includes("\n") || result.details.length > 80) {
        return (
          <Panel
            id={detailId}
            headerText="Details"
            content={content}
            style={panelStyle}
          />
        );
      }
      return content;
    }

    if (
      typeof result.details === "number" ||
      typeof result.details === "boolean"
    ) {
      return (
        <pre className="debug-result-detail">{String(result.details)}</pre>
      );
    }

    if (Array.isArray(result.details)) {
      const content = (
        <ol className="debug-result-list">
          {result.details.map((item, idx) => (
            <li key={idx}>{renderValue(item)}</li>
          ))}
        </ol>
      );
      return (
        <Panel
          id={detailId}
          headerText={`Details (${result.details.length})`}
          content={content}
          style={panelStyle}
        />
      );
    }

    // Record<string, ResultDetails> — render as a key-value table
    const entries = Object.entries(result.details);
    const content = (
      <table className="debug-result-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td className="debug-result-key">{key}</td>
              <td className="debug-result-value">{renderValue(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
    return (
      <Panel
        id={detailId}
        headerText={`Details (${entries.length} fields)`}
        content={content}
        style={panelStyle}
      />
    );
  };

  return (
    <li className={statusClass}>
      <div className="debug-result-header">
        <h4>{result.label}</h4>
        <p className="debug-result-status">
          Status: <strong>{statusText}</strong>
        </p>
      </div>
      {renderDetails()}
    </li>
  );
};

export default DebugResult;
