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

export interface ManagePatronsFormStateProps {
  patron?: PatronData;
  isFetching?: boolean;
}
export interface PatronResponse {
  text: PatronData;
  response: IResponse;
}

export interface ManagePatronsFormDispatchProps {
  patronLookup?: (data: FormData) => Promise<PatronResponse>;
}

export interface ManagePatronsFormOwnProps {
  store?: Store<State>;
  csrfToken?: string;
}

export interface ManagePatronsFormProps extends React.Props<ManagePatronsFormProps>, ManagePatronsFormStateProps, ManagePatronsFormDispatchProps, ManagePatronsFormOwnProps {}

export interface ManagePatronsFormState {
  error: FetchErrorData;
}

export class ManagePatronsForm extends React.Component<ManagePatronsFormProps, ManagePatronsFormState> {
  constructor(props) {
    super(props);
    this.state = { error: {status: 200, response: "", url: ""} };
    this.submit = this.submit.bind(this);
  }

  async submit(e) {
    e.preventDefault();
    const data = new (window as any).FormData();
    data.append("identifier", ((this.refs["identifier"] as any).getValue()));

    try {
      await this.props.patronLookup(data);
      this.setState({ error: {status: 200, response: "", url: ""} });
    }
    catch (error) {
      this.setState({ error });
    }
  }

  render(): JSX.Element {
    const patron = this.props.patron;
    const patronExists = !!(patron && patron.authorization_identifier);
    return (
      <div className="manage-patrons-form">
        { (this.state.error.status !== 200 && !patronExists) &&
          <ErrorMessage error={this.state.error} />
        }
        { (this.state.error.status === 200 && patronExists) &&
          <Alert bsStyle="success">Patron found {patron.authorization_identifier}</Alert>
        }
        <form onSubmit={this.submit} className="edit-form" ref="form">
          <EditableInput
            elementType="input"
            ref="identifier"
            name="identifier"
            label="Barcode"
            className="form-control"
            placeholder="Patron Barcode">
          </EditableInput>
          <button
            type="submit"
            className="btn btn-default"
            >Submit</button>
        </form>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const patron = state.editor.patronManager && state.editor.patronManager.data;
  return {
    patron: JSON.parse(patron),
  };
}

export function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    patronLookup: (data: FormData) => dispatch(actions.patronLookup(data))
  };
};

const ConnectedManagePatronsForm = connect<ManagePatronsFormStateProps, ManagePatronsFormDispatchProps, ManagePatronsFormOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(ManagePatronsForm);

export default ConnectedManagePatronsForm;
