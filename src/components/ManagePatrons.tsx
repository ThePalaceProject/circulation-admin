import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { PatronData } from "../interfaces";
import ButtonForm from "./ButtonForm";
import EditableInput from "./EditableInput";
import ErrorMessage from "./ErrorMessage";
import { Alert } from "react-bootstrap";
import ManagePatronsForm from "./ManagePatronsForm";
import PatronActionsList from "./PatronActionsList";
import Header from "./Header";

export interface ManagePatronsProps extends React.Props<ManagePatronsProps> {
  params: {
    library?: string;
  };
}

export interface ManagePatronsContext {
  editorStore: Store<State>;
  csrfToken: string;
}

export interface ManagePatronsState {
  patron: PatronData;
}

export class ManagePatrons extends React.Component<ManagePatronsProps, ManagePatronsState> {
  context: ManagePatronsContext;

  static contextTypes: React.ValidationMap<ManagePatronsContext> = {
    editorStore: React.PropTypes.object.isRequired,
    csrfToken: React.PropTypes.string.isRequired,
  };

  static childContextTypes: React.ValidationMap<void> = {
    library: React.PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = { patron: null };

    this.patronInfo = this.patronInfo.bind(this);
  }

  getChildContext() {
    return {
      library: () => this.props.params.library
    };
  }

  render() {
    return (
      <div>
        <Header />
        <div className="manage-patrons">
          <h2>Manage Patrons</h2>
          <ManagePatronsForm
            store={this.context.editorStore}
            csrfToken={this.context.csrfToken}
            patronInfo={this.patronInfo}
          />
          { this.state.patron &&
            <section>
              <ul>
                <h3>Patron Information</h3>
                { this.state.patron.username &&
                  <li>Username: {this.state.patron.username}</li>
                }
                { this.state.patron.personal_name &&
                  <li>Personal Name: {this.state.patron.personal_name}</li>
                }
                { this.state.patron.email_address &&
                  <li>Email Address: {this.state.patron.email_address}</li>
                }
                <li>Identifier: {this.state.patron.authorization_identifier}</li>
              </ul>
              <PatronActionsList
                store={this.context.editorStore}
                csrfToken={this.context.csrfToken}
                patron={this.state.patron}
              />
            </section>
          }
        </div>

      </div>
    );
  }

  patronInfo(patron: PatronData) {
    this.setState({ patron });
  }
}

export default ManagePatrons;
