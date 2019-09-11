import * as React from "react";
import { LibraryData, LibraryRegistrationData } from "../interfaces";
import EditableInput from "./EditableInput";
import { Form } from "library-simplified-reusable-components";

export interface LibraryRegistrationFormState {
  checked: boolean;
}

export interface LibraryRegistrationFormProps {
  library: LibraryData;
  register: (library) => void;
  checked: boolean;
  buttonText: string;
  disabled: boolean;
  registrationData?: LibraryRegistrationData;
}

export default class LibraryRegistrationForm extends React.Component<LibraryRegistrationFormProps, LibraryRegistrationFormState> {

  constructor(props) {
    super(props);
    this.state = { checked: this.props.checked };
    this.toggleChecked = this.toggleChecked.bind(this);
  }

  componentWillReceiveProps(nextProps): void {
    this.setState({ checked: nextProps.checked });
  }

  render(): JSX.Element {
    const hasTerms = this.props.registrationData && (
      this.props.registrationData.terms_of_service_html ||
      this.props.registrationData.terms_of_service_link ||
      this.props.registrationData.access_problem
    );
    let disabled = this.props.disabled || (hasTerms && !this.state.checked);

    return (
      <Form
        className="inline registration-status"
        content={hasTerms && this.checkbox(this.props.library)}
        disableButton={disabled}
        onSubmit={() => this.props.register(this.props.library)}
        buttonContent={this.props.buttonText}
      />
    );
  }

  checkbox(library: LibraryData): JSX.Element {
    let { access_problem, terms_of_service_html, terms_of_service_link } = this.props.registrationData;
    return (
      <section className="registration-checkbox">
        {
          terms_of_service_html ?
          <label dangerouslySetInnerHTML={{__html: terms_of_service_html}}></label> :
          <label>I have read and agree to the <a href={terms_of_service_link}>terms and conditions</a>.</label>
        }
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

  toggleChecked(): void {
    this.setState({ checked: !this.state.checked });
  }

}
