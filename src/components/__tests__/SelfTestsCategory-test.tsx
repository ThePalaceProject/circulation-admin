import { expect } from "chai";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { stub, spy } from "sinon";
import buildStore from "../../store";

import SelfTestsCategory from "../SelfTestsCategory";
import SelfTests from "../SelfTests";
import { Panel } from "library-simplified-reusable-components";

describe("SelfTestsCategory", () => {
  let wrapper;
  let store;
  const collections = [
    {
      id: 1,
      name: "collection with success",
      protocol: "protocol",
      self_test_results: {
        duration: 1.75,
        start: "2018-08-07T19:34:54Z",
        end: "2018-08-07T19:34:55Z",
        results: [
          {
            duration: 0.000119,
            end: "2018-08-07T19:34:54Z",
            exception: null,
            name: "Initial setup.",
            result: null,
            start: "2018-08-07T19:34:54Z",
            success: true
          },
        ]
      }
    },
    {
      id: 2,
      name: "collection with failure",
      protocol: "protocol",
      self_test_results: {
        duration: 1.75,
        start: "2018-08-07T19:34:54Z",
        end: "2018-08-07T19:34:55Z",
        results: [
          {
            duration: 0.000119,
            end: "2018-08-07T19:34:54Z",
            exception: null,
            name: "Initial setup.",
            result: null,
            start: "2018-08-07T19:34:54Z",
            success: true
          },
          {
            duration: 0,
            end: "2018-08-07T19:34:55Z",
            exception: {
              class: "IntegrationException",
              debug_message: "Add the collection to a library that has a patron authentication service.",
              message: "Collection is not associated with any libraries."
            },
            name: "Acquiring test patron credentials.",
            result: null,
            start: "2018-08-07T19:34:55Z",
            success: false
          }
        ]
      }
    },
    {
      id: 3,
      name: "collection with no results",
      protocol: "protocol"
    }
  ];

  beforeEach(() => {
    store = buildStore();
    wrapper = mount(<SelfTestsCategory type="collection" linkName="collections" csrfToken="token" items={collections} store={store} />);
  });

  it("renders a list of items", () => {
    expect(wrapper.find("div").first().hasClass("self-tests-category")).to.be.true;
    expect(wrapper.find("div").first().hasClass("has-additional-content")).to.be.true;
    let listItems = wrapper.find("ul").first().find(Panel);
    expect(listItems.length).to.equal(3);
    let itemNames = listItems.map(i => i.find(".panel-title").text());
    expect(itemNames).to.eql(["collection with success", "collection with failure", "collection with no results"]);
    listItems.forEach((item, idx) => {
      let selfTests = item.find(SelfTests);
      expect(selfTests.length).to.equal(1);
      expect(selfTests.prop("type")).to.equal(wrapper.prop("type"));
      expect(selfTests.prop("item")).to.equal(collections[idx]);
    });
  });

  it("color-codes", () => {
    let listItems = wrapper.find("ul").first().find(Panel);
    let success = listItems.at(0);
    expect(success.prop("style")).to.equal("success");
    let failure = listItems.at(1);
    expect(failure.prop("style")).to.equal("danger");
    let noResults = listItems.at(2);
    expect(noResults.prop("style")).to.equal("default");
  });

  it("opens the panel by default if there's only one", () => {
    let listItems = wrapper.find("ul").first().find(Panel);
    expect(listItems.some(i => i.prop("openByDefault"))).to.be.false;
    wrapper.setProps({ items: [collections[0]] });
    let singleItem = wrapper.find("ul").first().find(Panel);
    expect(singleItem.prop("openByDefault")).to.be.true;
  });
});
