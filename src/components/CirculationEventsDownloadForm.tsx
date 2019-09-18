import * as React from "react";
import { Modal } from "react-bootstrap";
import { Button, Form, Input } from "library-simplified-reusable-components";
import EditableInput from "./EditableInput";
import * as qs from "qs";

export interface CirculationEventsDownloadFormProps extends React.Props<CirculationEventsDownloadForm> {
  show: boolean;
  hide: () => void;
  library?: string;
}

export interface CirculationEventsDownloadFormState {
  showLocationsInput: boolean;
}

/** Form for downloading CirculationEvents for a particular date. */
export default class CirculationEventsDownloadForm extends React.Component<CirculationEventsDownloadFormProps, CirculationEventsDownloadFormState> {
  private type = React.createRef<HTMLSelectElement>();
  private dateStart = React.createRef<EditableInput>();
  private dateEnd = React.createRef<EditableInput>();
  private locations = React.createRef<EditableInput>();

  constructor(props) {
    super(props);
    this.state = { showLocationsInput: false };

    this.download = this.download.bind(this);
    this.renderForm = this.renderForm.bind(this);
    this.renderInputs = this.renderInputs.bind(this);
    this.getRefValue = this.getRefValue.bind(this);
    this.toggleLocationsInput = this.toggleLocationsInput.bind(this);
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
        <Modal.Body>
          {this.renderForm()}
        </Modal.Body>
        <Modal.Footer>
          <Button className="inverted left-align" callback={this.props.hide} content="Close" />
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
   * Toggle the locations text input whenever "locations" is selected in the dropdown.
   */
  toggleLocationsInput() {
    // select elements get the value from the React ref differently.
    const type = this.type.current && this.type.current.value;
    let showLocationsInput = false;
    if (type === "locations") {
      showLocationsInput = true;
    }
    this.setState({ showLocationsInput });
  }

  /**
   * Render all the inputs for the form. The locations input is conditionally
   * rendered if it is selected in the Event type dropdown.
   */
  renderInputs() {
    const eventTypes = [
      { id: "all", label: "All Events" },
      { id: "locations", label: "Events by Location" },
    ];
    // date inputs require YYYY-MM-DD format
    let today = new Date().toISOString().split("T")[0];

    return (
      <>
        <fieldset>
          <legend className="control-label visuallyHidden">Configuration</legend>
          <label htmlFor="event-select">
            Event Type
            <select
              className="form-control"
              id="event-select"
              ref={this.type}
              name="type"
              onChange={this.toggleLocationsInput}
            >
              {
                eventTypes.map(event =>
                  <option key={`${event.id}-option`} value={event.id} aria-selected={false}>
                    {event.label}
                  </option>
                )
              }
            </select>
          </label>
          {
            this.state.showLocationsInput && (
              <EditableInput
                ref={this.locations}
                className=""
                label="Locations"
                description="Comma-separated list of zip codes to gather events from."
                name="locations"
                id="locations"
                optionalText={false}
                placeholder="10001,10002,10003"
              />
            )
          }
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
    const value = current && current.getValue() || null;
    return value;
  }

  /**
   * Send all the data and get back the report.
   */
  download() {
    const date = this.getRefValue(this.dateStart);
    const dateEnd = this.getRefValue(this.dateEnd);
    const locations = this.getRefValue(this.locations);
    const paramValues = { date, dateEnd, locations };
    let library = "";

    if (this.props.library) {
      library = "/" + this.props.library;
    }

    let url = library + "/admin/bulk_circulation_events";
    let params = qs.stringify(paramValues, { skipNulls: true });

    if (params) {
      url += "?" + params;
    }

    let link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.click();
  }
}
