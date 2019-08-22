import * as React from "react";
import EditableInput from "./EditableInput";
import { Button } from "library-simplified-reusable-components";
import { ContributorData, RolesData } from "../interfaces";
import WithRemoveButton from "./WithRemoveButton";

export interface ContributorFormProps {
  roles: RolesData;
  contributors?: ContributorData[];
  disabled?: boolean;
}

export interface ContributorFormState {
  contributors: ContributorData[];
}

export default class ContributorForm extends React.Component<ContributorFormProps, ContributorFormState> {
  constructor(props) {
    super(props);
    this.state = { contributors: this.props.contributors || [] };
    this.addContributor = this.addContributor.bind(this);
    this.removeContributor = this.removeContributor.bind(this);
  }

  render(): JSX.Element {
    return (
      <div className="form-group">
        <label>Authors and Contributors</label>
        { this.existingContributors() }
        { this.newContributor() }
      </div>
    );
  }

  newContributor(): JSX.Element {
    // The component for adding a new contributor; menu, input field, and add button.
    const newRoleRef = this.refs["addContributorRole"] as any;
    const newRoleValue = newRoleRef && newRoleRef.getValue();
    return (
      <span className="contributor-form">
        { this.contributorSelect(newRoleValue, true) }
        { this.contributorField() }
        <Button
          type="button"
          className="add-contributor small"
          disabled={this.props.disabled}
          callback={this.addContributor}
          content="Add"
        />
      </span>
    );
  }

  contributorSelect(contributorRole?: string, isNew = false): JSX.Element {
    // The drop-down list of all the possible contributor roles.
    return (
      <EditableInput
        elementType="select"
        disabled={this.props.disabled}
        name="contributor-role"
        value={contributorRole || "Author"}
        ref={isNew && "addContributorRole"}
       >
        { this.props.roles && Object.values(this.props.roles).map(role =>
            <option value={role} key={role} aria-selected={contributorRole === role}>{role}</option>
          )
        }
      </EditableInput>
    );
  }

  contributorField(contributor?) {
    // The input field containing the name of the contributor.
    return(
      <EditableInput
        elementType="input"
        type="text"
        disabled={this.props.disabled}
        name="contributor-name"
        value={contributor && contributor.name}
        ref={!contributor && "addContributorName"}
        optionalText={false}
      />
    );
  }

  existingContributors() {
    // The list of one or more existing contributors; each row has menu, input field, and delete button.
    return this.state.contributors.map(contributor => {
      const contributorRole = this.getContributorRole(contributor);
      return (
        <WithRemoveButton
          key={contributor.name + contributor.role}
          disabled={this.props.disabled}
          onRemove={() => this.removeContributor(contributor)}
        >
          <span className="contributor-form">
            { this.contributorSelect(contributorRole) }
            { this.contributorField(contributor) }
          </span>
        </WithRemoveButton>
      );
    });
  }

  getContributorRole(contributor) {
    if (this.props.roles) {
      if (this.props.roles[contributor.role]) {
        return this.props.roles[contributor.role];
      }
    }
    return contributor.role;
  }

  removeContributor(contributor) {
    const remainingContributors = this.state.contributors.filter(stateContributor => {
      return !(stateContributor.name === contributor.name && stateContributor.role === contributor.role);
    });
    this.setState({ contributors: remainingContributors });
  }

  addContributor() {
    const name = (this.refs["addContributorName"] as any).getValue();
    const role = (this.refs["addContributorRole"] as any).getValue();
    this.setState({ contributors: this.state.contributors.concat({ role, name }) });
    (this.refs["addContributorName"] as any).clear();
    (this.refs["addContributorRole"] as any).clear();
  }

}
