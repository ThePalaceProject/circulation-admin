import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { RootState } from "../../store";
import { AppDispatch } from "../../store";
import { connect } from "react-redux";
import { patronsApi } from "../../features/patrons/patronsSlice";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import ErrorMessage from "../shared/ErrorMessage";
import EditableInput from "../shared/EditableInput";
import { Form } from "library-simplified-reusable-components";

export interface ChangePasswordFormStateProps {
  fetchError?: FetchErrorData;
  isFetching?: boolean;
}

export interface ChangePasswordFormDispatchProps {
  changePassword?: (data: FormData) => Promise<void>;
}

export interface ChangePasswordFormOwnProps {
  store?: Store<RootState>;
  csrfToken: string;
}

export interface ChangePasswordFormProps
  extends ChangePasswordFormStateProps,
    ChangePasswordFormDispatchProps,
    ChangePasswordFormOwnProps {}

export interface ChangePasswordState {
  success: boolean;
  error: string | null;
}

export class ChangePasswordForm extends React.Component<
  ChangePasswordFormProps,
  ChangePasswordState
> {
  private passwordRef = React.createRef<EditableInput>();
  private confirmRef = React.createRef<EditableInput>();
  constructor(props) {
    super(props);
    this.state = { success: false, error: null };
    this.save = this.save.bind(this);
  }

  render(): JSX.Element {
    const formContent = (
      <fieldset key="change-password">
        <legend className="visuallyHidden">Change admin's password</legend>
        <EditableInput
          elementType="input"
          type="password"
          disabled={this.props.isFetching}
          name="password"
          label="New Password"
          ref={this.passwordRef}
          required={true}
        />
        <EditableInput
          elementType="input"
          type="password"
          disabled={this.props.isFetching}
          name="confirm_password"
          label="Confirm New Password"
          ref={this.confirmRef}
          required={true}
        />
      </fieldset>
    );

    return (
      <main className="change-password-form">
        <h2>Change Password</h2>
        <Form
          onSubmit={this.save}
          content={formContent}
          disableButton={this.props.isFetching}
          buttonClass="left-align"
          className="border change-password-form"
          successText={this.state.success && "Password changed successfully"}
          errorText={
            (this.props.fetchError && (
              <ErrorMessage error={this.props.fetchError} />
            )) ||
            this.state.error
          }
          loadingText={this.props.isFetching && <LoadingIndicator />}
        ></Form>
      </main>
    );
  }

  save(data: FormData) {
    if (!(data.get("password") && data.get("confirm_password"))) {
      this.setState({ success: false, error: "Fields cannot be blank." });
    } else if (data.get("password") !== data.get("confirm_password")) {
      this.setState({ success: false, error: "Passwords do not match." });
    } else {
      this.props.changePassword(data).then(() => {
        this.setState({ success: true, error: null });
      });
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapStateToProps(
  state: RootState,
  _ownProps: ChangePasswordFormOwnProps
) {
  const cp = state.editor.patronsUi.changePassword;
  return {
    fetchError: cp.fetchError,
    isFetching: cp.isFetching,
  };
}

function mapDispatchToProps(
  dispatch: AppDispatch,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ownProps: ChangePasswordFormOwnProps
) {
  return {
    changePassword: async (data: FormData) => {
      const result = await dispatch(
        patronsApi.endpoints.changePassword.initiate(data)
      );
      if ("error" in result) throw result.error;
    },
  };
}

const ConnectedChangePasswordForm = connect<
  ChangePasswordFormStateProps,
  ChangePasswordFormDispatchProps,
  ChangePasswordFormOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(ChangePasswordForm);

export default ConnectedChangePasswordForm;
