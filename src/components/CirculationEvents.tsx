import * as React from "react";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import ErrorMessage from "./ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { CirculationEventData } from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

export interface CirculationEventsProps {
  store?: Redux.Store;
  events?: CirculationEventData[];
  fetchError?: FetchErrorData;
  fetchCirculationEvents?: () => Promise<any>;
  wait?: number;
  isLoaded?: boolean;
}

export class CirculationEvents extends React.Component<CirculationEventsProps, any> {
  timer: any;

  render(): JSX.Element {
    return(
      <div className="circulationEvents">
        <h3>Circulation Events</h3>

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
              <th>Patron ID</th>
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
                <td>{event.patron_id || "-"}</td>
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
    this.props.fetchCirculationEvents();

    this.timer = setInterval(
      this.props.fetchCirculationEvents,
      (this.props.wait || 10) * 1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timer);
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

const ConnectedCirculationEvents = connect(
  mapStateToProps,
  mapDispatchToProps
)(CirculationEvents);

export default ConnectedCirculationEvents;