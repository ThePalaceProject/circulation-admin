import * as React from "react";
import { PatronAuthServicesData } from "../interfaces";
import {
  LibraryWithSettingsData,
  PatronBlockingRule,
  ProtocolData,
} from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";
import PatronBlockingRulesEditor, {
  PatronBlockingRulesEditorHandle,
} from "./PatronBlockingRulesEditor";
import { supportsPatronBlockingRules } from "../utils/patronBlockingRules";

/** Extends ServiceEditForm with patron-blocking-rules support for protocols that
 *  support it. The editor is injected via the hook methods added
 *  to ServiceEditForm; editLibrary and addLibrary are overridden to collect the
 *  rules from the editor ref and persist them in library state. */
export default class PatronAuthServiceEditForm extends ServiceEditForm<
  PatronAuthServicesData
> {
  private newLibraryRulesRef = React.createRef<
    PatronBlockingRulesEditorHandle
  >();
  private libraryRulesRefs = new Map<
    string,
    React.RefObject<PatronBlockingRulesEditorHandle>
  >();

  private getOrCreateLibraryRef(
    shortName: string
  ): React.RefObject<PatronBlockingRulesEditorHandle> {
    if (!this.libraryRulesRefs.has(shortName)) {
      this.libraryRulesRefs.set(
        shortName,
        React.createRef<PatronBlockingRulesEditorHandle>()
      );
    }
    return this.libraryRulesRefs.get(shortName);
  }

  protocolHasLibrarySettings(protocol: ProtocolData): boolean {
    return (
      super.protocolHasLibrarySettings(protocol) ||
      supportsPatronBlockingRules(protocol && protocol.name)
    );
  }

  renderExtraAssociatedLibrarySettings(
    library: LibraryWithSettingsData,
    protocol: ProtocolData,
    disabled: boolean
  ): React.ReactNode {
    if (!supportsPatronBlockingRules(protocol && protocol.name)) {
      return null;
    }
    return (
      <PatronBlockingRulesEditor
        ref={this.getOrCreateLibraryRef(library.short_name)}
        value={library.patron_blocking_rules || []}
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
        ref={this.newLibraryRulesRef}
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
        `${library.short_name}_${setting.key}`
      ] as any).getValue();
      if (value) {
        ((newLibrary as unknown) as Record<string, string>)[
          setting.key
        ] = value;
      }
    }
    if (supportsPatronBlockingRules(protocol && protocol.name)) {
      const editorRef = this.libraryRulesRefs.get(library.short_name);
      if (editorRef?.current) {
        newLibrary.patron_blocking_rules = editorRef.current.getValue();
      }
    const editorRef = this.libraryRulesRefs.get(library.short_name);
    if (editorRef?.current) {
      newLibrary.patron_blocking_rules = editorRef.current.getValue();
    }
    libraries.push(newLibrary);
    this.setState(
      Object.assign({}, this.state, { libraries, expandedLibraries })
    );
  }

  addLibrary(protocol: ProtocolData) {
    const name = this.state.selectedLibrary;
    const newLibrary: LibraryWithSettingsData = { short_name: name };
    for (const setting of this.protocolLibrarySettings(protocol)) {
      const value = (this.refs[setting.key] as any).getValue();
      if (value) {
        ((newLibrary as unknown) as Record<string, string>)[
          setting.key
        ] = value;
      }
      (this.refs[setting.key] as any).clear();
    }
    if (this.newLibraryRulesRef.current) {
      newLibrary.patron_blocking_rules = this.newLibraryRulesRef.current.getValue();
    }
    const libraries = this.state.libraries.concat(newLibrary);
    this.setState(
      Object.assign({}, this.state, { libraries, selectedLibrary: null })
    );
  }
}
