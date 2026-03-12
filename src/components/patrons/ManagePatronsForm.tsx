import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import { RootState } from "../../store";
import { AppDispatch } from "../../store";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { patronsApi, clearPatron } from "../../features/patrons/patronsSlice";
import { PatronData } from "../../interfaces";
import { Form } from "../ui";
import EditableInput from "../shared/EditableInput";
import ErrorMessage from "../shared/ErrorMessage";
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapStateToProps(
  state: RootState,
  _ownProps: ManagePatronsFormOwnProps
) {
  const ui = state.editor.patronsUi;
  return {
    patron: ui.patron,
    fetchError: ui.patronFetchError,
  };
}

export function mapDispatchToProps(
  dispatch: AppDispatch,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ownProps: ManagePatronsFormOwnProps
) {
  return {
    patronLookup: async (data: FormData, library: string): Promise<void> => {
      await dispatch(
        patronsApi.endpoints.patronLookup.initiate({ data, library })
      );
    },
    clearPatronData: async (): Promise<void> => {
      dispatch(clearPatron());
    },
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
