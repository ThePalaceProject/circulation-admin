import * as React from "react";
import { render, screen } from "@testing-library/react";

import { DiscoveryServicesData } from "../../../src/interfaces";
import ServiceWithRegistrationsEditForm from "../../../src/components/ServiceWithRegistrationsEditForm";

// `ServiceWithRegistrationsEditForm` is generic/abstract over its data type;
// the legacy test subclassed it to bind the discovery-services data type.
class DiscoveryServiceEditForm extends ServiceWithRegistrationsEditForm<DiscoveryServicesData> {}

const serviceData = {
  id: 1,
  protocol: "protocol 1",
};
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
  { short_name: "qpl", name: "Queens Public Library" },
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
const servicesData: any = {
  discovery_services: [serviceData],
  protocols: protocolsData,
  allLibraries: allLibraries,
  libraryRegistrations: libraryRegistrationsData,
};

const renderForm = (save = jest.fn()) =>
  render(
    <DiscoveryServiceEditForm
      disabled={false}
      data={servicesData}
      item={serviceData as any}
      save={save}
      urlBase="url base"
      listDataKey="discovery_services"
    />
  );

describe("ServiceWithRegistrationsEditForm", () => {
  it("renders the underlying service edit form fields", () => {
    renderForm();

    // The base ServiceEditForm (via `super.render()`) contributes the Name text
    // field and the Required Fields section.
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Required Fields" })
    ).toBeInTheDocument();
  });

  it("renders a registration section reflecting each library's status", () => {
    renderForm();

    // The registration UI only renders when the protocol supports registration
    // and the data carries libraries — i.e. those props flowed to LibraryRegistration.
    expect(
      screen.getByRole("heading", { name: "Register libraries" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "New York Public Library" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Brooklyn Public Library" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Queens Public Library" })
    ).toBeInTheDocument();

    // Statuses come from `data.libraryRegistrations`.
    expect(screen.getByText("Registered")).toHaveClass("bg-success");
    expect(screen.getByText("Registration failed")).toHaveClass("bg-danger");
    expect(screen.getByText("Not registered")).toHaveClass("bg-warning");
  });

  it("enables the per-library registration actions when not disabled", () => {
    renderForm();

    // `disabled={false}` flows through to each registration button.
    const updateButton = screen.getByRole("button", {
      name: "Update registration",
    });
    const retryButton = screen.getByRole("button", {
      name: "Retry registration",
    });
    const registerButton = screen.getByRole("button", { name: "Register" });

    expect(updateButton).not.toBeDisabled();
    expect(retryButton).not.toBeDisabled();
    expect(registerButton).not.toBeDisabled();
  });
});
