import * as React from "react";
import { Store } from "redux";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { State } from "../reducers/index";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import EditableInput from "./EditableInput";
import { Alert } from "react-bootstrap";

export interface ChangePasswordFormStateProps {
  fetchError?: FetchErrorData;
  isFetching?: boolean;
}

export interface ChangePasswordFormDispatchProps {
  changePassword?: (data: FormData) => Promise<void>;
}

export interface ChangePasswordFormOwnProps {
  store?: Store<State>;
  csrfToken: string;
}

export interface ChangePasswordFormProps extends ChangePasswordFormStateProps, ChangePasswordFormDispatchProps, ChangePasswordFormOwnProps {}

export interface ChangePasswordState {
  success: boolean;
  error: string | null;
}

export class ChangePasswordForm extends React.Component<ChangePasswordFormProps, ChangePasswordState> {
  constructor(props) {
    super(props);
    this.state = { success: false, error: null };
    this.save = this.save.bind(this);
  }

  render(): JSX.Element {
    return (
      <div className="change-password-form">
        <h2>Change Password</h2>
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} />
        }
        { this.state.error &&
          <Alert bsStyle="danger">{ this.state.error }</Alert>
        }
        { this.props.isFetching &&
          <LoadingIndicator />
        }
        { this.state.success &&
          <Alert bsStyle="success">Password changed successfully.</Alert>
        }
        <form ref="form" onSubmit={this.save}>
          <fieldset>
            <legend className="visuallyHidden">Change admin's password</legend>
            <EditableInput
              elementType="input"
              type="password"
              disabled={this.props.isFetching}
              name="password"
              label="New Password"
              ref="password"
              required={true}
              />
            <EditableInput
              elementType="input"
              type="password"
              disabled={this.props.isFetching}
              name="confirm_password"
              label="Confirm New Password"
              ref="confirm"
              required={true}
              />
          </fieldset>
          <button
            type="submit"
            className="btn btn-default"
            disabled={this.props.isFetching}
            >Submit</button>
        </form>
      </div>
    );
  }

  save(event) {
    event.preventDefault();
    let password = (this.refs["password"] as any).getValue();
    let confirm = (this.refs["confirm"] as any).getValue();
    if (password !== confirm) {
      this.setState({ success: false, error: "Passwords do not match." });
    } else {
      const data = new (window as any).FormData(this.refs["form"] as any);
      this.props.changePassword(data).then(() => {
        this.setState({ success: true, error: null });
      });
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    fetchError: state.editor.changePassword && state.editor.changePassword.fetchError,
    isFetching: state.editor.changePassword && state.editor.changePassword.isFetching
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    changePassword: (data: FormData) => dispatch(actions.changePassword(data))
  };
}

const ConnectedChangePasswordForm = connect<ChangePasswordFormStateProps, ChangePasswordFormDispatchProps, ChangePasswordFormOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(ChangePasswordForm);

export default ConnectedChangePasswordForm;
