import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import ManagePatrons from "../ManagePatrons";
import ManagePatronsForm from "../ManagePatronsForm";
import ManagePatronsTabContainer from "../ManagePatronsTabContainer";
import Header from "../Header";
import buildStore from "../../store";

describe("ManagePatrons", () => {
  let wrapper;
  let store;
  let context;
  let params;

  beforeEach(() => {
    store = buildStore();
    params = { library: "", tab: "" };
    context = { editorStore: store, csrfToken: "token" };
    wrapper = shallow(<ManagePatrons params={params} />, { context });
  });

  it("shows Header", () => {
    let header = wrapper.find(Header);
    expect(header.length).to.equal(1);
  });

  it("should have a .manage-patrons-page class", () => {
    expect(wrapper.hasClass("manage-patrons-page")).to.equal(true);
  });

  it("shows heading", () => {
    let heading = wrapper.find("h2");
    expect(heading.text()).to.equal("Patron Manager");
  });

  it("shows ManagePatronsTabContainer", () => {
    let tabContainer = wrapper.find(ManagePatronsTabContainer);
    expect(tabContainer.prop("store")).to.equal(store);
    expect(tabContainer.prop("csrfToken")).to.equal("token");
    expect(tabContainer.prop("library")).to.equal("");
    expect(tabContainer.prop("tab")).to.equal("");

    wrapper.setProps({ params: { library: "NYPL", tab: "adobeResetId" } });
    tabContainer = wrapper.find(ManagePatronsTabContainer);
    expect(tabContainer.prop("store")).to.equal(store);
    expect(tabContainer.prop("library")).to.equal("NYPL");
    expect(tabContainer.prop("tab")).to.equal("adobeResetId");
  });
});
