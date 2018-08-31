import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { PatronData } from "../interfaces";
import { Alert } from "react-bootstrap";
import ManagePatronsForm from "./ManagePatronsForm";
import EditableInput from "./EditableInput";
import PatronInfo from "./PatronInfo";

export interface ResetAdobeIdStateProps {
  fetchError?: FetchErrorData;
  responseBody?: string;
}

export interface ResetAdobeIdDispatchProps {
  resetAdobeId?: (data: FormData) => Promise<void>;
}

export interface ResetAdobeIdOwnProps {
  store?: Store<State>;
  csrfToken?: string;
  patron: PatronData;
}

export interface ResetAdobeIdProps extends React.Props<ResetAdobeIdProps>, ResetAdobeIdStateProps, ResetAdobeIdDispatchProps, ResetAdobeIdOwnProps {}

export interface ResetAdobeIdState {
  checked: boolean;
}

export class ResetAdobeId extends React.Component<ResetAdobeIdProps, ResetAdobeIdState> {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
    };
    this.resetAdobeId = this.resetAdobeId.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
  }

  async resetAdobeId(e) {
    e.preventDefault();
    const data = new (window as any).FormData();
    data.append("identifier", this.props.patron.authorization_identifier);

    await this.props.resetAdobeId(data);
    this.setState({ checked: false });
  }

  toggleCheckbox() {
    this.setState({ checked: !this.state.checked });
  }

  render() {
    const {
      patron,
      fetchError,
      responseBody,
    } = this.props;
    const patronExists = !!(patron && patron.authorization_identifier);

    return (
      <div className="patron-actions">
        <h4>Reset Adobe ID</h4>
        { (fetchError && fetchError.status > 200 && patronExists) &&
          <Alert bsStyle="danger">Error: failed to reset Adobe ID for patron {patron.authorization_identifier}</Alert>
        }
        { responseBody &&
          <Alert bsStyle="success">{responseBody}</Alert>
        }
        <p>This feature allows you to delete the existing Adobe ID for an individual patron; a new Adobe ID will be assigned
          automatically when the patron logs in again. This step is necessary when patrons reach their device installation limit.
          Please be sure to inform patrons that resetting their Adobe ID will cause them to lose any existing loans or holds.</p>
        <ManagePatronsForm
          store={this.props.store}
          csrfToken={this.props.csrfToken}
        />
        { patron ?
            <div>
              <PatronInfo patron={patron} />
              <p className="patron-warning"><b>Patron {patron && (patron.username || patron.personal_name)} will lose any existing loans or holds when the Adobe ID is reset.</b></p>
              <EditableInput
                type="checkbox"
                name="resetAdobeId"
                checked={this.state.checked}
                label="Patron has been informed about this change"
                onChange={this.toggleCheckbox}
                />
              <button
                className="btn btn-danger"
                onClick={this.resetAdobeId}
                disabled={!this.state.checked}
              >
                Reset Adobe ID
              </button>
            </div> :
            <p><b>Search for a patron to begin.</b></p>
        }
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const patronManager = state.editor.patronManager && state.editor.patronManager;

  return {
    fetchError: patronManager && patronManager.fetchError,
    responseBody: patronManager && patronManager.responseBody,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    resetAdobeId: (data: FormData) => dispatch(actions.resetAdobeId(data)),
  };
}

const ConnectedResetAdobeId = connect<ResetAdobeIdStateProps, ResetAdobeIdDispatchProps, ResetAdobeIdOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(ResetAdobeId);

export default ConnectedResetAdobeId;
