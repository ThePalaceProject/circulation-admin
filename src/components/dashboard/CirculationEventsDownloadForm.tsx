import * as React from "react";
import { Dialog } from "../ui/dialog";
import { Button, Form } from "../ui";
import EditableInput from "../shared/EditableInput";
import * as qs from "qs";

export interface CirculationEventsDownloadFormProps {
  show: boolean;
  hide: () => void;
  library?: string;
}

/** Form for downloading CirculationEvents for a given date range. */
const CirculationEventsDownloadForm = ({
  show,
  hide,
  library,
}: CirculationEventsDownloadFormProps) => {
  const dateStartRef = React.useRef<EditableInput>(null);
  const dateEndRef = React.useRef<EditableInput>(null);

  const getRefValue = (ref: React.RefObject<EditableInput>) => {
    const current = ref.current || null;
    return (current && current.getValue()) || null;
  };

  const download = () => {
    const date = getRefValue(dateStartRef);
    const dateEnd = getRefValue(dateEndRef);
    const paramValues = { date, dateEnd };
    const currentLibraryPath = library ? `/${library}` : "";

    const params = qs.stringify(paramValues, { skipNulls: true });
    const url = `${currentLibraryPath}/admin/bulk_circulation_events${
      params ? "?" + params : ""
    }`;

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderInputs = () => {
    const today = new Date().toISOString().split("T")[0];

    return (
      <fieldset>
        <legend className="visuallyHidden">Configuration</legend>
        <EditableInput
          ref={dateStartRef}
          name="dateStart"
          label="Start Date"
          type="date"
          value={today}
          className="date-input"
          optionalText={false}
        />
        <EditableInput
          ref={dateEndRef}
          name="dateEnd"
          label="End Date"
          type="date"
          value={today}
          className="date-input"
          optionalText={false}
        />
      </fieldset>
    );
  };

  const renderForm = () => {
    return (
      <Form
        onSubmit={download}
        buttonContent="Download"
        buttonClass="left-align"
        content={renderInputs()}
      />
    );
  };

  return (
    <Dialog className="circ-events-download-form" show={show} onHide={hide}>
      <Dialog.Header closeButton onHide={hide}>
        <Dialog.Title>Download CSV</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>{renderForm()}</Dialog.Body>
      <Dialog.Footer>
        <Button
          className="inverted left-align"
          callback={hide}
          content="Close"
        />
      </Dialog.Footer>
    </Dialog>
  );
};

export default CirculationEventsDownloadForm;
