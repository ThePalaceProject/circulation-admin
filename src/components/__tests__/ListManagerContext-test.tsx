import { expect } from "chai";
import * as React from "react";
import * as Enzyme from "enzyme";

import { ListManagerContext, ListManagerProvider } from "../ListManagerContext";

describe("ListManagerContext", () => {
  let wrapper: Enzyme.CommonWrapper<any, any, {}>;
  let library;
  beforeEach(() => {
    const TestComponent = () => {
      const admin = React.useContext(ListManagerContext);
      return (
        <div className="context-test">
          {admin.isSystemAdmin() && <p>isSystemAdmin</p>}
          {admin.isSitewideLibraryManager() && <p>isSitewideLibraryManager</p>}
          {admin.isSitewideLibrarian() && <p>isSitewideLibrarian</p>}
          {admin.isLibraryManager(library) && <p>isLibraryManager</p>}
          {admin.isLibrarian(library) && <p>isLibrarian</p>}
          {admin.isLibraryManagerOfSomeLibrary() && (
            <p>isLibraryManagerOfSomeLibrary</p>
          )}
        </div>
      );
    };
    library = "OWL";
    wrapper = Enzyme.mount(
      <ListManagerProvider
        email="test@test.com"
        roles={[{ library: "OWL", role: "system" }]}
      >
        <TestComponent />
      </ListManagerProvider>
    );
  });

  it.only("correctly calculates an admin's role", () => {
    const test = wrapper.find(".context-test").children().at(0);
    expect(test.find("p").at(0).text()).to.equal("isSystemAdmin");
  });
});
