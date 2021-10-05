import { expect } from "chai";
import * as React from "react";
import * as Enzyme from "enzyme";

import { ListManagerContext, ListManagerProvider } from "../ListManagerContext";

describe("ListManagerContext", () => {
  let wrapper: Enzyme.CommonWrapper<any, any, {}>;
  let library;
  let admin;
  beforeEach(() => {
    const TestComponent = () => {
      admin = React.useContext(ListManagerContext);
      library = admin.roles[0].library;
      return (
        <div className="context-test">
          {admin.isSystemAdmin() && <p>User is a system admin.</p>}
          {admin.isSitewideLibraryManager() && (
            <p>User is a sitewide library manager.</p>
          )}
          {admin.isSitewideLibrarian() && <p>User is a sitewide librarian.</p>}
          {admin.isLibraryManager(library) && <p>User is a library manager.</p>}
          {admin.isLibrarian(library) && <p>User is a librarian.</p>}
          {admin.isLibraryManagerOfSomeLibrary() && (
            <p>User is a library manager of some library.</p>
          )}
        </div>
      );
    };
    wrapper = Enzyme.mount(
      <ListManagerProvider
        email="test@test.com"
        roles={[{ library: "OWL", role: "librarian-all" }]}
      >
        <TestComponent />
      </ListManagerProvider>
    );
  });

  it("stores the email passed to it", () => {
    expect(admin.email).to.equal("test@test.com");
  });

  it("correctly handles the system role", () => {
    wrapper.setProps({
      roles: [{ library: "OWL", role: "system" }],
    });
    const library = wrapper.props().roles[0].library;
    expect(admin.isSystemAdmin()).to.equal(true);
    expect(admin.isSitewideLibraryManager()).to.equal(true);
    expect(admin.isSitewideLibrarian()).to.equal(true);
    expect(admin.isLibraryManager(library)).to.equal(true);
    expect(admin.isLibrarian(library)).to.equal(true);
    expect(admin.isLibraryManagerOfSomeLibrary()).to.equal(true);
  });

  it("correctly handles the manager-all role", () => {
    wrapper.setProps({
      roles: [{ library: "OWL", role: "manager-all" }],
    });
    const library = wrapper.props().roles[0].library;
    expect(admin.isSystemAdmin()).to.equal(false);
    expect(admin.isSitewideLibraryManager()).to.equal(true);
    expect(admin.isSitewideLibrarian()).to.equal(true);
    expect(admin.isLibraryManager(library)).to.equal(true);
    expect(admin.isLibrarian(library)).to.equal(true);
    expect(admin.isLibraryManagerOfSomeLibrary()).to.equal(true);
  });

  it("correctly handles the librarian-all role", () => {
    const library = wrapper.props().roles[0].library;
    expect(admin.isSystemAdmin()).to.equal(false);
    expect(admin.isSitewideLibraryManager()).to.equal(false);
    expect(admin.isSitewideLibrarian()).to.equal(true);
    expect(admin.isLibraryManager(library)).to.equal(false);
    expect(admin.isLibrarian(library)).to.equal(true);
    expect(admin.isLibraryManagerOfSomeLibrary()).to.equal(false);
  });

  it("correctly handles the manager role", () => {
    wrapper.setProps({
      roles: [{ library: "OWL", role: "manager" }],
    });
    const library = wrapper.props().roles[0].library;
    expect(admin.isSystemAdmin()).to.equal(false);
    expect(admin.isSitewideLibraryManager()).to.equal(false);
    expect(admin.isSitewideLibrarian()).to.equal(false);
    expect(admin.isLibraryManager(library)).to.equal(true);
    expect(admin.isLibrarian(library)).to.equal(true);
    expect(admin.isLibraryManagerOfSomeLibrary()).to.equal(true);
  });

  it("correctly handles the librarian role", () => {
    wrapper.setProps({
      roles: [{ library: "OWL", role: "librarian" }],
    });
    const library = wrapper.props().roles[0].library;
    expect(admin.isSystemAdmin()).to.equal(false);
    expect(admin.isSitewideLibraryManager()).to.equal(false);
    expect(admin.isSitewideLibrarian()).to.equal(false);
    expect(admin.isLibraryManager(library)).to.equal(false);
    expect(admin.isLibrarian(library)).to.equal(true);
    expect(admin.isLibraryManagerOfSomeLibrary()).to.equal(false);
  });

  it("correctly handles a case where there is an invalid role provided", () => {
    wrapper.setProps({
      roles: [{ library: "OWL", role: "" }],
    });
    const library = wrapper.props().roles[0].library;
    expect(admin.isSystemAdmin()).to.equal(false);
    expect(admin.isSitewideLibraryManager()).to.equal(false);
    expect(admin.isSitewideLibrarian()).to.equal(false);
    expect(admin.isLibraryManager(library)).to.equal(false);
    expect(admin.isLibrarian(library)).to.equal(false);
    expect(admin.isLibraryManagerOfSomeLibrary()).to.equal(false);
  });

  it("provides context to its children", () => {
    let testRender = wrapper.find(".context-test").children();
    expect(testRender.length).to.equal(2);
    let text = wrapper.find(".context-test").children().at(0);
    expect(text.find("p").at(0).text()).to.equal(
      "User is a sitewide librarian."
    );
    wrapper.setProps({
      roles: [{ library: "OWL", role: "system" }],
    });
    testRender = wrapper.find(".context-test").children();
    expect(testRender.length).to.equal(6);
    text = wrapper.find(".context-test").children().at(0);
    expect(text.find("p").at(0).text()).to.equal("User is a system admin.");
  });
});
