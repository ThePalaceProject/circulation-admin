import * as React from "react";
import {
  QuickSightEmbeddedURLData,
  LibrariesData,
  LibraryData,
} from "../../interfaces";
import { Store } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { connect } from "react-redux";
import {
  configServicesApi,
  isResultFetching,
} from "../../features/configServices/configServicesSlice";
import { quicksightApi } from "../../features/quicksight/quicksightSlice";

export interface QuicksightDashboardStateProps {
  isFetchingLibraries?: boolean;
  libraries?: LibraryData[];
}

export interface QuicksightDashboardDispatchProps {
  fetchLibraries?: () => Promise<LibrariesData>;
  fetchQuicksightEmbedUrl?: (
    dashboardId: string,
    ld: LibrariesData
  ) => Promise<QuickSightEmbeddedURLData>;
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
    // Every time the component is mounted a fresh embed url must be fetched.
    // TODO:  For whatever reason, the "this.props.libraries" variable was not being
    // set when I tried to put this logic in the render method (nor did it work trying to access it in this method).
    // Clearly I am missing something. Also the embed url should be set via the action/reducer pattern,
    // but again I wasn't able to get things working following the pattern in Header.tsx so this is where I landed.
    // It's ugly but it works.
    // Nevertheless it should be brought into alignment before it goes into production.
    this.props.fetchLibraries().then((result) => {
      try {
        const libs = (result as any).data as LibrariesData;
        this.props
          .fetchQuicksightEmbedUrl(this.props.dashboardId, libs)
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
        title="Library Dashboard"
        height="1200"
        width="100%"
        src={this.state.embedUrl}
      />
    );
  }
}

function mapStateToProps(state, _ownProps) {
  const librariesResult = configServicesApi.endpoints.getLibraries.select()(
    state
  );
  return {
    isFetchingLibraries: isResultFetching(librariesResult),
    libraries: librariesResult.data?.libraries,
  };
}

function mapDispatchToProps(dispatch: any) {
  return {
    fetchLibraries: () =>
      dispatch(configServicesApi.endpoints.getLibraries.initiate(undefined)),
    fetchQuicksightEmbedUrl: async (
      dashboardId: string,
      librariesData: LibrariesData
    ): Promise<QuickSightEmbeddedURLData> => {
      let library_uuids = "";
      if (librariesData.libraries.length < 100) {
        library_uuids = `?libraryUuids=${librariesData.libraries
          .map((l) => l.uuid)
          .join(",")}`;
      }
      const url = `/admin/quicksight_embed/${dashboardId}${library_uuids}`;
      const result = await dispatch(
        quicksightApi.endpoints.getQuicksightEmbedUrl.initiate(url)
      );
      if ("error" in result) throw result.error;
      return result.data;
    },
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
