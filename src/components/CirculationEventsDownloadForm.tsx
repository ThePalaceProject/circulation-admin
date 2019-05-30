import * as React from "react";
import { Modal } from "react-bootstrap";
import { Button } from "library-simplified-reusable-components";
import * as qs from "qs";

export interface CirculationEventsDownloadFormProps extends React.Props<CirculationEventsDownloadForm> {
  show: boolean;
  hide: () => void;
}

/** Form for downloading CirculationEvents for a particular date. */
export default class CirculationEventsDownloadForm extends React.Component<CirculationEventsDownloadFormProps, {}> {
  constructor(props) {
    super(props);
    this.download = this.download.bind(this);
  }

  render(): JSX.Element {
    // date inputs require YYYY-MM-DD format
    let today = new Date().toISOString().split("T")[0];

    return (
      <Modal
        className="circ-events-download-form"
        show={this.props.show}
        onHide={this.props.hide}>
        <Modal.Header>
          <Modal.Title>Download CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label className="conrol-label">Date</label>
            <input
              className="form-control"
              type="date"
              ref="date"
              defaultValue={today} />
          </div>
          <Button callback={this.download} content="Download" className="left-align"/>
        </Modal.Body>
        <Modal.Footer>
          <Button className="inverted left-align" callback={this.props.hide} content="Close" />
        </Modal.Footer>
      </Modal>
    );
  }

  download() {
    let date = (this.refs as any).date.value || null;
    let url = "/admin/bulk_circulation_events";
    let params = qs.stringify({ date }, { skipNulls: true });

    if (params) {
      url += "?" + params;
    }

    let link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.click();
  }
}
