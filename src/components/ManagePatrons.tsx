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

export interface PatronError {
  status: boolean;
  message: string;
}

export interface ManagePatronsStateProps {
  patron?: PatronData;
  isFetching?: boolean;
}

export interface ManagePatronsDispatchProps {
  patronLookup?: (data: FormData) => Promise<void>;
}

export interface ManagePatronsOwnProps {
  store?: Store<State>;
  csrfToken: string;
}

export interface ManagePatronsProps extends React.Props<ManagePatronsProps>, ManagePatronsStateProps, ManagePatronsDispatchProps, ManagePatronsOwnProps {}

export interface ManagePatronsState {
  patron: PatronData;
  error: FetchErrorData;
}

export class ManagePatrons extends React.Component<ManagePatronsProps, ManagePatronsState> {
  constructor(props) {
    super(props);
    this.state = {patron: null, error: {status: 200, response: "", url: ""}};
    this.submit = this.submit.bind(this);
  }

  submit(e) {
    e.preventDefault();
    const data = new (window as any).FormData();
    data.append("identifier", ((this.refs["identifier"] as any).getValue()));

    this.props.patronLookup(data)
      .then(result => {
        console.log("result", result);
      })
      .catch(error => {
        console.log("error", error);
        this.setState({error, patron: null});
      });
  }

  render() {
    return (
      <div>
        <h2>Manage Patrons</h2>
        { this.state.error.status !== 200 &&
          <ErrorMessage error={this.state.error} />
        }
        <form onSubmit={this.submit} className="edit-form" ref="form">
          <EditableInput
            elementType="input"
            ref="identifier"
            name="identifier"
            label="Barcode"
            className="control-label"
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
  const data = state.editor.managePatrons;
  return {
    patron: data,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    patronLookup: (data: FormData) => dispatch(actions.patronLookup(data)),
  };
}

const ConnectedManagePatrons = connect<ManagePatronsStateProps, ManagePatronsDispatchProps, ManagePatronsOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(ManagePatrons);

export default ConnectedManagePatrons;
