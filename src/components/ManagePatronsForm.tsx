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
import PatronInfo from "./PatronInfo";
import { Alert } from "react-bootstrap";

export interface ManagePatronsFormStateProps {
  patron?: PatronData;
  fetchError?: FetchErrorData;
}

export interface ManagePatronsFormDispatchProps {
  patronLookup?: (data: FormData, library: string) => Promise<void>;
  clearPatronData?: () => Promise<void>;
}

export interface ManagePatronsFormOwnProps {
  store?: Store<State>;
  csrfToken?: string;
  library: string;
}

export interface ManagePatronsFormProps extends ManagePatronsFormStateProps, ManagePatronsFormDispatchProps, ManagePatronsFormOwnProps {}


export class ManagePatronsForm extends React.Component<ManagePatronsFormProps, void> {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  async submit(e) {
    e.preventDefault();
    const data = new (window as any).FormData(this.refs["form"] as any);
    await this.props.patronLookup(data, this.props.library);
  }

  componentWillUnmount() {
    this.props.clearPatronData();
  }

  render(): JSX.Element {
    const { patron, fetchError } = this.props;
    const patronExists = !!(patron);

    return (
      <div className="manage-patrons-form">
        <form onSubmit={this.submit} className="edit-form" ref="form">
          <EditableInput
            elementType="input"
            ref="identifier"
            name="identifier"
            label="Identifier"
            className="form-control"
            placeholder="Enter the patron's identifier"
            required={true}
            error={fetchError}
          />
          <button
            type="submit"
            className="btn btn-default"
            >Submit</button>
        </form>
        { (fetchError && !patronExists) &&
          <ErrorMessage error={fetchError} />
        }
        { (!fetchError && patronExists) &&
          <Alert bsStyle="success">Patron found: {patron.authorization_identifier}</Alert>
        }
        { (!fetchError && patronExists) &&
          <PatronInfo patron={patron} />
        }
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const patronManager = state.editor.patronManager && state.editor.patronManager;
  return {
    patron: patronManager && patronManager.data,
    fetchError: patronManager && patronManager.fetchError,
  };
}

export function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    patronLookup: (data: FormData, library: string) => dispatch(actions.patronLookup(data, library)),
    clearPatronData: () => dispatch(actions.clearPatronData()),
  };
};

const ConnectedManagePatronsForm = connect<ManagePatronsFormStateProps, ManagePatronsFormDispatchProps, ManagePatronsFormOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(ManagePatronsForm);

export default ConnectedManagePatronsForm;
