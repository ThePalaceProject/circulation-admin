import * as React from "react";
import { Modal } from "react-bootstrap";
import * as qs from "qs";

export interface CirculationEventsDownloadFormProps extends React.Props<CirculationEventsDownloadForm> {
  show: boolean;
  hide: () => void;
}

export default class CirculationEventsDownloadForm extends React.Component<CirculationEventsDownloadFormProps, any> {
  constructor(props) {
    super(props);
    this.download = this.download.bind(this);
  }

  render(): JSX.Element {
    return (
      <Modal
        className="circEventsDownloadForm"
        show={this.props.show}
        onHide={this.props.hide}>
        <Modal.Header>
          <Modal.Title>Download CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group" style={{ width: "160px" }}>
            <label className="conrol-label">Start Date</label>
            <input className="form-control" type="date" name="start" ref="start" />
          </div>
          <div className="form-group" style={{ width: "160px" }}>
            <label className="conrol-label">End Date</label>
            <input className="form-control" type="date" name="end" ref="end" />
          </div>
          <button className="btn btn-primary" onClick={this.download}>
            Download
          </button>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-default" onClick={this.props.hide}>Close</button>
        </Modal.Footer>
      </Modal>
    );
  }

  download() {
    let start = (this.refs as any).start.value || null;
    let end = (this.refs as any).end.value || null;
    let url = "/admin/bulk_circulation_events";
    let params = qs.stringify({ start, end }, { skipNulls: true });

    if (params) {
      url += "?" + params;
    }

    let link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.click();

    console.log("downloading!");
  }
}