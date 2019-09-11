import * as React from "react";
import { Modal } from "react-bootstrap";
import { Button, Form, Input } from "library-simplified-reusable-components";
import EditableInput from "./EditableInput";
import * as qs from "qs";

export interface CirculationEventsDownloadFormProps extends React.Props<CirculationEventsDownloadForm> {
  show: boolean;
  hide: () => void;
}

/** Form for downloading CirculationEvents for a particular date. */
export default class CirculationEventsDownloadForm extends React.Component<CirculationEventsDownloadFormProps, {}> {
  private dateStart = React.createRef<Input>();
  private dateEnd = React.createRef<Input>();

  constructor(props) {
    super(props);
    this.download = this.download.bind(this);
  }

  render(): JSX.Element {
    // date inputs require YYYY-MM-DD format
    let today = new Date().toISOString().split("T")[0];
    const t = (<>
      <fieldset>
        <legend className="control-label">Configuration</legend>
        <EditableInput
          elementType="select"
          ref="type"
          name="type"
          label="Event type"
          placeholder=""
        >
          <option value="all" aria-selected={false}>All Events</option>
          <option value="location" aria-selected={false}>Events by Location</option>
        </EditableInput>
        <Input className="date-input" label="test"
          name="dateStart" id="dateStart" value={today}
          ref={this.dateStart} type="date" />
        <Input className=""
          label="Locations (comma separated list)" name="locations" id="locations" />
      </fieldset>
      </>);

    return (
      <Modal
        className="circ-events-download-form"
        show={this.props.show}
        onHide={this.props.hide}>
        <Modal.Header>
          <Modal.Title>Download CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={this.download}
            buttonContent="Download"
            buttonClass="left-align"
            content={t}
          />
        {/* <Button callback={this.download} content="download" /> */}
        </Modal.Body>
        <Modal.Footer>
          <Button className="inverted left-align" callback={this.props.hide} content="Close" />
        </Modal.Footer>
      </Modal>
    );
  }

  download() {
    // let date = (this.refs as any).dateStart.value || null;
    // let dateEnd = (this.refs as any).dateEnd.value || null;
    const dateStartRef = this.dateStart.current || null;
    console.log((this.dateStart.current).getValue());
    const date = dateStartRef && dateStartRef.getValue() || null;
    // const dateEndRef = this.dateEnd.current || null;
    // const dateEnd = dateEndRef && dateEndRef.getValue() || null;
    console.log(date);
    let url = "/admin/bulk_circulation_events";
    let params = qs.stringify({ date }, { skipNulls: true });

    if (params) {
      url += "?" + params;
    }

    // let link = document.createElement("a");
    // link.href = url;
    // link.target = "_blank";
    // link.click();
  }
}
