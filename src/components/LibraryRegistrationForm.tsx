import * as React from "react";
import { ServicesWithRegistrationsData, LibraryDataWithStatus } from "../interfaces";
import EditableInput from "./EditableInput";

export interface LibraryRegistrationFormState {
  checked: boolean;
}

export interface LibraryRegistrationFormProps {
  library: LibraryDataWithStatus;
  registerLibrary: (library, registration_stage) => void;
  status: string;
  disabled: boolean;
  stage: string;
}

export default class LibraryRegistrationForm extends React.Component<LibraryRegistrationFormProps, LibraryRegistrationFormState> {
  constructor(props) {
    super(props);
    this.state = { checked: (this.props.status === "success") };
    this.toggleChecked = this.toggleChecked.bind(this);
    this.registerButton = this.registerButton.bind(this);
  }

  checkbox(library) {
    return (
      <section>
        <label>I have read and agree to the <a href="#">terms and conditions</a></label>
        <EditableInput
          elementType="input"
          type="checkbox"
          onChange={this.toggleChecked}
          checked={this.state.checked}
        >
        </EditableInput>
      </section>
    );
  }

  toggleChecked() {
    this.setState({...this.state, ...{ checked: !this.state.checked }});
  }

  registerButton(label, library, stage) {
    return (
      <button
        type="button"
        className="btn btn-default"
        disabled={this.props.disabled || !this.state.checked}
        onClick={() => this.props.registerLibrary(library, stage)}
      >
        {label}
      </button>
    );
  }

  render() {
    const text = {
      "success": {
        message: "Registered",
        buttonText: "Update registration"
      },
      "warning": {
        message: "Not registered",
        buttonText: "Register"
      },
      "danger": {
        message: "Registration failed",
        buttonText: "Retry registration"
      }
    };

    return (
      <form className="registration-status">
        <span className={`bg-${this.props.status}`}>
          {text[this.props.status].message}
        </span>
        {this.checkbox(this.props.library)}
        {this.registerButton(text[this.props.status].buttonText, this.props.library, this.props.stage)}
      </form>
    );
  }
}
