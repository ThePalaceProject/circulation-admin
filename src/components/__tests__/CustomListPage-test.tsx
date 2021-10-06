import { expect } from "chai";
import * as React from "react";
import * as Enzyme from "enzyme";
import CustomListPage from "../CustomListPage";
import CustomLists from "../CustomLists";
import { ListManagerProvider } from "../ListManagerContext";
import { Header } from "../Header";
import Footer from "../Footer";

describe("CustomListPage", () => {
  let wrapper;
  let params;

  beforeEach(() => {
    params = {
      library: "library",
      editOrCreate: "edit",
      identifier: "identifier",
    };

    wrapper = Enzyme.shallow(
      <ListManagerProvider
        email="test@test.com"
        roles={[{ library: "OWL", role: "system" }]}
        csrfToken="token"
      >
        <CustomListPage params={params} />
      </ListManagerProvider>
    );
  });

  it("renders Header, Footer, and CustomLists components", () => {
    expect(wrapper.find(Header)).to.be.ok;
    expect(wrapper.find(CustomLists)).to.be.ok;
    expect(wrapper.find(Footer)).to.be.ok;
  });
});
