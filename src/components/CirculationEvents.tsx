import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import ErrorMessage from "./ErrorMessage";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import CatalogLink from "@thepalaceproject/web-opds-client/lib/components/CatalogLink";
import * as PropTypes from "prop-types";
import CirculationEventsDownloadForm from "./CirculationEventsDownloadForm";
import { CirculationEventData } from "../interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { RootState } from "../store";
import { Button } from "library-simplified-reusable-components";

export interface CirculationEventsStateProps {
  events?: CirculationEventData[];
  fetchError?: FetchErrorData;
  isLoaded?: boolean;
}

export interface CirculationEventsDispatchProps {
  fetchCirculationEvents?: () => Promise<any>;
}

export interface CirculationEventsOwnProps {
  store?: Store<RootState>;
  wait?: number;
  library?: string;
}

export interface CirculationEventsProps
  extends CirculationEventsStateProps,
    CirculationEventsDispatchProps,
    CirculationEventsOwnProps {}

export interface CirculationEventsState {
  showDownloadForm: boolean;
}

/** Shows a continuously updating list of the most recent circulation events, and
    a button to download a CSV of circulation events for a particular date. */
export class CirculationEvents extends React.Component<
  CirculationEventsProps,
  CirculationEventsState
> {
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
    showCircEventsDownload: PropTypes.bool,
  };

  render(): JSX.Element {
    const { library, fetchError, isLoaded, events } = this.props;
    return (
      <div className="circulation-events">
        <h2>Circulation Events</h2>

        {this.context.showCircEventsDownload && (
          <Button
            callback={this.showDownloadForm}
            content="Download CSV"
            className="left-align"
          />
        )}

        <CirculationEventsDownloadForm
          show={this.state.showDownloadForm}
          hide={this.hideDownloadForm}
          library={library}
        />

        {fetchError && <ErrorMessage error={fetchError} />}

        {!isLoaded && !library && <LoadingIndicator />}

        {!library && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Book</th>
                <th>Event</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <CatalogLink bookUrl={event.book.url}>
                      {event.book.title}
                    </CatalogLink>
                  </td>
                  <td>{this.formatType(event.type)}</td>
                  <td>{this.formatTime(event.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  UNSAFE_componentWillMount() {
    this._isMounted = true;
    if (!this.props.library) {
      this.fetchAndQueue();
    }
  }

  componentWillUnmount() {
    if (!this.props.library) {
      clearTimeout(this.timer);
    }
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
    const date = new Date(str);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
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
    isLoaded: state.editor.circulationEvents.isLoaded,
  };
}

function mapDispatchToProps(dispatch) {
  const actions = new ActionCreator();
  return {
    fetchCirculationEvents: () => dispatch(actions.fetchCirculationEvents()),
  };
}

const ConnectedCirculationEvents = connect<
  CirculationEventsStateProps,
  CirculationEventsDispatchProps,
  CirculationEventsOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(CirculationEvents);

export default ConnectedCirculationEvents;
