import * as React from "react";
import * as PropTypes from "prop-types";
import { render } from "@testing-library/react";
import { renderWithProviders } from "../testUtils/withProviders";
import ServiceWithRegistrationsEditForm from "../../../src/components/config/ServiceWithRegistrationsEditForm";
import { DiscoveryServicesData } from "../../../src/interfaces";

jest.mock("../../../src/components/config/LibraryRegistration", () => {
  const MockLibraryRegistration = (props: any) => (
    <div
      data-testid="library-registration"
      data-protocol={props.protocol}
      data-url-base={props.urlBase}
      data-list-data-key={props.listDataKey}
      data-disabled={String(props.disabled)}
    />
  );
  MockLibraryRegistration.displayName = "MockLibraryRegistration";
  return { __esModule: true, default: MockLibraryRegistration };
});

class DiscoveryServiceEditForm extends ServiceWithRegistrationsEditForm<
  DiscoveryServicesData
> {}

const serviceData = { id: 1, protocol: "protocol 1" };
const protocolsData = [
  {
    name: "protocol 1",
    label: "protocol 1 label",
    supports_registration: true,
    settings: [],
    library_settings: [],
  },
];
const allLibraries = [
  { short_name: "nypl", name: "New York Public Library" },
  { short_name: "bpl", name: "Brooklyn Public Library" },
];
const libraryRegistrationsData = [
  {
    id: 1,
    libraries: [
      { short_name: "nypl", status: "success", stage: "production" },
      { short_name: "bpl", status: "failure", stage: "testing" },
    ],
  },
];
const servicesData = {
  discovery_services: [serviceData],
  protocols: protocolsData,
  allLibraries: allLibraries,
  libraryRegistrations: libraryRegistrationsData,
} as DiscoveryServicesData;

const save = jest.fn();

// ServiceWithRegistrationsEditForm needs registerLibrary from legacy context
class RegisterContextProvider extends React.Component<{
  children: React.ReactNode;
}> {
  static childContextTypes = {
    registerLibrary: PropTypes.func,
  };
  getChildContext() {
    return { registerLibrary: jest.fn() };
  }
  render() {
    return <>{this.props.children}</>;
  }
}

describe("ServiceWithRegistrationsEditForm", () => {
  it("renders LibraryRegistration with correct props", () => {
    const { getByTestId } = renderWithProviders(
      <RegisterContextProvider>
        <DiscoveryServiceEditForm
          disabled={false}
          data={servicesData}
          save={save}
          urlBase="url base"
          listDataKey="discovery_services"
        />
      </RegisterContextProvider>
    );
    const lr = getByTestId("library-registration");
    expect(lr).toBeInTheDocument();
    expect(lr.getAttribute("data-url-base")).toBe("url base");
    expect(lr.getAttribute("data-list-data-key")).toBe("discovery_services");
    expect(lr.getAttribute("data-disabled")).toBe("false");
  });
});
