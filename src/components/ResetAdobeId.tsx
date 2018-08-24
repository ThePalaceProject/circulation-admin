import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { PatronData } from "../interfaces";
import { Alert } from "react-bootstrap";
import EditableInput from "./EditableInput";
import PatronInfo from "./PatronInfo";

export interface ResetAdobeIdStateProps {
  isFetching?: boolean;
}

export interface PatronResponse {
  text: PatronData;
  response: IResponse;
}

export interface ResetAdobeIdDispatchProps {
  resetAdobeId?: (data: FormData) => Promise<PatronResponse>;
}

export interface ResetAdobeIdOwnProps {
  store?: Store<State>;
  csrfToken?: string;
  patron: PatronData;
}

export interface ResetAdobeIdProps extends React.Props<ResetAdobeIdProps>, ResetAdobeIdStateProps, ResetAdobeIdDispatchProps, ResetAdobeIdOwnProps {}

export interface ResetAdobeIdState {
  error: FetchErrorData;
  success: boolean;
  checked: boolean;
}

export class ResetAdobeId extends React.Component<ResetAdobeIdProps, ResetAdobeIdState> {
  constructor(props) {
    super(props);
    this.state = {
      error: { status: 200, response: "", url: "" },
      success: false,
      checked: false,
    };
    this.resetAdobeId = this.resetAdobeId.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
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

  toggleCheckbox() {
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
        <h4>Reset Adobe ID</h4>
        { this.state.error.status > 200 &&
          <Alert bsStyle="danger">Error: failed to reset Adobe ID for patron {patron.authorization_identifier}</Alert>
        }
        { this.state.success &&
          <Alert bsStyle="success">Adobe ID for patron {patron.authorization_identifier} has been reset.</Alert>
        }
        <p>This feature allows you to delete the existing Adobe ID for an individual patron; a new Adobe ID will be assigned automatically when the patron logs in again. This step is necessary when patrons reach their device installation limit. Please be sure to inform patrons that resetting their Adobe ID will cause them to lose any existing loans or holds.</p>
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

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    resetAdobeId: (data: FormData) => dispatch(actions.resetAdobeId(data)),
  };
}

const ConnectedResetAdobeId = connect<ResetAdobeIdStateProps, ResetAdobeIdDispatchProps, ResetAdobeIdOwnProps>(
  null,
  mapDispatchToProps
)(ResetAdobeId);

export default ConnectedResetAdobeId;
