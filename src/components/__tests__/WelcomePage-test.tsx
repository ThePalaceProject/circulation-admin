import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import WelcomePage from "../WelcomePage";
import Header from "../Header";
import { Jumbotron } from "react-bootstrap";

describe("WelcomePage", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <WelcomePage />
    );
  });

  it("shows the header", () => {
    let header = wrapper.find(Header);
    expect(header.length).to.equal(1);
  });

  it("shows the welcome message", () => {
    let jumbotron = wrapper.find(Jumbotron);
    expect(jumbotron.length).to.equal(1);
    let title = jumbotron.find("h2");
    expect(title.length).to.equal(1);
    expect(title.text()).to.equal("Welcome to the Circulation Admin Interface!");
  });

  it("shows a link to the library form", () => {
    let link = wrapper.find("a");
    expect(link.length).to.equal(1);
    expect(link.props().href).to.equal("/admin/web/config/libraries/create");
  });
});
