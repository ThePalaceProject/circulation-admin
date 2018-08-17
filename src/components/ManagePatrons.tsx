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
      <div className="manage-patrons-page">
        <Header />
        <h2>Manage Patrons</h2>
        <div className="manage-patrons">
          <ManagePatronsForm
            store={this.context.editorStore}
            csrfToken={this.context.csrfToken}
            patronInfo={this.patronInfo}
          />
          { this.state.patron &&
            <section className="patron-info">
              <ul className="patron-data-list">
                { this.state.patron.username &&
                  <li><label>Username</label><p>{this.state.patron.username}</p></li>
                }
                { this.state.patron.personal_name &&
                  <li><label>Personal Name</label><p>{this.state.patron.personal_name}</p></li>
                }
                { this.state.patron.email_address &&
                  <li><label>Email Address</label><p>{this.state.patron.email_address}</p></li>
                }
                <li><label>Identifier</label><p>{this.state.patron.authorization_identifier}</p></li>
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
