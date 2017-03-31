import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { AdminAuthServiceData } from "../interfaces";
import { State } from "../reducers/index";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import AdminAuthServiceEditForm from "./AdminAuthServiceEditForm";

export interface AdminAuthServicesProps {
  store?: Store<State>;
  adminAuthServices?: AdminAuthServiceData[];
  providers?: string[];
  fetchError?: FetchErrorData;
  fetchAdminAuthServices?: () => Promise<any>;
  editAdminAuthService?: (data: FormData) => Promise<any>;
  isFetching?: boolean;
  csrfToken: string;
  editOrCreate?: string;
  identifier?: string;
}

export class AdminAuthServices extends React.Component<AdminAuthServicesProps, any> {
  constructor(props) {
    super(props);
    this.editAdminAuthService = this.editAdminAuthService.bind(this);
  }

  render(): JSX.Element {
    return (
      <div>
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} />
        }
        { this.props.isFetching &&
          <LoadingIndicator />
        }

        { !this.props.isFetching && !this.props.editOrCreate && this.props.adminAuthServices && this.props.adminAuthServices.length > 0 &&
          <div>
            <h2>Edit Admin Authentication Services</h2>
            <ul>
              { this.props.adminAuthServices && this.props.adminAuthServices.map((adminAuthService, index) =>
                  <li key={index}>
                    <h3>{adminAuthService.name}</h3>
                    <a href={"/admin/web/config/adminAuth/edit/" + adminAuthService.name}>Edit admin authentication service</a>
                  </li>
                )
              }
            </ul>
          </div>
        }

        { !this.props.isFetching && !this.props.editOrCreate &&
          <a href="/admin/web/config/adminAuth/create">Create a new admin authentication service</a>
        }

        { !this.props.isFetching && (this.props.editOrCreate === "create") &&
          <div>
            <h2>Create a new admin authentication service</h2>
            <AdminAuthServiceEditForm
              providers={this.props.providers}
              csrfToken={this.props.csrfToken}
              disabled={this.props.isFetching}
              editAdminAuthService={this.editAdminAuthService}
              />
          </div>
        }

        { !this.props.isFetching && this.adminAuthServiceToEdit() &&
          <div>
            <h2>Edit admin authentication service</h2>
            <AdminAuthServiceEditForm
              adminAuthService={this.adminAuthServiceToEdit()}
              providers={this.props.providers}
              csrfToken={this.props.csrfToken}
              disabled={this.props.isFetching}
              editAdminAuthService={this.editAdminAuthService}
              />
          </div>
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.fetchAdminAuthServices) {
      this.props.fetchAdminAuthServices();
    }
  }

  editAdminAuthService(data: FormData) {
    return this.props.editAdminAuthService(data).then(this.props.fetchAdminAuthServices);
  }

  adminAuthServiceToEdit() {
    if (this.props.editOrCreate === "edit" && this.props.adminAuthServices) {
      for (const adminAuthService of this.props.adminAuthServices) {
        if (adminAuthService.name === this.props.identifier) {
          return adminAuthService;
        }
      }
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    adminAuthServices: state.editor.adminAuthServices && state.editor.adminAuthServices.data && state.editor.adminAuthServices.data.admin_auth_services,
    providers: state.editor.adminAuthServices && state.editor.adminAuthServices.data && state.editor.adminAuthServices.data.providers,
    fetchError: state.editor.adminAuthServices.fetchError,
    isFetching: state.editor.adminAuthServices.isFetching || state.editor.adminAuthServices.isEditing
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchAdminAuthServices: () => dispatch(actions.fetchAdminAuthServices()),
    editAdminAuthService: (data: FormData) => dispatch(actions.editAdminAuthService(data))
  };
}

const ConnectedAdminAuthServices = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(AdminAuthServices);

export default ConnectedAdminAuthServices;