/* eslint react/no-unescaped-entities: "off" */
import * as React from "react";
import { Panel, Form } from "library-simplified-reusable-components";
import { ServicesData, LibraryData } from "../interfaces";
import { PluginConfig, PluginSettingField } from "../interfaces";
import { Store } from "redux";
import { State } from "../reducers/index";
import ProtocolFormField from "./ProtocolFormField";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";
import editorAdapter from "../editorAdapter";
import * as PropTypes from "prop-types";

export interface ServiceEditFormProps<T> {
  plugin: PluginConfig;
  library: LibraryData;
  updatePlugin: (
    library: string,
    plugin: string,
    data: FormData
  ) => Promise<void>;
}

export interface ServiceEditFormState {
  error: boolean;
  errorMessage: string;
}

export interface PluginsContext {
  editorStore: Store<State>;
  csrfToken: string;
}

export default class PluginEditForm<
  T extends ServicesData
> extends React.Component<ServiceEditFormProps<T>, ServiceEditFormState> {
  context: PluginsContext;

  static contextTypes: React.ValidationMap<PluginsContext> = {
    editorStore: PropTypes.object.isRequired as React.Validator<Store>,
    csrfToken: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.state = {
      error: false,
      errorMessage: "",
    };
  }

  render(): JSX.Element {
    let hasData = false;

    const fields = (this.props.plugin && this.props.plugin.fields) || [];
    const { requiredFields, optionalFields } = this.separateFields(fields);

    const requiredFieldsPanel = (
      <Panel
        id="panel-plugin-required"
        key="required"
        headerText="Required Fields"
        openByDefault={true}
        collapsible={true}
        content={this.fieldsToContent(requiredFields)}
      />
    );

    const optionalFieldsPanel = (
      <Panel
        id="panel-plugin-optional"
        key="optional"
        headerText="Optional Fields"
        openByDefault={false}
        collapsible={true}
        content={this.fieldsToContent(optionalFields)}
      />
    );

    if (
      (requiredFields && requiredFields.length > 0) ||
      (optionalFields && optionalFields.length > 0)
    ) {
      hasData = true;
    }
    return (
      <div>
        {this.state.error && (
          <div className="error-alert">
            <h4>
              <span> {this.state.errorMessage} </span>
            </h4>
          </div>
        )}

        {hasData && (
          <Form
            className="no-border edit-plugin-form"
            disableButton={false}
            content={[requiredFieldsPanel, optionalFieldsPanel]}
            onSubmit={this.submit}
          />
        )}
        {!hasData && (
          <div className="plugin-without-config">
            <p> This plugin doesn't expect any configuration. </p>
          </div>
        )}
      </div>
    );
  }

  separateFields(fields: PluginSettingField[]) {
    const requiredFields = [];
    const optionalFields = [];
    fields.forEach((field) => {
      field.required ? requiredFields.push(field) : optionalFields.push(field);
    });

    return { requiredFields, optionalFields };
  }

  fieldsToContent(fields: PluginSettingField[]) {
    return (
      <fieldset>
        {fields.map((field) => (
          <ProtocolFormField
            key={field.key}
            ref={field.key}
            setting={field}
            disabled={false}
            value={field.value}
          />
        ))}
      </fieldset>
    );
  }

  async submit(data: FormData) {
    const fetcher = new DataFetcher({ adapter: editorAdapter });
    const actions = new ActionCreator(fetcher, this.context.csrfToken);
    this.context.editorStore
      .dispatch(
        actions.updatePlugin(
          this.props.library.short_name.toString(),
          this.props.plugin.name.toString(),
          data
        )
      )
      .then(() => {
        window.location.reload();
      })
      .catch((e) => {
        this.setState({
          error: true,
          errorMessage:
            e.response || "Cannot save changes, please contact admin.",
        });
      });
  }
}
