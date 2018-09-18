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

export interface CirculationEventsStateProps {
  events?: CirculationEventData[];
  fetchError?: FetchErrorData;
  isLoaded?: boolean;
}

export interface CirculationEventsDispatchProps {
  fetchCirculationEvents?: () => Promise<any>;
}

export interface CirculationEventsOwnProps {
  store?: Store<State>;
  wait?: number;
}

export interface CirculationEventsProps extends CirculationEventsStateProps, CirculationEventsDispatchProps, CirculationEventsOwnProps {}

export interface CirculationEventsState {
  showDownloadForm: boolean;
}

/** Shows a continuously updating list of the most recent circulation events, and
    a button to download a CSV of circulation events for a particular date. */
export class CirculationEvents extends React.Component<CirculationEventsProps, CirculationEventsState> {
  timer: any;
  context: { showCircEventsDownload: boolean };
  _isMounted: boolean;

  constructor(props) {
    super(props);
    this.state = { showDownloadForm: false };
    this.showDownloadForm = this.showDownloadForm.bind(this);
    this.hideDownloadForm = this.hideDownloadForm.bind(this);
    this.fetchAndQueue = this.fetchAndQueue.bind(this);
    this._isMounted = false;
  }

  static contextTypes: React.ValidationMap<any> = {
    showCircEventsDownload: React.PropTypes.bool
  };

  render(): JSX.Element {
    return(
      <div className="circulation-events">
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
    this._isMounted = true;
    this.fetchAndQueue();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    this._isMounted = false;
  }

  fetchAndQueue(): Promise<any> {
    return this.props.fetchCirculationEvents().then(() => {
      if (this._isMounted) {
        this.timer = setTimeout(
          this.fetchAndQueue,
          (this.props.wait || 10) * 1000
        );
      }
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

const ConnectedCirculationEvents = connect<CirculationEventsStateProps, CirculationEventsDispatchProps, CirculationEventsOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(CirculationEvents);

export default ConnectedCirculationEvents;
