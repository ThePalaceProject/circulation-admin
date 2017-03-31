import * as React from "react";
import EditableInput from "./EditableInput";
import { AdminAuthServiceData } from "../interfaces";

export interface AdminAuthServiceEditFormProps {
  adminAuthService?: AdminAuthServiceData;
  csrfToken: string;
  disabled: boolean;
  providers: string[];
  editAdminAuthService: (data: FormData) => Promise<any>;
}

export default class AdminAuthServiceEditForm extends React.Component<AdminAuthServiceEditFormProps, any> {
  constructor(props) {
    super(props);
    let defaultProvider;
    if (this.props.providers && this.props.providers.length) {
      defaultProvider = this.props.providers[0];
    }
    this.state = {
      provider: (this.props.adminAuthService && this.props.adminAuthService.provider) || defaultProvider,
      domains: (this.props.adminAuthService && this.props.adminAuthService["domains"]) || []
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
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          readOnly={!!(this.props.adminAuthService && this.props.adminAuthService.name)}
          name="name"
          label="Name"
          value={this.props.adminAuthService && this.props.adminAuthService.name}
          />
        <EditableInput
          elementType="select"
          disabled={this.props.disabled}
          readOnly={!!(this.props.adminAuthService && this.props.adminAuthService.provider)}
          name="provider"
          label="Provider"
          value={this.state.provider}
          ref="provider"
          onChange={this.handleProviderChange}
          >
          { this.props.providers && this.props.providers.length > 0 && this.props.providers.map(provider =>
              <option key={provider} value={provider}>{provider}</option>
            )
          }
        </EditableInput>
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name="url"
          label="Authentication URI"
          value={this.props.adminAuthService && this.props.adminAuthService["url"] || "https://accounts.google.com/o/oauth2/auth" }
          />
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name="username"
          label="Client ID"
          value={this.props.adminAuthService && this.props.adminAuthService["username"]}
          />
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name="password"
          label="Client Secret"
          value={this.props.adminAuthService && this.props.adminAuthService["password"]}
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
        <button
          type="submit"
          className="btn btn-default"
          disabled={this.props.disabled}
          >Submit</button>
      </form>
    );
  }

  componentWillReceiveProps(newProps) {
    if (newProps.adminAuthService && newProps.adminAuthService.provider) {
      if (!this.props.adminAuthService || !this.props.adminAuthService.provider || (this.props.adminAuthService.provider !== newProps.adminAuthService.provider)) {
        this.setState({ provider: newProps.adminAuthService.provider });
      }
    }
    if (newProps.adminAuthService && newProps.adminAuthService["domains"]) {
     if (!this.props.adminAuthService || !this.props.adminAuthService["domains"] || (this.props.adminAuthService["domains"] !== newProps.adminAuthService["domains"])) {
       this.setState({ domains: newProps.adminAuthService["domains"] });
     }
    }
  }

  save(event) {
    event.preventDefault();

    const data = new (window as any).FormData(this.refs["form"] as any);
    data.append("domains", JSON.stringify(this.state.domains));
    this.props.editAdminAuthService(data).then(() => {
      // If a new admin auth service was created, go to its edit page.
      if (!this.props.adminAuthService && data.get("name")) {
        window.location.href = "/admin/web/config/adminAuth/edit/" + data.get("name");
      }
    });
  }

  handleProviderChange() {
    const provider = (this.refs["provider"] as any).getValue();
    this.setState({ provider });
  }

  removeDomain(domain: string) {
    this.setState({ domains: this.state.domains.filter(stateDomain => stateDomain !== domain) });
  }

  addDomain() {
    const domain = (this.refs["addDomain"] as any).value;
    if (this.state.domains.indexOf(domain) === -1) {
      this.setState({ domains: this.state.domains.concat([domain]) });
    }
  }
}