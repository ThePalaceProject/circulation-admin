import * as React from "react";
import { Store } from "redux";
import Header from "./Header";
import CustomLists from "./CustomLists";
import { State } from "../reducers/index";

export interface CustomListPageProps extends React.Props<CustomListPageProps> {
  params: {
    library?: string;
    editOrCreate?: string;
    identifier?: string;
  };
}

export interface CustomListPageContext {
  editorStore: Store<State>;
  csrfToken: string;
}

/** Page that shows all lists for a library and allows creating and editing lists. */
export default class CustomListPage extends React.Component<CustomListPageProps, CustomListPageContext> {
  context: CustomListPageContext;

  static contextTypes: React.ValidationMap<CustomListPageContext> = {
    editorStore: React.PropTypes.object.isRequired,
    csrfToken: React.PropTypes.string.isRequired
  };

  static childContextTypes: React.ValidationMap<any> = {
    library: React.PropTypes.func
  };

  getChildContext() {
    return {
      library: () => this.props.params.library
    };
  }

  render(): JSX.Element {
    return (
      <div className="custom-list-page">
        <Header />
        <CustomLists
          library={this.props.params.library}
          editOrCreate={this.props.params.editOrCreate}
          identifier={this.props.params.identifier}
          store={this.context.editorStore}
          csrfToken={this.context.csrfToken}
          />
      </div>
    );
  }
}
