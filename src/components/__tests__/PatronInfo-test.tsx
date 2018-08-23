import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";
import PatronInfo from "../PatronInfo";

let patrons = [
  {
    authorization_expires: "",
    username: "User Name",
    personal_name: "Personal Name",
    email_address: "user@email.com",
    authorization_identifier: "1234",
    authorization_identifiers: [""],
    block_reason: "",
    external_type: "",
    fines: "",
    permanent_id: "",
  },
  {
    authorization_expires: "",
    personal_name: "Personal Name2",
    authorization_identifier: "5678",
    authorization_identifiers: [""],
    block_reason: "",
    external_type: "",
    fines: "",
    permanent_id: "",
  },
];

describe("Patron Info", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <PatronInfo
        patron={patrons[0]}
      />
    );
  });

  it("should display the patron's information", () => {
    const patronList = wrapper.find("ul");
    const patronInfoItem = patronList.find("li");

    expect(patronList.length).to.equal(1);
    expect(patronInfoItem.length).to.equal(4);
    expect(patronInfoItem.at(0).text()).to.equal("Username:User Name");
    expect(patronInfoItem.at(1).text()).to.equal("Personal Name:Personal Name");
    expect(patronInfoItem.at(2).text()).to.equal("Email Address:user@email.com");
    expect(patronInfoItem.at(3).text()).to.equal("Identifier:1234");
  });

  it("should update the patron's information if a new patron was searched and found", () => {
    wrapper.setProps({ patron: patrons[1] });
    const patronList = wrapper.find("ul");
    const patronInfoItem = patronList.find("li");

    expect(patronList.length).to.equal(1);
    expect(patronInfoItem.length).to.equal(2);
    expect(patronInfoItem.at(0).text()).to.equal("Personal Name:Personal Name2");
    expect(patronInfoItem.at(1).text()).to.equal("Identifier:5678");
  });
});
