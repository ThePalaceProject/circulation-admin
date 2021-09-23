import Autocomplete from "./Autocomplete";
import * as React from "react";
import { LanguagesData } from "../interfaces";

export interface LanguageFieldProps {
  name: string;
  value?: string;
  disabled?: boolean;
  label?: string;
  languages?: LanguagesData;
  onChange?: () => void;
}

export default class LanguageField extends React.Component<
  LanguageFieldProps,
  {}
> {
  autocompleteRef = React.createRef<Autocomplete>();
  render() {
    const value =
      (this.props.languages &&
        this.props.languages[this.props.value] &&
        this.props.languages[this.props.value][0]) ||
      this.props.value;
    return (
      <Autocomplete
        autocompleteValues={this.uniqueLanguageNames()}
        disabled={this.props.disabled}
        name={this.props.name || "language"}
        value={value}
        label={this.props.label}
        ref={this.autocompleteRef}
        onChange={this.props.onChange}
      />
    );
  }

  uniqueLanguageNames() {
    const languageNames = [];
    for (const nameList of Object.values(this.props.languages || {})) {
      for (const name of nameList) {
        if (languageNames.indexOf(name) === -1) {
          languageNames.push(name);
        }
      }
    }
    return languageNames;
  }
}
