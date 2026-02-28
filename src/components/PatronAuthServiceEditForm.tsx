import * as React from "react";
import { PatronAuthServicesData } from "../interfaces";
import {
  LibraryWithSettingsData,
  PatronBlockingRule,
  ProtocolData,
} from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";
import PatronBlockingRulesEditor from "./PatronBlockingRulesEditor";
import { supportsPatronBlockingRules } from "../utils/patronBlockingRules";

const NEW_LIBRARY_RULES_REF = "new_library_patron_blocking_rules";

/** Extends ServiceEditForm with patron-blocking-rules support for protocols that
 *  support it (v1: SIP2 only). The editor is injected via the hook methods added
 *  to ServiceEditForm; editLibrary and addLibrary are overridden to collect the
 *  rules from the editor ref and persist them in library state. */
export default class PatronAuthServiceEditForm extends ServiceEditForm<
  PatronAuthServicesData
> {
  protocolHasLibrarySettings(protocol: ProtocolData): boolean {
    return (
      super.protocolHasLibrarySettings(protocol) ||
      supportsPatronBlockingRules(protocol && protocol.name)
    );
  }

  renderExtraExpandedLibrarySettings(
    library: LibraryWithSettingsData,
    protocol: ProtocolData,
    disabled: boolean
  ): React.ReactNode {
    if (!supportsPatronBlockingRules(protocol && protocol.name)) {
      return null;
    }
    return (
      <PatronBlockingRulesEditor
        ref={`${library.short_name}_patron_blocking_rules`}
        value={(library.patron_blocking_rules as PatronBlockingRule[]) || []}
        disabled={disabled}
        error={this.props.error}
      />
    );
  }

  renderExtraNewLibrarySettings(
    protocol: ProtocolData,
    disabled: boolean
  ): React.ReactNode {
    if (!supportsPatronBlockingRules(protocol && protocol.name)) {
      return null;
    }
    return (
      <PatronBlockingRulesEditor
        ref={NEW_LIBRARY_RULES_REF}
        value={[]}
        disabled={disabled}
        error={this.props.error}
      />
    );
  }

  editLibrary(library: LibraryWithSettingsData, protocol: ProtocolData) {
    const libraries = this.state.libraries.filter(
      (stateLibrary) => stateLibrary.short_name !== library.short_name
    );
    const expandedLibraries = this.state.expandedLibraries.filter(
      (shortName) => shortName !== library.short_name
    );
    const newLibrary: LibraryWithSettingsData = {
      short_name: library.short_name,
    };
    for (const setting of this.protocolLibrarySettings(protocol)) {
      const value = (this.refs[
        library.short_name + "_" + setting.key
      ] as any).getValue();
      if (value) {
        newLibrary[setting.key] = value;
      }
    }
    if (supportsPatronBlockingRules(protocol && protocol.name)) {
      const editorRef = this.refs[
        `${library.short_name}_patron_blocking_rules`
      ] as PatronBlockingRulesEditor | undefined;
      if (editorRef) {
        newLibrary.patron_blocking_rules = editorRef.getValue();
      }
    }
    libraries.push(newLibrary);
    const newState = Object.assign({}, this.state, {
      libraries,
      expandedLibraries,
    });
    this.setState(newState);
  }

  addLibrary(protocol: ProtocolData) {
    const name = this.state.selectedLibrary;
    const newLibrary: LibraryWithSettingsData = { short_name: name };
    for (const setting of this.protocolLibrarySettings(protocol)) {
      const value = (this.refs[setting.key] as any).getValue();
      if (value) {
        newLibrary[setting.key] = value;
      }
      (this.refs[setting.key] as any).clear();
    }
    if (supportsPatronBlockingRules(protocol && protocol.name)) {
      const editorRef = this.refs[NEW_LIBRARY_RULES_REF] as
        | PatronBlockingRulesEditor
        | undefined;
      if (editorRef) {
        newLibrary.patron_blocking_rules = editorRef.getValue();
      }
    }
    const libraries = this.state.libraries.concat(newLibrary);
    const newState = Object.assign({}, this.state, {
      libraries,
      selectedLibrary: null,
    });
    this.setState(newState);
  }
}
