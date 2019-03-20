import Autocomplete from "./Autocomplete";
import * as React from "react";
import { State } from "../reducers/index";
import { Store } from "redux";
import { connect } from "react-redux";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";
import { LanguagesData } from "../interfaces";

export interface LanguageFieldOwnProps {
  value?: string;
  disabled?: boolean;
  store?: Store<State>;
  name?: string;
}

export interface LanguageFieldDispatchProps {
  fetchLanguages: () => void;
}

export interface LanguageFieldStateProps {
  languages?: LanguagesData;
}

export interface LanguageFieldProps extends LanguageFieldOwnProps, LanguageFieldDispatchProps, LanguageFieldStateProps {};

export class LanguageField extends React.Component<LanguageFieldProps, void> {

  componentWillMount() {
    this.props.fetchLanguages();
  }

  render() {
    return (
      <Autocomplete
        autocompleteValues={this.uniqueLanguageNames()}
        disabled={this.props.disabled}
        name={this.props.name || "language"}
        value={this.props.value}
        ref="autocomplete"
      />
    );
  }

  uniqueLanguageNames() {
    const languageNames = [];
    for (let nameList of Object.values(this.props.languages || {})) {
      for (let name of nameList) {
        if (languageNames.indexOf(name) === -1) {
          languageNames.push(name);
        }
      }
    }
    return languageNames;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    languages: state.editor.languages.data,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator();
  return {
    fetchLanguages: () => dispatch(actions.fetchLanguages())
  };
}

const ConnectedLanguageField = connect<LanguageFieldStateProps, LanguageFieldDispatchProps, LanguageFieldOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
  null,
 { withRef: true }
)(LanguageField);

export default ConnectedLanguageField;
