import * as React from "react";
import { LibraryData } from "../interfaces";
import EditableInput from "./EditableInput";
import SaveButton from "./SaveButton";

export interface LibraryRegistrationFormState {
  checked: boolean;
}

export interface LibraryRegistrationFormProps {
  library: LibraryData;
  register: (library) => void;
  checked: boolean;
  buttonText: string;
  disabled: boolean;
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
    const termsLink = !!this.props.library.settings &&
                      !!this.props.library.settings["terms-of-service"] &&
                      (this.props.library.settings["terms-of-service"] as string);

    let disabled = this.props.disabled || (termsLink && !this.state.checked);

    return (
      <form className="registration-status">
        {termsLink && this.checkbox(this.props.library, termsLink)}
        <SaveButton disabled={disabled} submit={() => this.props.register(this.props.library)} text={this.props.buttonText} />
      </form>
    );
  }

  checkbox(library: LibraryData, termsLink: string): JSX.Element {
    return (
      <section className="registration-checkbox">
        <label>I have read and agree to the <a href={termsLink}>terms and conditions</a></label>
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
