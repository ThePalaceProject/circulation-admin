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
  error: string | null;
}

class QuicksightDashboard extends React.Component<
  QuicksightDashboardProps,
  QuicksightDashboardState
> {
  constructor(props) {
    super(props);
    this.state = { embedUrl: null, error: null };
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
    this.props
      .fetchLibraries()
      .then((result) => {
        const libs = (result as any).data as LibrariesData;
        if (!libs?.libraries?.length) {
          this.setState({
            error: "Unable to load library data for dashboard.",
          });
          return;
        }
        return this.props
          .fetchQuicksightEmbedUrl(this.props.dashboardId, libs)
          .then((data) => {
            if (data?.embedUrl) {
              this.setState({ embedUrl: data.embedUrl });
            } else {
              this.setState({
                error: "Dashboard URL was not returned by the server.",
              });
            }
          });
      })
      .catch((error) => {
        console.error("QuicksightDashboard: failed to load embed URL", error);
        this.setState({
          error: "An error occurred while loading the dashboard.",
        });
      });
  }

  render(): JSX.Element {
    const { embedUrl, error } = this.state;
    if (error) {
      return (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      );
    }
    return (
      <iframe
        title="Library Dashboard"
        height="1200"
        width="100%"
        src={embedUrl}
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
      if (!librariesData?.libraries) {
        throw new Error("No library data available.");
      }
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
