import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import AccountPage from "../AccountPage";
import Header from "../Header";
import Footer from "../Footer";
import ChangePasswordForm from "../ChangePasswordForm";
import buildStore from "../../store";

describe("AccountPage", () => {
  let wrapper;
  let store;
  let context;

  beforeEach(() => {
    store = buildStore();
    context = { editorStore: store, csrfToken: "token" };
    wrapper = shallow(<AccountPage />, { context });
  });

  it("shows Header", () => {
    const header = wrapper.find(Header);
    expect(header.length).to.equal(1);
  });

  it("shows ChangePasswordForm", () => {
    const form = wrapper.find(ChangePasswordForm);
    expect(form.prop("store")).to.equal(store);
    expect(form.prop("csrfToken")).to.equal("token");
  });

  it("shows Footer", () => {
    const footer = wrapper.find(Footer);
    expect(footer.length).to.equal(1);
  });
});
