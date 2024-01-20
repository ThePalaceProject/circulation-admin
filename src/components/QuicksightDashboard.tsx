import * as React from "react";
import { DashboardURIData, LibrariesData, LibraryData } from "../interfaces";
import { Store } from "redux";
import { RootState } from "../store";
import { connect } from "react-redux";
import ActionCreator from "../actions";

export interface QuicksightDashboardStateProps {
  isFetchingLibraries?: boolean;
  libraries?: LibraryData[];
}

export interface QuicksightDashboardDispatchProps {
  fetchLibraries?: () => Promise<LibrariesData>;
  fetchQuicksightEmbedUrl?: (
    dashboardId: string,
    ld: LibrariesData
  ) => Promise<DashboardURIData>;
}

export interface QuicksightDashboardOwnProps {
  store?: Store<RootState>;
  dashboardId?: string;
}

export interface QuicksightDashboardProps
  extends QuicksightDashboardStateProps,
    QuicksightDashboardDispatchProps,
    QuicksightDashboardOwnProps {}

export interface QuicksightDashboardState {
  embedUrl: string;
}

class QuicksightDashboard extends React.Component<
  QuicksightDashboardProps,
  QuicksightDashboardState
> {
  constructor(props) {
    super(props);
    this.state = { embedUrl: null };
  }
  componentDidMount() {
    if (this.state.embedUrl) {
      return;
    }

    const dashboardId = this.props.dashboardId;
    this.props.fetchLibraries().then((libs) => {
      try {
        this.props
          .fetchQuicksightEmbedUrl(dashboardId, libs)
          .then((data) => this.setState({ embedUrl: data.embedUrl }))
          .catch((error) => {
            console.error(error);
          });
      } catch (e) {
        console.log(e);
      }
    });
  }

  render(): JSX.Element {
    return (
      <iframe
        title="Quicksight Dashboard"
        height="1200"
        width="100%"
        src={this.state.embedUrl}
      />
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isFetchingLibraries: state.editor.libraries?.isFetching,
    libraries: state.editor.libraries?.data?.libraries,
  };
}

function mapDispatchToProps(dispatch) {
  const actions = new ActionCreator();
  return {
    fetchLibraries: () => dispatch(actions.fetchLibraries()),
    fetchQuicksightEmbedUrl: (
      dashboardId: string,
      librariesData: LibrariesData
    ) => dispatch(actions.fetchQuicksightEmbedUri(dashboardId, librariesData)),
  };
}

const ConnectedQuicksightDashboard = connect<
  QuicksightDashboardStateProps,
  QuicksightDashboardDispatchProps,
  QuicksightDashboardOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(QuicksightDashboard);
export default ConnectedQuicksightDashboard;
