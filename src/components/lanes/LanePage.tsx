// HOC PATTERN: This component is wrapped with withAppContext() at export
// to inject [editorStore, csrfToken] as props, replacing legacy contextTypes.
// The library fn is provided via LibraryContext in step 6.
import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import Header from "../layout/Header";
import Lanes from "./Lanes";
import { RootState } from "../../store";
import { withAppContext } from "../../utils/withAppContext";
import { LibraryContext } from "../../context/LibraryContext";

export interface LanePageProps extends React.Props<LanePageProps> {
  params: {
    library?: string;
    editOrCreate?: string;
    identifier?: string;
  };
  editorStore?: Store<RootState>;
  csrfToken?: string;
}

export class LanePage extends React.Component<LanePageProps> {
  render(): JSX.Element {
    return (
      <LibraryContext.Provider value={() => this.props.params.library}>
        <div className="lane-page">
          <Header />
          <Lanes
            library={this.props.params.library}
            editOrCreate={this.props.params.editOrCreate}
            identifier={this.props.params.identifier}
            store={this.props.editorStore}
            csrfToken={this.props.csrfToken}
          />
        </div>
      </LibraryContext.Provider>
    );
  }
}

export default withAppContext(LanePage);
