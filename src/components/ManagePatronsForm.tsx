import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import { RootState } from "../store";
import ActionCreator from "../actions";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { PatronData } from "../interfaces";
import { Button, Form } from "library-simplified-reusable-components";
import EditableInput from "./EditableInput";
import ErrorMessage from "./ErrorMessage";
import PatronInfo from "./PatronInfo";

export interface ManagePatronsFormStateProps {
  patron?: PatronData;
  fetchError?: FetchErrorData;
}

export interface ManagePatronsFormDispatchProps {
  patronLookup?: (data: FormData, library: string) => Promise<void>;
  clearPatronData?: () => Promise<void>;
}

export interface ManagePatronsFormOwnProps {
  store?: Store<RootState>;
  csrfToken?: string;
  library: string;
}

export interface ManagePatronsFormProps
  extends ManagePatronsFormStateProps,
    ManagePatronsFormDispatchProps,
    ManagePatronsFormOwnProps {}

export class ManagePatronsForm extends React.Component<ManagePatronsFormProps> {
  private identifierRef = React.createRef<EditableInput>();
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearPatronData();
  }

  render(): JSX.Element {
    const { patron, fetchError } = this.props;
    const patronExists = !!patron;

    return (
      <div className="manage-patrons-form">
        <Form
          onSubmit={this.submit}
          className="no-border edit-form"
          buttonClass="top-align"
          content={
            <EditableInput
              elementType="input"
              ref={this.identifierRef}
              name="identifier"
              label="Identifier"
              className="form-control"
              placeholder="Enter the patron's identifier"
              required={true}
              error={fetchError}
            />
          }
          errorText={
            fetchError && !patronExists && <ErrorMessage error={fetchError} />
          }
          successText={
            !fetchError &&
            patronExists &&
            `Patron found: ${patron.authorization_identifier}`
          }
        />
        {!fetchError && patronExists && <PatronInfo patron={patron} />}
      </div>
    );
  }

  async submit(data: FormData) {
    await this.props.patronLookup(data, this.props.library);
  }
}

function mapStateToProps(state, ownProps) {
  const patronManager =
    state.editor.patronManager && state.editor.patronManager;
  return {
    patron: patronManager && patronManager.data,
    fetchError: patronManager && patronManager.fetchError,
  };
}

export function mapDispatchToProps(dispatch, ownProps) {
  const actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    patronLookup: (data: FormData, library: string) =>
      dispatch(actions.patronLookup(data, library)),
    clearPatronData: () => dispatch(actions.clearPatronData()),
  };
}

const ConnectedManagePatronsForm = connect<
  ManagePatronsFormStateProps,
  ManagePatronsFormDispatchProps,
  ManagePatronsFormOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(ManagePatronsForm);

export default ConnectedManagePatronsForm;
