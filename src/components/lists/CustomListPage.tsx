// HOC PATTERN: This component is wrapped with withAppContext() at export
// to inject [editorStore, csrfToken] as props, replacing legacy contextTypes.
// The library fn is provided via LibraryContext in step 6.
import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import Header from "../layout/Header";
import CustomLists from "./CustomLists";
import { RootState } from "../../store";
import { withAppContext } from "../../utils/withAppContext";
import { LibraryContext } from "../../context/LibraryContext";

export interface CustomListPageProps extends React.Props<CustomListPageProps> {
  params: {
    library?: string;
    editOrCreate?: string;
    identifier?: string;
  };
  location?: { [key: string]: string | { [key: string]: string } };
  editorStore?: Store<RootState>;
  csrfToken?: string;
}

/** Page that shows all lists for a library and allows creating and editing lists. */
export class CustomListPage extends React.Component<CustomListPageProps> {
  render(): JSX.Element {
    let startingTitle;
    if (this.props.location && this.props.location.state) {
      startingTitle = (this.props.location.state as any).bookTitle;
    }
    return (
      <LibraryContext.Provider value={() => this.props.params.library}>
        <div className="custom-list-page">
          <Header />
          <CustomLists
            library={this.props.params.library}
            editOrCreate={this.props.params.editOrCreate}
            identifier={this.props.params.identifier}
            store={this.props.editorStore}
            csrfToken={this.props.csrfToken}
            startingTitle={startingTitle}
          />
        </div>
      </LibraryContext.Provider>
    );
  }
}

export default withAppContext(CustomListPage);
