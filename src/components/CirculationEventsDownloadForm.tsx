import * as React from "react";
import { Modal } from "react-bootstrap";
import { Button, Form } from "library-simplified-reusable-components";
import EditableInput from "./EditableInput";
import * as qs from "qs";

export interface CirculationEventsDownloadFormProps {
  show: boolean;
  hide: () => void;
  library?: string;
}

/** Form for downloading CirculationEvents for a particular date. */
export default class CirculationEventsDownloadForm extends React.Component<
  CirculationEventsDownloadFormProps
> {
  private dateStart = React.createRef<EditableInput>();
  private dateEnd = React.createRef<EditableInput>();

  constructor(props) {
    super(props);
    this.download = this.download.bind(this);
    this.renderForm = this.renderForm.bind(this);
    this.renderInputs = this.renderInputs.bind(this);
    this.getRefValue = this.getRefValue.bind(this);
  }

  render(): JSX.Element {
    return (
      <Modal
        className="circ-events-download-form"
        show={this.props.show}
        onHide={this.props.hide}
      >
        <Modal.Header>
          <Modal.Title>Download CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.renderForm()}</Modal.Body>
        <Modal.Footer>
          <Button
            className="inverted left-align"
            callback={this.props.hide}
            content="Close"
          />
        </Modal.Footer>
      </Modal>
    );
  }

  /**
   * Renders the main <form> component
   */
  renderForm() {
    return (
      <Form
        onSubmit={this.download}
        buttonContent="Download"
        buttonClass="left-align"
        content={this.renderInputs()}
      />
    );
  }

  /**
   * Render all the inputs for the form. The locations input is conditionally
   * rendered if it is selected in the Event type dropdown.
   */
  renderInputs() {
    const today = new Date().toISOString().split("T")[0];

    return (
      <>
        <fieldset>
          <legend className="control-label visuallyHidden">
            Configuration
          </legend>
          <EditableInput
            ref={this.dateStart}
            name="dateStart"
            label="Start Date"
            type="date"
            value={today}
            className="date-input"
            optionalText={false}
          />
          <EditableInput
            ref={this.dateEnd}
            name="dateEnd"
            label="End Date"
            type="date"
            value={today}
            className="date-input"
            optionalText={false}
          />
        </fieldset>
      </>
    );
  }

  /**
   * Simple way to get the value of a EditableInput ref.
   */
  getRefValue(ref: React.RefObject<EditableInput>) {
    const current = ref.current || null;
    return (current && current.getValue()) || null;
  }

  /**
   * Send all the data and get back the report.
   */
  download() {
    const date = this.getRefValue(this.dateStart);
    const dateEnd = this.getRefValue(this.dateEnd);
    const paramValues = { date, dateEnd };
    let library = "";

    if (this.props.library) {
      library = "/" + this.props.library;
    }

    let url = library + "/admin/bulk_circulation_events";
    const params = qs.stringify(paramValues, { skipNulls: true });

    if (params) {
      url += "?" + params;
    }

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
