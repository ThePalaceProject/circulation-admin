import * as React from "react";
import { AppContext, AppContextType } from "../context/appContext";
import * as PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";
import CustomLists from "./CustomLists";

export interface CustomListPageProps {
  params: {
    library?: string;
    editOrCreate?: string;
    identifier?: string;
  };
  location?: { [key: string]: string | { [key: string]: string } };
}

/** Page that shows all lists for a library and allows creating and editing lists. */
export default class CustomListPage extends React.Component<CustomListPageProps> {
  static contextType = AppContext;
  declare context: AppContextType;

  static childContextTypes: React.ValidationMap<any> = {
    library: PropTypes.func,
  };

  getChildContext() {
    return {
      library: () => this.props.params.library,
    };
  }

  render(): JSX.Element {
    let startingTitle;
    if (this.props.location && this.props.location.state) {
      startingTitle = (this.props.location.state as any).bookTitle;
    }
    return (
      <div className="custom-list-page">
        <Header />
        <CustomLists
          library={this.props.params.library}
          editOrCreate={this.props.params.editOrCreate}
          identifier={this.props.params.identifier}
          csrfToken={this.context.csrfToken}
          startingTitle={startingTitle}
        />
        <Footer />
      </div>
    );
  }
}
