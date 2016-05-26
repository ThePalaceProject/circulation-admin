import * as React from "react";
import { connect } from "react-redux";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";
import CirculationEvent from "./CirculationEvent";

export class CirculationEvents extends React.Component<any, any> {
  render(): JSX.Element {
    return(
      <div className="circulationEvents">
        <h3>Circulation Events</h3>
        { this.props.events.map(event =>
          <CirculationEvent event={event} />
        ) }
      </div>
    );
  }

  componentWillMount() {
    this.props.fetchCirculationEvents("/admin/circulation_events");
  }
}

function mapStateToProps(state, ownProps) {
  return {
    events: state.editor.circulationEvents.data,
    isFetching: state.editor.circulationEvents.isFetching,
    fetchError: state.editor.circulationEvents.fetchError
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher();
  let actions = new ActionCreator(fetcher);
  return {
    fetchCirculationEvents: (url) => dispatch(actions.fetchCirculationEvents(url))
  };
}

const ConnectedCirculationEvents = connect(
  mapStateToProps,
  mapDispatchToProps
)(CirculationEvents);

export default ConnectedCirculationEvents;