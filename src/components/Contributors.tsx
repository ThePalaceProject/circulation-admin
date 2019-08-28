import * as React from "react";
import EditableInput from "./EditableInput";
import { Button } from "library-simplified-reusable-components";
import { ContributorData, RolesData } from "../interfaces";
import WithRemoveButton from "./WithRemoveButton";

export interface ContributorsProps {
  roles: RolesData;
  contributors?: ContributorData[];
  disabled?: boolean;
}

export interface ContributorsState {
  contributors: ContributorData[];
  disabled: boolean;
}

export default class Contributors extends React.Component<ContributorsProps, ContributorsState> {
  private addContributorRole = React.createRef<EditableInput>();
  private addContributorName = React.createRef<EditableInput>();

  constructor(props) {
    super(props);
    this.state = { contributors: this.props.contributors || [], disabled: true };
    this.addContributor = this.addContributor.bind(this);
    this.removeContributor = this.removeContributor.bind(this);
    this.toggleDisabled = this.toggleDisabled.bind(this);
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

  /** The component for adding a new contributor; menu, input field, and add button. */
  newContributor(): JSX.Element {
    const newRoleRef = this.addContributorRole.current;
    const newRoleValue = newRoleRef && newRoleRef.getValue();
    let disabled = this.state.disabled || this.props.disabled;
    return (
      <span className="contributor-form">
        { this.contributorSelect(newRoleValue, true) }
        { this.contributorField() }
        <Button
          type="button"
          className="add-contributor small"
          disabled={disabled}
          callback={this.addContributor}
          content="Add"
        />
      </span>
    );
  }

  /** The drop-down list of all the possible contributor roles. */
  contributorSelect(contributorRole?: string, isNew: boolean = false): JSX.Element {
    return (
      <EditableInput
        elementType="select"
        disabled={this.props.disabled}
        name="contributor-role"
        value={contributorRole || "Author"}
        ref={isNew && this.addContributorRole}
       >
        { this.props.roles && Object.values(this.props.roles).map(role =>
            <option value={role} key={role} aria-selected={contributorRole === role}>{role}</option>
          )
        }
      </EditableInput>
    );
  }

  /** The input field containing the name of the contributor. */
  contributorField(contributor?: ContributorData) {
    return(
      <EditableInput
        elementType="input"
        type="text"
        disabled={this.props.disabled}
        name="contributor-name"
        value={contributor && contributor.name}
        ref={!contributor && this.addContributorName}
        onChange={this.toggleDisabled}
        optionalText={false}
      />
    );
  }

  existingContributors(): JSX.Element[] {
    /** The list of one or more existing contributors; each row has menu, input field, and delete button. */
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

  toggleDisabled(val) {
    // If the input field for the new contributor's name is blank, the Add button will be disabled.
    this.setState({ disabled: val.length < 1});
  }

  getContributorRole(contributor: ContributorData): string {
    if (this.props.roles) {
      if (this.props.roles[contributor.role]) {
        return this.props.roles[contributor.role];
      }
    }
    return contributor.role;
  }

  removeContributor(contributor: ContributorData) {
    const remainingContributors = this.state.contributors.filter(stateContributor => {
      return !(stateContributor.name === contributor.name && stateContributor.role === contributor.role);
    });
    this.setState({ contributors: remainingContributors });
  }

  addContributor() {
    const name = (this.addContributorName.current).getValue();
    const role = (this.addContributorRole.current).getValue();
    this.setState({
      contributors: this.state.contributors.concat({ role, name }),
      disabled: true
    });
    (this.addContributorName.current).clear();
    (this.addContributorRole.current).setValue("Author");
  }

}
