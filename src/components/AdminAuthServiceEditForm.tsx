import * as React from "react";
import EditableInput from "./EditableInput";
import { AdminAuthServicesData, AdminAuthServiceData } from "../interfaces";

export interface AdminAuthServiceEditFormProps {
  data: AdminAuthServicesData;
  item?: AdminAuthServiceData;
  csrfToken: string;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
}

export interface AdminAuthServiceEditFormState {
  provider: string;
  domains: string[];
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
    let defaultProvider;
    if (this.props.data && this.props.data.providers && this.props.data.providers.length) {
      defaultProvider = this.props.data.providers[0];
    }
    this.state = {
      provider: (this.props.item && this.props.item.provider) || defaultProvider,
      domains: (this.props.item && this.props.item["domains"]) || []
    };
    this.handleProviderChange = this.handleProviderChange.bind(this);
    this.addDomain = this.addDomain.bind(this);
    this.removeDomain = this.removeDomain.bind(this);
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
          readOnly={!!(this.props.item && this.props.item.provider)}
          name="provider"
          label="Provider"
          value={this.state.provider}
          ref="provider"
          onChange={this.handleProviderChange}
          >
          { this.props.data && this.props.data.providers && this.props.data.providers.length > 0 && this.props.data.providers.map(provider =>
              <option key={provider} value={provider}>{provider}</option>
            )
          }
        </EditableInput>
        { this.state.provider === "Google OAuth" &&
          <div>
            <EditableInput
              elementType="input"
              type="text"
              disabled={this.props.disabled}
              name="url"
              label="Authentication URI"
              value={this.props.item && this.props.item["url"] || "https://accounts.google.com/o/oauth2/auth" }
              />
            <EditableInput
              elementType="input"
              type="text"
              disabled={this.props.disabled}
              name="username"
              label="Client ID"
              value={this.props.item && this.props.item["username"]}
              />
            <EditableInput
              elementType="input"
              type="text"
              disabled={this.props.disabled}
              name="password"
              label="Client Secret"
              value={this.props.item && this.props.item["password"]}
              />
            <div className="form-group">
              <label>Allowed Domains</label>
              { this.state.domains.map(domain =>
                  <div key={domain} className="admin-auth-service-domain">
                    <div>{domain}</div>
                    <i
                      className="fa fa-times"
                      aria-hidden="true"
                      onClick={() => !this.props.disabled && this.removeDomain(domain)}
                      ></i>
                    <a
                      className="sr-only"
                      onClick={() => !this.props.disabled && this.removeDomain(domain)}
                      >remove</a>
                  </div>
                )
              }
            </div>
            <div className="form-group">
              <input
                type="text"
                name="add-domain"
                label="Add an allowed domain"
                ref="addDomain"
                />
              <button
                type="button"
                className="btn btn-default add-domain"
                disabled={this.props.disabled}
                onClick={this.addDomain}
                >Add Domain</button>
            </div>
          </div>
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
    let provider = this.state.provider;
    let domains = this.state.domains;
    if (newProps.item && newProps.item.provider) {
      if (!this.props.item || !this.props.item.provider || (this.props.item.provider !== newProps.item.provider)) {
        provider =  newProps.item.provider;
      }
    }
    if (newProps.item && newProps.item["domains"]) {
     if (!this.props.item || !this.props.item["domains"] || (this.props.item["domains"] !== newProps.item["domains"])) {
       domains =  newProps.item["domains"];
     }
    }
    this.setState({ provider, domains });
  }

  save(event) {
    event.preventDefault();

    const data = new (window as any).FormData(this.refs["form"] as any);
    data.append("domains", JSON.stringify(this.state.domains));
    this.props.editItem(data).then(() => {
      // If we're setting up admin auth for the first time, refresh the page
      // to go to login.
      if (this.context.settingUp) {
        window.location.reload();
        return;
      }

      // If a new admin auth service was created, go to its edit page.
      if (!this.props.item && data.get("name")) {
        window.location.href = "/admin/web/config/adminAuth/edit/" + data.get("name");
      }
    });
  }

  handleProviderChange() {
    const provider = (this.refs["provider"] as any).getValue();
    this.setState({ provider, domains: this.state.domains });
  }

  removeDomain(domain: string) {
    this.setState({
      provider: this.state.provider,
      domains: this.state.domains.filter(stateDomain => stateDomain !== domain)
    });
  }

  addDomain() {
    const domain = (this.refs["addDomain"] as any).value;
    if (this.state.domains.indexOf(domain) === -1) {
      this.setState({
        provider: this.state.provider,
        domains: this.state.domains.concat([domain])
      });
    }
  }
}