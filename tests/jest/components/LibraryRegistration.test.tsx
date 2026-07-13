import * as React from "react";
import { installFormDataShim } from "../testUtils/formDataShim";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LibraryRegistration from "../../../src/components/LibraryRegistration";
// The reusable-components `Form` builds `new FormData(formElement)` on
// submit, which the unit jsdom env's undici FormData rejects; install the
// shared shim that reads the form's successful controls.
installFormDataShim();
const protocol = "protocol 1";
const serviceData = { id: 1, protocol };

const makeProtocols = (overrides: Record<string, unknown> = {}) => [
  {
    name: protocol,
    label: "protocol 1 label",
    supports_registration: true,
    supports_staging: true,
    settings: [],
    library_settings: [],
    ...overrides,
  },
];

const allLibraries = [
  { short_name: "nypl", name: "New York Public Library", uuid: "1" },
  { short_name: "bpl", name: "Brooklyn Public Library", uuid: "2" },
  { short_name: "qpl", name: "Queens Public Library", uuid: "3" },
];

const libraryRegistrations = [
  {
    id: 1,
    libraries: [
      { short_name: "nypl", status: "success", stage: "production" },
      { short_name: "bpl", status: "failure", stage: "testing" },
    ],
  },
];

const makeData = (overrides: Record<string, unknown> = {}) => ({
  discovery_services: [serviceData],
  protocols: makeProtocols(),
  allLibraries,
  libraryRegistrations,
  ...overrides,
});

const renderReg = ({
  data,
  registerLibrary,
  ...props
}: Record<string, any> = {}) => {
  const register = registerLibrary ?? jest.fn();
  const result = render(
    <LibraryRegistration
      disabled={false}
      data={(data ?? makeData()) as any}
      save={jest.fn()}
      urlBase="url base"
      listDataKey="discovery_services"
      registerLibrary={register}
      protocol={protocol}
      {...props}
    />
  );
  return { ...result, registerLibrary: register };
};

const libraries = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      ".service-with-registrations-library"
    )
  );
const registrationInfos = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(".library-registration-info")
  );

describe("LibraryRegistration", () => {
  describe("rendering", () => {
    it("doesn't render libraries in create form", () => {
      // No `item` prop => nothing rendered.
      const { container } = renderReg();
      expect(libraries(container)).toHaveLength(0);
    });

    it("doesn't render libraries in edit form if protocol doesn't support registration", () => {
      const { container } = renderReg({
        item: serviceData,
        data: makeData({
          protocols: makeProtocols({ supports_registration: false }),
        }),
      });
      expect(libraries(container)).toHaveLength(0);
    });

    it("treats a protocol that is absent from the list as unsupported", () => {
      // protocolSupportsType falls through to `false` when the selected protocol
      // matches no entry in data.protocols, so no registration UI renders.
      const { container } = renderReg({
        item: serviceData,
        protocol: "protocol-not-in-the-list",
      });
      expect(libraries(container)).toHaveLength(0);
    });

    it("renders all libraries in edit form, with registration status", () => {
      const { container } = renderReg({ item: serviceData });
      const libs = libraries(container);
      expect(libs).toHaveLength(3);

      expect(libs[0]).toHaveTextContent("New York Public Library");
      expect(libs[0]).toHaveTextContent("Registered");
      expect(libs[1]).toHaveTextContent("Brooklyn Public Library");
      expect(libs[1]).toHaveTextContent("Registration failed");
      expect(libs[2]).toHaveTextContent("Queens Public Library");
      expect(libs[2]).toHaveTextContent("Not registered");
    });

    it("provides links to the libraries' edit forms", () => {
      const { container } = renderReg({ item: serviceData });
      const libs = libraries(container);
      expect(libs).toHaveLength(3);

      expect(libs[0].querySelector("a")).toHaveAttribute(
        "href",
        "/admin/web/config/libraries/edit/1"
      );
      expect(libs[1].querySelector("a")).toHaveAttribute(
        "href",
        "/admin/web/config/libraries/edit/2"
      );
      expect(libs[2].querySelector("a")).toHaveAttribute(
        "href",
        "/admin/web/config/libraries/edit/3"
      );
    });

    it("should not render the staging dropdown if it is not supported", () => {
      const { container } = renderReg({
        item: serviceData,
        data: makeData({
          protocols: makeProtocols({ supports_staging: false }),
        }),
      });
      const infos = registrationInfos(container);
      expect(infos).toHaveLength(3);

      // No current-stage section and no stage dropdown for any library.
      infos.forEach((info) => {
        expect(info.querySelector(".current-stage")).not.toBeInTheDocument();
        expect(info.querySelector("select")).not.toBeInTheDocument();
      });

      // Registration status and button still appear. The first span in each
      // info is the status span.
      const [nypl, bpl, qpl] = infos;
      expect(nypl.querySelector("span")).toHaveTextContent("Registered");
      expect(nypl.querySelector("span")).toHaveClass("bg-success");
      expect(bpl.querySelector("span")).toHaveTextContent(
        "Registration failed"
      );
      expect(bpl.querySelector("span")).toHaveClass("bg-danger");
      expect(qpl.querySelector("span")).toHaveTextContent("Not registered");
      expect(qpl.querySelector("span")).toHaveClass("bg-warning");

      expect(nypl.querySelector("button")).toHaveTextContent(
        "Update registration"
      );
      expect(bpl.querySelector("button")).toHaveTextContent(
        "Retry registration"
      );
      expect(qpl.querySelector("button")).toHaveTextContent("Register");
    });

    it("should render the current registration stage", () => {
      // An additional library shows the current stage when it is in the
      // "testing" stage and its registration was successful.
      const libraryRegistrationsWBoston = [
        {
          id: 1,
          libraries: [
            { short_name: "nypl", status: "success", stage: "production" },
            { short_name: "bpl", status: "failure", stage: "testing" },
            { short_name: "boston", status: "success", stage: "testing" },
          ],
        },
      ];
      const allLibrariesWBoston = [
        ...allLibraries,
        { short_name: "boston", name: "Boston Public Library", uuid: "4" },
      ];
      const { container } = renderReg({
        item: serviceData,
        data: makeData({
          allLibraries: allLibrariesWBoston,
          libraryRegistrations: libraryRegistrationsWBoston,
        }),
      });
      const [nypl, bpl, qpl, boston] = registrationInfos(container);

      expect(nypl.querySelector(".current-stage span")).toHaveTextContent(
        "Current Stage: production"
      );
      expect(bpl.querySelector(".current-stage span")).toHaveTextContent(
        "No current stage"
      );
      expect(qpl.querySelector(".current-stage span")).toHaveTextContent(
        "No current stage"
      );
      expect(boston.querySelector(".current-stage span")).toHaveTextContent(
        "Current Stage: testing"
      );
    });

    it("should render a registration stage type dropdown with two options", () => {
      const { container } = renderReg({ item: serviceData });
      const bpl = registrationInfos(container)[1];
      const options = bpl.querySelectorAll("option");
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent("Testing");
      expect(options[1]).toHaveTextContent("Production");
    });

    it("should render a registration stage select if the library is not in production", () => {
      const { container } = renderReg({ item: serviceData });
      const [nypl, bpl, qpl] = registrationInfos(container);

      // Once a library is registered in production, the dropdown is removed.
      expect(nypl.querySelectorAll("select")).toHaveLength(0);
      expect(bpl.querySelectorAll("select")).toHaveLength(1);
      expect(qpl.querySelectorAll("select")).toHaveLength(1);
    });

    it("should render a form", () => {
      // The status of each library determines its button text. (The
      // `checked`/`library` props of each form are only DOM-observable through
      // the button text and status here, since there is no terms-of-service
      // checkbox in this data.)
      const { container } = renderReg({ item: serviceData });
      const libs = libraries(container);

      expect(libs[0]).toHaveTextContent("New York Public Library");
      expect(libs[0].querySelector("button")).toHaveTextContent(
        "Update registration"
      );
      expect(libs[1]).toHaveTextContent("Brooklyn Public Library");
      expect(libs[1].querySelector("button")).toHaveTextContent(
        "Retry registration"
      );
      expect(libs[2]).toHaveTextContent("Queens Public Library");
      expect(libs[2].querySelector("button")).toHaveTextContent("Register");
    });
  });

  describe("behavior", () => {
    it("registers a library", async () => {
      const user = userEvent.setup();
      const registerLibrary = jest.fn();
      const { container } = renderReg({ item: serviceData, registerLibrary });
      const libs = libraries(container);
      expect(registerLibrary).not.toHaveBeenCalled();

      await user.click(libs[0].querySelector("button"));
      expect(registerLibrary).toHaveBeenCalledTimes(1);
      // nypl is registered in production, so it always registers in production.
      expect(registerLibrary.mock.calls[0][0]).toMatchObject({
        short_name: "nypl",
      });
      expect(registerLibrary.mock.calls[0][1]).toBe("production");

      await user.click(libs[1].querySelector("button"));
      expect(registerLibrary).toHaveBeenCalledTimes(2);
      // bpl defaults to the "testing" stage.
      expect(registerLibrary.mock.calls[1][0]).toMatchObject({
        short_name: "bpl",
      });
      expect(registerLibrary.mock.calls[1][1]).toBe("testing");

      await user.click(libs[2].querySelector("button"));
      expect(registerLibrary).toHaveBeenCalledTimes(3);
      expect(registerLibrary.mock.calls[2][0]).toMatchObject({
        short_name: "qpl",
      });
      expect(registerLibrary.mock.calls[2][1]).toBe("testing");
    });

    it("registers each library with the stage selected from its own dropdown", async () => {
      const user = userEvent.setup();
      const registerLibrary = jest.fn();
      const { container } = renderReg({ item: serviceData, registerLibrary });
      const [, bpl, qpl] = registrationInfos(container);

      // Choosing "production" for bpl registers bpl in production...
      await user.selectOptions(bpl.querySelector("select"), "production");
      await user.click(bpl.querySelector("button"));
      expect(registerLibrary.mock.calls[0][0]).toMatchObject({
        short_name: "bpl",
      });
      expect(registerLibrary.mock.calls[0][1]).toBe("production");

      // ...without affecting qpl, which still defaults to "testing".
      await user.click(qpl.querySelector("button"));
      expect(registerLibrary.mock.calls[1][0]).toMatchObject({
        short_name: "qpl",
      });
      expect(registerLibrary.mock.calls[1][1]).toBe("testing");

      // Each library's dropdown updates its own stage independently.
      await user.selectOptions(qpl.querySelector("select"), "production");
      await user.click(qpl.querySelector("button"));
      expect(registerLibrary.mock.calls[2][0]).toMatchObject({
        short_name: "qpl",
      });
      expect(registerLibrary.mock.calls[2][1]).toBe("production");
    });
  });
});
