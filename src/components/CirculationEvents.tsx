import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import ErrorMessage from "./ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import CirculationEventsDownloadForm from "./CirculationEventsDownloadForm";
import { CirculationEventData } from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { State } from "../reducers/index";

export interface CirculationEventsProps {
  store?: Store<State>;
  events?: CirculationEventData[];
  fetchError?: FetchErrorData;
  fetchCirculationEvents?: () => Promise<any>;
  wait?: number;
  isLoaded?: boolean;
}

export class CirculationEvents extends React.Component<CirculationEventsProps, any> {
  timer: any;
  context: { showCircEventsDownload: boolean };

  constructor(props) {
    super(props);
    this.state = { showDownloadForm: false };
    this.showDownloadForm = this.showDownloadForm.bind(this);
    this.hideDownloadForm = this.hideDownloadForm.bind(this);
    this.fetchAndQueue = this.fetchAndQueue.bind(this);
  }

  static contextTypes: React.ValidationMap<any> = {
    showCircEventsDownload: React.PropTypes.bool
  };

  render(): JSX.Element {
    return(
      <div className="circulationEvents">
        <h3>Circulation Events</h3>

        { this.context.showCircEventsDownload &&
            <button
              className="btn btn-default"
              onClick={this.showDownloadForm}>
              Download CSV
            </button>
        }

        <CirculationEventsDownloadForm
          show={this.state.showDownloadForm}
          hide={this.hideDownloadForm}
          />

        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} />
        }

        { !this.props.isLoaded &&
          <LoadingIndicator />
        }

        <table className="table table-striped">
          <thead>
            <tr>
              <th>Book</th>
              <th>Event</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            { this.props.events.map(event =>
              <tr key={event.id}>
                <td>
                  <CatalogLink bookUrl={event.book.url}>
                    {event.book.title}
                  </CatalogLink>
                </td>
                <td>{this.formatType(event.type)}</td>
                <td>{this.formatTime(event.time)}</td>
              </tr>
            ) }
          </tbody>
        </table>
      </div>
    );
  }

  componentWillMount() {
    this.fetchAndQueue();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  fetchAndQueue() {
    return this.props.fetchCirculationEvents().then(() => {
      this.timer = setTimeout(
        this.fetchAndQueue,
        (this.props.wait || 10) * 1000
      );
    });
  }

  formatType(str) {
    return str.replace("_", " ");
  }

  formatTime(str) {
    let date = new Date(str);
    let options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    };
    return date.toLocaleString("en-US", options);
  }

  showDownloadForm() {
    this.setState({ showDownloadForm: true });
  }

  hideDownloadForm() {
    this.setState({ showDownloadForm: false });
  }
}

function mapStateToProps(state, ownProps) {
  return {
    events: state.editor.circulationEvents.data || [],
    fetchError: state.editor.circulationEvents.fetchError,
    isLoaded: state.editor.circulationEvents.isLoaded
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchCirculationEvents: () => dispatch(actions.fetchCirculationEvents())
  };
}

const ConnectedCirculationEvents = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(CirculationEvents);

export default ConnectedCirculationEvents;