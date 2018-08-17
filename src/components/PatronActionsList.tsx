import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { PatronData } from "../interfaces";
import ButtonForm from "./ButtonForm";
import EditableInput from "./EditableInput";
import { Alert } from "react-bootstrap";

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
}

export class PatronActionsList extends React.Component<PatronActionsListProps, PatronActionsListState> {
  constructor(props) {
    super(props);
    this.state = { error: { status: 200, response: "", url: "" }, success: false };
    this.resetAdobeId = this.resetAdobeId.bind(this);
  }

  async resetAdobeId(e) {
    e.preventDefault();
    const data = new (window as any).FormData();
    data.append("identifier", this.props.patron.authorization_identifier);

    try {
      const response = await this.props.resetAdobeId(data);
      this.setState({
        success: true,
        error: { status: 200, response: "", url: "" }
      });
    }
    catch (error) {
      this.setState({ success: false, error: error });
    }
  }

  render() {
    return (
      <ul className="patron-actions">
        <li>
          <h4>Reset Adobe Id</h4>
          { this.state.error.status > 200 &&
            <Alert bsStyle="danger">Error: failed to reset Adobe ID for patron {this.props.patron.authorization_identifier}</Alert>
          }
          { this.state.success &&
            <Alert bsStyle="success">Adobe ID for patron {this.props.patron.authorization_identifier} has been reset.</Alert>
          }
          <p>This feature allows you to delete an existing Adobe account ID for an individual patron so that a new one can be assigned–this will happen automatically when the user logs in again. This step is necessary when patrons reach their device installation limit. Please be sure to inform patrons that they will lose any existing loans or reserves when the new account is created.</p>
          <button className="btn btn-default" onClick={this.resetAdobeId}>Reset Adobe ID</button>

        </li>
      </ul>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    resetAdobeId: (data: FormData) => dispatch(actions.resetAdobeId(data)),
  };
}

const ConnectedPatronActionsList = connect<PatronActionsListStateProps, PatronActionsListDispatchProps, PatronActionsListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(PatronActionsList);

export default ConnectedPatronActionsList;
