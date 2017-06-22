import * as React from "react";
import EditableInput from "./EditableInput";
import ProtocolFormField from "./ProtocolFormField";
import { AdminAuthServicesData, AdminAuthServiceData, ProtocolData } from "../interfaces";

export interface AdminAuthServiceEditFormProps {
  data: AdminAuthServicesData;
  item?: AdminAuthServiceData;
  csrfToken: string;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
}

export interface AdminAuthServiceEditFormState {
  protocol: string;
}

export interface AdminAuthServiceEditFormContext {
  settingUp: boolean;
}

export default class AdminAuthServiceEditForm extends React.Component<AdminAuthServiceEditFormProps, AdminAuthServiceEditFormState> {
  context: AdminAuthServiceEditFormContext;

  static contextTypes: React.ValidationMap<AdminAuthServiceEditFormContext> = {
    settingUp: React.PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    let defaultProtocol;
    if (this.props.data && this.props.data.protocols && this.props.data.protocols.length) {
      defaultProtocol = this.props.data.protocols[0].name;
    }
    this.state = {
      protocol: (this.props.item && this.props.item.protocol) || defaultProtocol,
    };
    this.handleProtocolChange = this.handleProtocolChange.bind(this);
    this.save = this.save.bind(this);
  }

  render(): JSX.Element {
    return (
      <form ref="form" onSubmit={this.save} className="edit-form">
        <input
          type="hidden"
          name="csrf_token"
          value={this.props.csrfToken}
          />
        <EditableInput
          elementType="select"
          disabled={this.props.disabled}
          readOnly={!!(this.props.item && this.props.item.protocol)}
          name="protocol"
          label="Protocol"
          value={this.state.protocol}
          ref="protocol"
          onChange={this.handleProtocolChange}
          >
          { this.props.data && this.props.data.protocols && this.props.data.protocols.length > 0 && this.props.data.protocols.map(protocol =>
              <option key={protocol.name} value={protocol.name}>{protocol.label}</option>
            )
          }
        </EditableInput>
        { this.props.data && this.props.data.protocols && this.protocolSettings() && this.protocolSettings().map(setting =>
            <ProtocolFormField
              key={setting.key}
              setting={setting}
              disabled={this.props.disabled}
              value={this.props.item && this.props.item[setting.key]}
              />
          )
        }
        <button
          type="submit"
          className="btn btn-default"
          disabled={this.props.disabled}
          >Submit</button>
      </form>
    );
  }

  componentWillReceiveProps(newProps) {
    let protocol = this.state.protocol;
    if (newProps.item && newProps.item.protocol) {
      if (!this.props.item || !this.props.item.protocol || (this.props.item.protocol !== newProps.item.protocol)) {
        protocol =  newProps.item.protocol;
      }
    }
    this.setState({ protocol });
  }

  save(event) {
    event.preventDefault();

    const data = new (window as any).FormData(this.refs["form"] as any);
    this.props.editItem(data).then(() => {
      // If we're setting up admin auth for the first time, refresh the page
      // to go to login.
      if (this.context.settingUp) {
        window.location.reload();
        return;
      }

      // If a new admin auth service was created, go to its edit page.
      if (!this.props.item && data.get("provider")) {
        window.location.href = "/admin/web/config/adminAuth/edit/" + data.get("protocol");
      }
    });
  }

  availableProtocols(): ProtocolData[] {
    const allProtocols = this.props.data && this.props.data.protocols || [];

    // If we're editing an existing service, the protocol can't be changed,
    // so there's only one available protocol.
    if (this.props.item) {
      for (const protocol of allProtocols) {
        if (protocol.name === this.props.item.protocol) {
          return [protocol];
        }
      }
    }

    return allProtocols;
  }

  handleProtocolChange() {
    const protocol = (this.refs["protocol"] as any).getValue();
    this.setState({ protocol });
  }

  protocolSettings() {
    if (this.state.protocol && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          return protocol.settings;
        }
      }
    }
    return [];
  }
}