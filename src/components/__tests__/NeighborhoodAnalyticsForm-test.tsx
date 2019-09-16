import { expect } from "chai";
import { stub, spy } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import EditableInput from "../EditableInput";
import NeighborhoodAnalyticsForm from "../NeighborhoodAnalyticsForm";
import { Panel } from "library-simplified-reusable-components";

describe("NeighborhoodAnalyticsForm", () => {
  let wrapper;
  let patronAuthSetting;
  let analyticsSetting;

  beforeEach(() => {
    patronAuthSetting = {
      key: "neighborhood_mode",
      label: "Patron Auth",
      options: [{"key": "disabled", "label": "Off"}, {"key": "choice1", "label": "Choice 1" }, {"key": "choice2", "label": "Choice 2" }]
    };
    analyticsSetting = {
      key: "location_source",
      label: "Analytics",
      options: [{"key": "disabled", "label": "Off"}, {"key": "choice1", "label": "Choice 1" }, {"key": "choice2", "label": "Choice 2" }]
    };
    wrapper = mount(<NeighborhoodAnalyticsForm setting={patronAuthSetting} />);
  });

  let chooseOption = (option: string) => {
    let select = wrapper.find("select") as any;
    let selectElement = select.getDOMNode();
    selectElement.value = option;
    select.simulate("change");
    wrapper.update();
  };

  it("renders a panel", () => {
    let panel = wrapper.find(Panel);
    expect(panel.length).to.equal(1);
    expect(panel.prop("headerText")).to.contain("Patron Neighborhood Analytics");
  });

  it("renders an EditableInput component", () => {
    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    let select = input.find("select");
    expect(select.length).to.equal(1);
    select.find("option").map((o, idx) => {
      expect(o.prop("value")).to.equal(wrapper.prop("setting").options[idx].key);
      expect(o.text()).to.equal(wrapper.prop("setting").options[idx].label);
    });
  });

  it("renders a warning message", () => {
    let warning = wrapper.find(".bg-danger");
    expect(warning.length).to.equal(0);
    chooseOption("disabled");
    warning = wrapper.find(".bg-danger");
    expect(warning.length).to.equal(0);
    chooseOption("choice1");
    warning = wrapper.find(".bg-danger");
    expect(warning.length).to.equal(1);
    expect(warning.text()).to.equal("This feature will work only if it is also enabled in your analytics service configuration settings.");
    expect(warning.find("a").prop("href")).to.equal("/admin/web/config/analytics");

    wrapper.setProps({ setting: analyticsSetting });
    warning = wrapper.find(".bg-danger");
    expect(warning.length).to.equal(1);
    expect(warning.text()).to.equal("This feature will work only if it is also enabled in your patron authentication service configuration settings.");
    expect(warning.find("a").prop("href")).to.equal("/admin/web/config/patronAuth");
  });

  it("updates the state when an option is chosen", () => {
    expect(wrapper.state()["selected"]).to.be.null;
    chooseOption("choice1");
    expect(wrapper.state()["selected"]).to.equal("choice1");
  });

  it("updates the state to match the currentValue prop", () => {
    wrapper = mount(<NeighborhoodAnalyticsForm setting={patronAuthSetting} currentValue={"choice1"} />);
    expect(wrapper.state()["selected"]).to.equal("choice1");
  });

  it("tells the user whether the feature is currently enabled", () => {
    let headerText = wrapper.find(".panel-heading span").text();
    expect(headerText).to.equal("Patron Neighborhood Analytics: Disabled");
    chooseOption("choice1");
    headerText = wrapper.find(".panel-heading span").text();
    expect(headerText).to.equal("Patron Neighborhood Analytics: Enabled");
    chooseOption("choice2");
    headerText = wrapper.find(".panel-heading span").text();
    expect(headerText).to.equal("Patron Neighborhood Analytics: Enabled");
    chooseOption("disabled");
    headerText = wrapper.find(".panel-heading span").text();
    expect(headerText).to.equal("Patron Neighborhood Analytics: Disabled");
  });

  it("determines whether the feature is currently enabled", () => {
    expect(wrapper.instance().isEnabled()).not.to.be.true;
    chooseOption("choice1");
    expect(wrapper.instance().isEnabled()).to.be.true;
    chooseOption("choice2");
    expect(wrapper.instance().isEnabled()).to.be.true;
    chooseOption("disabled");
    expect(wrapper.instance().isEnabled()).not.to.be.true;
  });

  it("provides the name of the paired service", () => {
    expect(wrapper.instance().getPairedService(patronAuthSetting)).to.eql(["/admin/web/config/analytics", "analytics service configuration settings"]);
    expect(wrapper.instance().getPairedService(analyticsSetting)).to.eql(["/admin/web/config/patronAuth", "patron authentication service configuration settings"]);
  });

  it("returns the value of the currently selected option", () => {
    expect(wrapper.instance().getValue()).to.be.null;
    chooseOption("choice1");
    expect(wrapper.instance().getValue()).to.equal("choice1");
    chooseOption("choice2");
    expect(wrapper.instance().getValue()).to.equal("choice2");
  });
});
