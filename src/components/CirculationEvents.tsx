import * as React from "react";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import * as moment from "moment";

export class CirculationEvents extends React.Component<any, any> {
  timer: any;

  render(): JSX.Element {
    return(
      <div className="circulationEvents">
        <h3>Circulation Events</h3>
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
                <td>{this.formatDate(event.time)}</td>
              </tr>
            ) }
          </tbody>
        </table>
      </div>
    );
  }

  componentWillMount() {
    this.props.fetchCirculationEvents("/admin/circulation_events");

    let oneMinute = 10000;
    this.timer = setInterval(() => {
      this.props.fetchCirculationEvents("/admin/circulation_events");
    }, oneMinute);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  formatType(str) {
    return str.replace("_", " ");
  }

  formatDate(str) {
    return moment(str).format("MMM DD h:mm a");
  }
}

function mapStateToProps(state, ownProps) {
  return {
    events: state.editor.circulationEvents.data || [],
    isFetching: state.editor.circulationEvents.isFetching,
    fetchError: state.editor.circulationEvents.fetchError
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchCirculationEvents: (url) => dispatch(actions.fetchCirculationEvents(url))
  };
}

const ConnectedCirculationEvents = connect(
  mapStateToProps,
  mapDispatchToProps
)(CirculationEvents);

export default ConnectedCirculationEvents;