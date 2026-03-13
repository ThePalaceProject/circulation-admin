import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LibraryRegistration from "../../../src/components/config/LibraryRegistration";

// Mock LibraryRegistrationForm to avoid rendering its internal Form/terms logic
jest.mock("../../../src/components/config/LibraryRegistrationForm", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  function LibraryRegistrationFormMock(props: any) {
    return (
      <div data-testid="lib-reg-form" data-library-name={props.library?.name}>
        <button
          onClick={() => !props.disabled && props.register(props.library)}
          disabled={props.disabled}
          className="reg-button"
        >
          {props.buttonText}
        </button>
      </div>
    );
  }
  return LibraryRegistrationFormMock;
});

// ── Fixtures ─────────────────────────────────────────────────────────────────
const protocol = "protocol 1";
const serviceData = { id: 1, protocol };
const protocolsData = [
  {
    name: protocol,
    label: "protocol 1 label",
    supports_registration: true,
    supports_staging: true,
    settings: [],
    library_settings: [],
  },
];
const allLibraries = [
  { short_name: "nypl", name: "New York Public Library", uuid: "1" },
  { short_name: "bpl", name: "Brooklyn Public Library", uuid: "2" },
  { short_name: "qpl", name: "Queens Public Library", uuid: "3" },
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
  allLibraries,
  libraryRegistrations: libraryRegistrationsData,
};

function renderLibraryRegistration(
  props: Partial<React.ComponentProps<typeof LibraryRegistration>> = {}
) {
  const save = jest.fn();
  const registerLibrary = jest.fn();
  const defaultProps = {
    disabled: false,
    data: servicesData,
    save,
    urlBase: "url base",
    listDataKey: "discovery_services",
    registerLibrary,
    protocol,
  };
  return {
    save,
    registerLibrary,
    ...render(<LibraryRegistration {...defaultProps} {...props} />),
  };
}

describe("LibraryRegistration", () => {
  it("doesn't render libraries in create form (no item prop)", () => {
    renderLibraryRegistration();
    expect(
      document.querySelectorAll(".service-with-registrations-library").length
    ).toBe(0);
  });

  it("doesn't render libraries if protocol doesn't support registration", () => {
    const protocolWithoutRegistration = [
      { ...protocolsData[0], supports_registration: false },
    ];
    renderLibraryRegistration({
      item: serviceData,
      data: { ...servicesData, protocols: protocolWithoutRegistration },
    });
    expect(
      document.querySelectorAll(".service-with-registrations-library").length
    ).toBe(0);
  });

  it("renders all libraries in edit form with their names", () => {
    renderLibraryRegistration({ item: serviceData });
    const libraries = document.querySelectorAll(
      ".service-with-registrations-library"
    );
    expect(libraries.length).toBe(3);
    expect(libraries[0].textContent).toContain("New York Public Library");
    expect(libraries[1].textContent).toContain("Brooklyn Public Library");
    expect(libraries[2].textContent).toContain("Queens Public Library");
  });

  it("renders registration status: Registered, Registration failed, Not registered", () => {
    renderLibraryRegistration({ item: serviceData });
    const statuses = document.querySelectorAll(
      ".library-registration-info span"
    );
    const texts = Array.from(statuses).map((s) => s.textContent);
    expect(texts.some((t) => t.includes("Registered"))).toBe(true);
    expect(texts.some((t) => t.includes("Registration failed"))).toBe(true);
    expect(texts.some((t) => t.includes("Not registered"))).toBe(true);
  });

  it("provides links to libraries' edit forms", () => {
    renderLibraryRegistration({ item: serviceData });
    const libraries = document.querySelectorAll(
      ".service-with-registrations-library"
    );
    const link1 = libraries[0].querySelector("a");
    const link2 = libraries[1].querySelector("a");
    const link3 = libraries[2].querySelector("a");
    expect(link1.getAttribute("href")).toBe(
      "/admin/web/config/libraries/edit/1"
    );
    expect(link2.getAttribute("href")).toBe(
      "/admin/web/config/libraries/edit/2"
    );
    expect(link3.getAttribute("href")).toBe(
      "/admin/web/config/libraries/edit/3"
    );
  });

  it("should not render the staging dropdown if protocol doesn't support staging", () => {
    const noStagingData = {
      ...servicesData,
      protocols: [{ ...protocolsData[0], supports_staging: false }],
    };
    renderLibraryRegistration({ item: serviceData, data: noStagingData });
    expect(document.querySelectorAll(".current-stage").length).toBe(0);
    expect(document.querySelectorAll("select").length).toBe(0);
  });

  it("renders current stage for libraries: production/no stage/testing", () => {
    const libraryRegistrationsWithBoston = [
      {
        id: 1,
        libraries: [
          { short_name: "nypl", status: "success", stage: "production" },
          { short_name: "bpl", status: "failure", stage: "testing" },
          { short_name: "boston", status: "success", stage: "testing" },
        ],
      },
    ];
    const allLibrariesWithBoston = [
      ...allLibraries,
      { short_name: "boston", name: "Boston Public Library", uuid: "4" },
    ];
    renderLibraryRegistration({
      item: serviceData,
      data: {
        ...servicesData,
        allLibraries: allLibrariesWithBoston,
        libraryRegistrations: libraryRegistrationsWithBoston,
      },
    });
    const stageSpans = document.querySelectorAll(".current-stage span");
    const stageTexts = Array.from(stageSpans).map((s) => s.textContent);
    expect(stageTexts.some((t) => t.includes("production"))).toBe(true);
    expect(stageTexts.some((t) => t.includes("No current stage"))).toBe(true);
    expect(stageTexts.some((t) => t.includes("testing"))).toBe(true);
  });

  it("renders a stage dropdown with Testing and Production options for non-production libraries", () => {
    renderLibraryRegistration({ item: serviceData });
    // bpl is in "testing" stage → should have dropdown; nypl is "production" → no dropdown
    const selects = document.querySelectorAll("select");
    // bpl and qpl (not registered, treated as testing) get dropdowns; nypl (production) doesn't
    // We should see 2 selects (bpl + qpl)
    expect(selects.length).toBe(2);
    const options = Array.from(selects[0].querySelectorAll("option"));
    const optionTexts = options.map((o) => o.textContent);
    expect(optionTexts).toContain("Testing");
    expect(optionTexts).toContain("Production");
  });

  it("registers a library when button is clicked", () => {
    const { registerLibrary } = renderLibraryRegistration({
      item: serviceData,
    });
    const buttons = document.querySelectorAll(".reg-button");
    expect(registerLibrary).not.toHaveBeenCalled();
    fireEvent.click(buttons[0]);
    expect(registerLibrary).toHaveBeenCalledTimes(1);
    fireEvent.click(buttons[1]);
    expect(registerLibrary).toHaveBeenCalledTimes(2);
    fireEvent.click(buttons[2]);
    expect(registerLibrary).toHaveBeenCalledTimes(3);
  });

  it("updates registration stage state from dropdown", () => {
    renderLibraryRegistration({ item: serviceData });
    const selects = document.querySelectorAll("select") as NodeListOf<
      HTMLSelectElement
    >;
    // bpl's select (first dropdown)
    const bplSelect = selects[0];
    fireEvent.change(bplSelect, { target: { value: "production" } });
    // The stage select should now show production
    expect(bplSelect.value).toBe("production");
  });
});
