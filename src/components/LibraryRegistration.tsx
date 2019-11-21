import * as React from "react";
import { ServiceEditFormProps } from "./ServiceEditForm";
import EditableInput from "./EditableInput";
import LibraryRegistrationForm from "./LibraryRegistrationForm";
import { ServicesWithRegistrationsData, LibraryDataWithStatus, LibraryRegistrationData, LibraryData } from "../interfaces";

export interface LibraryRegistrationState {
  registration_stage?: { [key: string]: string } | null;
  protocol: string;
}

export interface LibraryRegistrationProps extends ServiceEditFormProps<ServicesWithRegistrationsData> {
  registerLibrary: (library, registration_stage) => void;
  protocol: string;
}

export default class LibraryRegistration extends React.Component<LibraryRegistrationProps, LibraryRegistrationState> {
  MESSAGES = {
      "success": { statusText: "Registered", buttonText: "Update registration" },
      "warning": { statusText: "Not registered", buttonText: "Register" },
      "failure": { statusText: "Registration failed", buttonText: "Retry registration" }
  };

  constructor(props) {
    super(props);

    this.state = {
      registration_stage: {},
      protocol: this.props.protocol,
    };

    this.register = this.register.bind(this);
    this.getStatus = this.getStatus.bind(this);
    this.libraryRegistrationItem = this.libraryRegistrationItem.bind(this);
    this.name = this.name.bind(this);
    this.statusSpan = this.statusSpan.bind(this);
    this.currentStage = this.currentStage.bind(this);
    this.registrationStageDropdown = this.registrationStageDropdown.bind(this);
    this.updateRegistrationStage = this.updateRegistrationStage.bind(this);
    this.libraryRegistrationForm = this.libraryRegistrationForm.bind(this);
    this.getLibraryInfo = this.getLibraryInfo.bind(this);
    this.getLibraryProp = this.getLibraryProp.bind(this);
    this.protocolSupportsType = this.protocolSupportsType.bind(this);
  }

  render(): JSX.Element {
    if (this.props.item && this.protocolSupportsType("supports_registration") &&
      this.props.data && this.props.data.allLibraries && this.props.data.allLibraries.length > 0) {
      return (
        <div>
          <h2>Register libraries</h2>
          <ul>
          { this.props.data.allLibraries.map((library, idx) => this.libraryRegistrationItem(library, idx)) }
          </ul>
        </div>
      );
    }
    return null;
  }

  register(library: LibraryDataWithStatus): void {
    const registration_stage =
      (this.state.registration_stage && this.state.registration_stage[library.short_name]) || "testing";
    let stage = this.getLibraryProp(library, "stage") === "production" ? "production" : registration_stage;
    this.props.registerLibrary(library, stage);
  }

  getStatus(library: LibraryData): string {
    const libraryRegistrationStatus = this.getLibraryProp(library, "status") || "warning";
    return libraryRegistrationStatus;
  }

  libraryRegistrationItem(library: LibraryData, idx: number): JSX.Element {
    let statusString = this.getStatus(library);
    return (
      <li className="service-with-registrations-library" key={library.short_name}>
        { this.name(library) }
        <div className="library-registration-info">
          { this.currentStage(library, statusString) }
          { this.statusSpan(statusString) }
          { this.libraryRegistrationForm(library, statusString, this.props.data.libraryRegistrations && this.props.data.libraryRegistrations[idx]) }
        </div>
      </li>
    );
  }

  name(library: LibraryData): JSX.Element {
    return (
      <div className="library-name">
        <a href={`/admin/web/config/libraries/edit/${library.uuid}`}>
          {library.name}
        </a>
      </div>
    );
  }

  statusSpan(status: string): JSX.Element {
    let className = status === "failure" ? "bg-danger" : `bg-${status}`;
    return (
      <span className={className}>{this.MESSAGES[status].statusText}</span>
    );
  }

  currentStage(library: LibraryData, libraryRegistrationStatus: string): JSX.Element | null {
    if (this.protocolSupportsType("supports_staging")) {
      const currentRegistryStage = this.getLibraryProp(library, "stage");
      return (
        <div className="current-stage">
          { (currentRegistryStage && libraryRegistrationStatus !== "failure") ?
            <span>Current Stage: {currentRegistryStage}</span> :
            <span>No current stage</span>
          }
          { this.registrationStageDropdown(library, currentRegistryStage) }
        </div>
      );
    }
    return null;
  }

  registrationStageDropdown(library: LibraryData, currentRegistryStage: string): JSX.Element | null {
    if (currentRegistryStage === "production") {
      return null;
    }
    return (
      <EditableInput
        elementType="select"
        name="registration_stage"
        label="Stage"
        value={currentRegistryStage || "testing"}
        ref={`stage-${library.short_name}`}
        onChange={() => this.updateRegistrationStage(library)}
      >
        <option value="testing" aria-selected={currentRegistryStage === "testing"}>Testing</option>
        <option value="production" aria-selected={currentRegistryStage === "production"}>Production</option>
      </EditableInput>
    );
  }

  libraryRegistrationForm(library: LibraryData, status: string, registrationData: LibraryRegistrationData): JSX.Element {
    return (
      <LibraryRegistrationForm
        library={library}
        register={this.register}
        buttonText={this.MESSAGES[status].buttonText}
        checked={status === "success"}
        disabled={this.props.disabled}
        registrationData={registrationData}
      />
    );
  }

  updateRegistrationStage(library: LibraryData): void {
    const registration_stage = (this.refs[`stage-${library.short_name}`] as any).getValue();
    this.setState({
      registration_stage: Object.assign(
        {}, this.state.registration_stage, { [library.short_name]: registration_stage }
      ),
      protocol: this.state.protocol,
    });
  }

  getLibraryInfo(library: LibraryData): LibraryDataWithStatus | null {
    const serviceId = this.props.item && this.props.item.id;
    const libraryRegistrations = this.props.data && this.props.data.libraryRegistrations || [];
    for (const serviceInfo of libraryRegistrations) {
      if (serviceInfo.id === serviceId) {
        for (const libraryInfo of serviceInfo.libraries) {
          if (libraryInfo.short_name === library.short_name) {
            return libraryInfo;
          }
        }
      }
    }
    return null;
  }

  getLibraryProp(library: LibraryData, prop: string): string | null {
    const libraryInfo = this.getLibraryInfo(library);
    return libraryInfo && libraryInfo[prop];
  }

  protocolSupportsType(prop: string): boolean {
    if (this.state.protocol && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          return !!protocol[prop];
        }
      }
    }
    return false;
  }
}
