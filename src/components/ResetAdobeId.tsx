import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { PatronData } from "../interfaces";
import { Alert } from "react-bootstrap";
import EditableInput from "./EditableInput";

export interface PatronError {
  status: boolean;
  message: string;
}

export interface PatronActionsListStateProps {
  isFetching?: boolean;
}

export interface PatronResponse {
  text: PatronData;
  response: IResponse;
}

export interface PatronActionsListDispatchProps {
  resetAdobeId?: (data: FormData) => Promise<PatronResponse>;
}

export interface PatronActionsListOwnProps {
  store?: Store<State>;
  csrfToken?: string;
  patron: PatronData;
}

export interface PatronActionsListProps extends React.Props<PatronActionsListProps>, PatronActionsListStateProps, PatronActionsListDispatchProps, PatronActionsListOwnProps {}

export interface PatronActionsListState {
  error: FetchErrorData;
  success: boolean;
  checked: boolean;
}

export class ResetAdobeId extends React.Component<PatronActionsListProps, PatronActionsListState> {
  constructor(props) {
    super(props);
    this.state = {
      error: { status: 200, response: "", url: "" },
      success: false,
      checked: false,
    };
    this.resetAdobeId = this.resetAdobeId.bind(this);
    this.verifiedToReset = this.verifiedToReset.bind(this);
  }

  async resetAdobeId(e) {
    e.preventDefault();
    const data = new (window as any).FormData();
    data.append("identifier", this.props.patron.authorization_identifier);

    try {
      const response = await this.props.resetAdobeId(data);
      this.setState({
        success: true,
        error: { status: 200, response: "", url: "" },
        checked: false
      });
    }
    catch (error) {
      this.setState({
        success: false,
        error: error,
        checked: false
      });
    }
  }

  verifiedToReset() {
    this.setState({
      success: this.state.success,
      error: this.state.error,
      checked: !this.state.checked,
    });
  }

  render() {
    const patron = this.props.patron;
    const patronExists = !!(patron && patron.authorization_identifier);

    return (
      <div className="patron-actions">
        <h4>Reset Adobe Id</h4>
        { this.state.error.status > 200 &&
          <Alert bsStyle="danger">Error: failed to reset Adobe ID for patron {patron.authorization_identifier}</Alert>
        }
        { this.state.success &&
          <Alert bsStyle="success">Adobe ID for patron {patron.authorization_identifier} has been reset.</Alert>
        }
        <p>This feature allows you to delete an existing Adobe account ID for an individual patron so that a new one can be assigned–this will happen automatically when the user logs in again. This step is necessary when patrons reach their device installation limit. Please be sure to inform patrons that they will lose any existing loans or reserves when the new account is created.</p>
        { patron ?
            <div>
              <section className="patron-info">
                <ul className="patron-data-list">
                  { patron.username &&
                    <li><label>Username</label><p>{patron.username}</p></li>
                  }
                  { patron.personal_name &&
                    <li><label>Personal Name</label><p>{patron.personal_name}</p></li>
                  }
                  { patron.email_address &&
                    <li><label>Email Address</label><p>{patron.email_address}</p></li>
                  }
                  <li><label>Identifier</label><p>{patron.authorization_identifier}</p></li>
                </ul>
              </section>
              <p className="patron-warning"><b>Patron {patron && patron.username} will lose any existing loans or reserves when the Adobe ID is reset.</b></p>
              <EditableInput
                type="checkbox"
                name="resetAdobeId"
                checked={this.state.checked}
                label="Patron has been informed about this change"
                onChange={this.verifiedToReset}
                />
              <button
                className="btn btn-default"
                onClick={this.resetAdobeId}
                disabled={!this.state.checked}
              >
                Reset Adobe ID
              </button>
            </div> :
            <p><b>Search patron to begin</b></p>
        }
      </div>
    );
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    resetAdobeId: (data: FormData) => dispatch(actions.resetAdobeId(data)),
  };
}

const ConnectedResetAdobeId = connect<PatronActionsListStateProps, PatronActionsListDispatchProps, PatronActionsListOwnProps>(
  null,
  mapDispatchToProps
)(ResetAdobeId);

export default ConnectedResetAdobeId;
