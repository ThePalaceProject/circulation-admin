import * as React from "react";
import { LibrariesData, LibraryData } from "../interfaces";
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

export class QuicksightDashboard extends React.Component<
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

    this.props.fetchLibraries().then((libs) => {
      const library_uuids: string = libs.libraries.map((l) => l.uuid).join(",");
      let library_uuids_key_pair = "library_uuids=" + library_uuids;
      // TODO Remove next line once https://github.com/ThePalaceProject/circulation/pull/1548
      // is merged
      library_uuids_key_pair = "libraryIds=1";
      try {
        fetch(
          "/admin/quicksight_embed/" +
            this.props.dashboardId +
            "?" +
            library_uuids_key_pair
        )
          .then((response) => response.json())
          .then((data) => this.setState({ embedUrl: data["embedUrl"] }))
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
      <div className="quicksight-dashboard">
        <h2>Quicksight Dashboard</h2>
        <iframe
          title="Quicksight Dashboard"
          height="900"
          width="1200"
          src={this.state.embedUrl}
        />
      </div>
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
