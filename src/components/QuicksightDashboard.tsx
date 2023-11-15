import * as React from "react";
import ActionCreator from "../actions";

export interface QuicksightDashboardStateProps {
}

export interface QuicksightDashboardDispatchProps {
  fetchDashboardUri?: () => Promise<any>;
}

export interface QuicksightDashboardProps
    extends QuicksightDashboardStateProps,QuicksightDashboardDispatchProps {}

export interface QuicksightDashboardState {
   dashboardId: string
}



export class QuicksightDashboard extends React.Component <
    QuicksightDashboardProps,
    QuicksightDashboardState
>{
  context: { dashboardId: boolean}

  constructor(props) {
    super(props);
    this.state = {dashboardId: "library"}
  }
  render(): JSX.Element {
    return (
      <div className="quicksight-dashboard">
        <h2>Quicksight Dashboard</h2>
        <iframe src="https://www.amazon.com" height="800" width="1000"/>
      </div>
    );
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
    fetchDashboardUri: () => dispatch(actions.fetchDashboardUri(dispatch.dashboardId)),
  };
}

export default QuicksightDashboard;
