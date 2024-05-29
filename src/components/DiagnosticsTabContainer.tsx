import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { DiagnosticsData } from "../interfaces";
import { RootState } from "../store";
import DiagnosticsServiceType from "./DiagnosticsServiceType";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { TabContainer, TabContainerProps } from "./TabContainer";

export interface DiagnosticsTabContainerDispatchProps {
  fetchDiagnostics: () => Promise<any>;
}

export interface DiagnosticsTabContainerOwnProps extends TabContainerProps {
  store: Store<RootState>;
  goToTab: (tabName: string) => void;
}

export interface DiagnosticsTabContainerStateProps {
  diagnostics?: DiagnosticsData;
  isLoaded?: boolean;
  fetchError?: FetchErrorData;
}

export interface DiagnosticsTabContainerProps
  extends DiagnosticsTabContainerDispatchProps,
    DiagnosticsTabContainerStateProps,
    DiagnosticsTabContainerOwnProps {}

export class DiagnosticsTabContainer extends TabContainer<
  DiagnosticsTabContainerProps
> {
  DISPLAY_NAMES = {
    coverage_provider: "Coverage Providers",
    monitor: "Monitors",
    script: "Scripts",
    other: "Other",
  };

  UNSAFE_componentWillMount() {
    this.props.fetchDiagnostics();
  }

  handleSelect(event) {
    const tab = event.currentTarget.dataset.tabkey;
    this.props.goToTab(tab);
    if (this.context.router) {
      this.context.router.push("/admin/web/troubleshooting/diagnostics/" + tab);
    }
  }

  tabDisplayName(name) {
    if (this.DISPLAY_NAMES[name]) {
      return this.DISPLAY_NAMES[name];
    } else {
      return super.tabDisplayName(name);
    }
  }

  tabs() {
    const tabs = {};
    const serviceTypes = ["coverage_provider", "monitor", "script", "other"];

    serviceTypes.forEach((serviceType) => {
      let component = null;
      if (this.props.fetchError) {
        component = <ErrorMessage error={this.props.fetchError} />;
      } else if (!this.props.isLoaded) {
        component = <LoadingIndicator />;
      } else if (this.props.diagnostics) {
        component = (
          <DiagnosticsServiceType
            type={serviceType}
            services={this.props.diagnostics[serviceType]}
          />
        );
      }
      tabs[serviceType] = component;
    });

    return tabs;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapStateToProps(state, ownProps: DiagnosticsTabContainerOwnProps) {
  return {
    diagnostics: state.editor.diagnostics && state.editor.diagnostics.data,
    isLoaded: state.editor.diagnostics.isLoaded,
    fetchError: state.editor.diagnostics.fetchError,
  };
}

function mapDispatchToProps(dispatch) {
  const actions = new ActionCreator();
  return {
    fetchDiagnostics: () => dispatch(actions.fetchDiagnostics()),
  };
}

const ConnectedDiagnosticsTabContainer = connect<
  DiagnosticsTabContainerStateProps,
  DiagnosticsTabContainerDispatchProps,
  DiagnosticsTabContainerOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(DiagnosticsTabContainer as any);

export default ConnectedDiagnosticsTabContainer;
