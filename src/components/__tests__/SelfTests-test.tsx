/* eslint-disable @typescript-eslint/camelcase */
import { expect } from "chai";
import { spy, stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { SelfTests } from "../SelfTests";
import { CheckSoloIcon, XIcon } from "@nypl/dgx-svg-icons";

// SelfTests can take more than just a collection (an integration can have
// self tests), but just testing collection data right now.
const collections = [
  {
    id: 1,
    name: "collection 1",
    protocol: "protocol",
    libraries: [{ short_name: "library" }],
    settings: {
      external_account_id: "nypl",
    },
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
          success: true,
        },
      ],
    },
  },
  {
    id: 1,
    name: "collection 1",
    protocol: "protocol",
    libraries: [{ short_name: "library" }],
    settings: {
      external_account_id: "nypl",
    },
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
          success: true,
        },
        {
          duration: 0,
          end: "2018-08-07T19:34:55Z",
          exception: {
            class: "IntegrationException",
            debug_message:
              "Add the collection to a library that has a patron authentication service.",
            message: "Collection is not associated with any libraries.",
          },
          name: "Acquiring test patron credentials.",
          result: null,
          start: "2018-08-07T19:34:55Z",
          success: false,
        },
      ],
    },
  },
  {
    id: 1,
    name: "collection 1",
    protocol: "protocol",
    libraries: [{ short_name: "library" }],
    settings: {
      external_account_id: "nypl",
    },
    self_test_results: {
      exception: "Exception getting self-test results for collection ...",
      duration: 0,
      start: "",
      end: "",
      results: [],
    },
  },
];

const updatedCollection = {
  id: 1,
  name: "collection 1",
  protocol: "protocol",
  libraries: [{ short_name: "library" }],
  settings: {
    external_account_id: "nypl",
  },
  self_test_results: {
    duration: 1.75,
    start: "2018-08-07T20:34:54Z",
    end: "2018-08-07T20:34:55Z",
    results: [
      {
        duration: 0.000119,
        end: "2018-08-07T20:34:54Z",
        exception: null,
        name: "Initial setup.",
        result: null,
        start: "2018-08-07T20:34:54Z",
        success: true,
      },
    ],
  },
};

describe("SelfTests", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(
      <SelfTests
        item={collections[0]}
        type="collection"
        getSelfTests={stub()}
      />
    );
  });

  it("should render the SelfTests component with empty self_test_results", () => {
    wrapper = shallow(
      <SelfTests item={{} as any} type="collection" getSelfTests={stub()} />
    );
    expect(wrapper.render().hasClass("integration-selftests")).to.equal(true);
    expect(wrapper.find("ul").length).to.equal(0);
    expect(wrapper.find("p").text()).to.equal("No self test results found.");
  });

  it("should disable the button if the tests cannot be run", () => {
    const selfTestResultsWithException = {
      ...collections[0].self_test_results,
      ...{ exception: "Exception!", disabled: true },
    };
    const collectionWithException = {
      ...collections[0],
      ...{ self_test_results: selfTestResultsWithException },
    };
    wrapper = mount(
      <SelfTests
        item={collectionWithException}
        type="collection"
        getSelfTests={stub()}
      />
    );
    expect(wrapper.find("button").props().disabled).to.be.true;
  });

  it("should render the SelfTests component for new services", () => {
    const exception = "This integration has no attribute 'prior_test_results'";
    const self_test_results = {
      ...collections[0].self_test_results,
      ...{ exception },
    };
    const item = { ...collections[0], ...{ self_test_results } };
    wrapper = shallow(
      <SelfTests item={item} type="collection" getSelfTests={stub()} />
    );
    expect(wrapper.render().hasClass("integration-selftests")).to.equal(true);
    expect(wrapper.find("ul").length).to.equal(0);
    expect(wrapper.find(".description").text()).to.equal(
      "There are no self test results yet."
    );
  });

  it("should render the SelfTests component with results", () => {
    expect(wrapper.render().hasClass("integration-selftests")).to.equal(true);
    expect(wrapper.find("ul").length).to.equal(1);
  });

  // not working with locale!
  /* it("should format the date and duration of the most recent tests", () => {
    expect(wrapper.instance().formatDate(collections[0])).to.equal("Tests last ran on Tue Aug 07 2018 15:34:54 and lasted 1.75s.");
  });*/

  it("should handle new props", () => {
    expect(wrapper.state()["mostRecent"]).to.equal(wrapper.prop("item"));
    wrapper.setProps({ item: updatedCollection });
    // The new item has a more recent start time, so the state gets updated.
    expect(wrapper.state()["mostRecent"]).to.equal(updatedCollection);
    wrapper.setProps({ item: collections[1] });
    // This is not a new result.  Nothing happens.
    expect(wrapper.state()["mostRecent"]).to.equal(updatedCollection);
  });

  describe("Successful self tests", () => {
    it("should display information about the whole self test result", () => {
      const passSVGIcon = wrapper.find(CheckSoloIcon);
      const failSVGIcon = wrapper.find(XIcon);
      // const description = wrapper.find(".description");

      // There's only one self test result in the collection and it passes.
      expect(failSVGIcon.length).to.equal(0);
      expect(passSVGIcon.length).to.equal(1);

      // expect(description.text().trim()).to.equal("Tests last ran on Tue Aug 07 2018 15:34:54 and lasted 1.75s."); // not working with locale
    });

    it("should display detail information for each self test result for the collection", () => {
      const list = wrapper.find("ul");
      const selfTestResults = list.find("li");
      expect(selfTestResults.length).to.equal(1);
      expect(selfTestResults.hasClass("success")).to.be.true;
      expect(selfTestResults.find("h4").text()).to.equal("Initial setup.");
      expect(selfTestResults.find("p").text()).to.equal("success: true");
    });
  });

  describe("Unsuccessful self tests", () => {
    beforeEach(() => {
      wrapper = mount(
        <SelfTests
          item={collections[1]}
          type="collection"
          getSelfTests={stub()}
        />
      );
    });

    it("should display the base error message when attempting to run self tests", () => {
      wrapper = shallow(
        <SelfTests
          item={collections[2]}
          type="collection"
          getSelfTests={stub()}
        />
      );

      const description = wrapper.find(".description");

      expect(description.text().trim()).to.equal(
        "Exception getting self-test results for collection ..."
      );
    });

    it("should display information about the whole self test result", () => {
      const passSVGIcon = wrapper.find(CheckSoloIcon);
      const failSVGIcon = wrapper.find(XIcon);
      // const description = wrapper.find(".description");

      // There are two self tests but one of them failed, so show a failing icon.
      expect(failSVGIcon.length).to.equal(1);
      expect(passSVGIcon.length).to.equal(0);

      // expect(description.text().trim()).to.equal("Tests last ran on Tue Aug 07 2018 15:34:54 and lasted 1.75s."); // not working with locale
    });

    it("should display detail information for each self test result for the collection", () => {
      const list = wrapper.find("ul");
      const selfTestResults = list.find("li");

      expect(selfTestResults.length).to.equal(2);
      expect(list.childAt(1).find("li").hasClass("success")).to.equal(true);
      expect(list.childAt(1).find("h4").text()).to.equal("Initial setup.");
      expect(list.childAt(1).find(".success-description").text()).to.equal(
        "success: true"
      );
      expect(list.childAt(1).find(".exception-description").length).to.equal(0);

      expect(list.childAt(2).find("li").hasClass("failure")).to.equal(true);
      expect(list.childAt(2).find("h4").text()).to.equal(
        "Acquiring test patron credentials."
      );
      expect(list.childAt(2).find(".success-description").text()).to.equal(
        "success: false"
      );
      expect(list.childAt(2).find(".exception-description").text()).to.equal(
        "exception: Collection is not associated with any libraries."
      );
    });
  });

  describe("Get new results", () => {
    let runSelfTests;
    let getSelfTests;

    beforeEach(() => {
      runSelfTests = stub().returns(
        new Promise<void>((resolve) => resolve())
      );
      getSelfTests = stub().returns(
        new Promise<void>((resolve) => resolve())
      );
      wrapper = mount(
        <SelfTests
          item={collections[0]}
          type="collection"
          runSelfTests={runSelfTests}
          getSelfTests={getSelfTests}
        />
      );
    });

    it("should run new self tests", async () => {
      const runSelfTestsBtn = wrapper
        .find("button")
        .findWhere((el) => el.text() === "Run tests")
        .at(0);

      expect(runSelfTests.callCount).to.equal(0);

      runSelfTestsBtn.simulate("click");

      expect(runSelfTests.callCount).to.equal(1);
    });

    it("should run new self tests but get an error", async () => {
      const error = {
        status: 400,
        response: "Failed to run new tests.",
        url: "/admin/collection_self_tests/12",
      };
      runSelfTests = stub().returns(
        new Promise<void>((resolve, reject) => reject(error))
      );
      getSelfTests = stub().returns(
        new Promise<void>((resolve) => resolve())
      );
      wrapper = mount(
        <SelfTests
          item={collections[0]}
          type="collection"
          runSelfTests={runSelfTests}
          getSelfTests={getSelfTests}
        />
      );
      const runSelfTestsBtn = wrapper
        .find("button")
        .findWhere((el) => el.text() === "Run tests")
        .at(0);
      let alert = wrapper.find(".alert");

      expect(runSelfTests.callCount).to.equal(0);
      expect(wrapper.state("error")).to.equal(null);
      expect(alert.length).to.equal(0);

      runSelfTestsBtn.simulate("click");

      const pause = (): Promise<void> => {
        return new Promise<void>((resolve) => setTimeout(resolve, 0));
      };
      await pause();

      expect(runSelfTests.callCount).to.equal(1);
      expect(wrapper.state("error")).to.eq(error);

      alert = wrapper.render().find(".alert");
      expect(alert.length).to.equal(1);
    });
  });
  describe("Handle metadata test results", () => {
    const collectionNames = ["A", "B", "C"];
    const baseResult = collections[0].self_test_results.results[0];
    const results = [];
    const makeResult = (c: string, success = true) => {
      return {
        ...baseResult,
        ...{
          collection: c,
          name: `Test ${results.length < collectionNames.length ? 1 : 2}`,
          success: success,
        },
      };
    };
    const display = (results) =>
      wrapper.instance().displayByCollection(results, false);
    it("should call displayMetadata", () => {
      const spyDisplayByCollection = spy(
        wrapper.instance(),
        "displayByCollection"
      );
      expect(spyDisplayByCollection.callCount).to.equal(0);
      const integration = { ...collections[0], ...{ goal: "metadata" } };
      wrapper.setState({ mostRecent: integration });
      wrapper.setProps({ sortByCollection: true });
      expect(spyDisplayByCollection.callCount).to.equal(1);
      expect(spyDisplayByCollection.args[0][0][0]).to.equal(baseResult);
      spyDisplayByCollection.restore();
    });
    it("should sort metadata test results by their collection", () => {
      while (results.length < collectionNames.length * 2) {
        collectionNames.map((c) => results.push(makeResult(c)));
      }
      const collectionPanels = display(results);
      expect(collectionPanels.length).to.equal(collectionNames.length);
      collectionPanels.map((panel: JSX.Element, idx: number) => {
        const collectionName = collectionNames[idx];
        const { headerText, style, content } = panel.props;
        expect(headerText).to.equal(collectionName);
        expect(style).to.equal("success");
        content.map((x: JSX.Element, idx: number) => {
          expect(x.props.result.collection).to.equal(collectionName);
          expect(x.props.result.name).to.equal(`Test ${idx + 1}`);
        });
      });
    });
    it("should display the result of the initial setup test", () => {
      const initialResult = makeResult("undefined");
      const panel = display([initialResult])[0];
      expect(panel.props.headerText).to.equal("Initial Setup");
    });
    it("should add the 'danger' class if not all the tests for the collection succeeded", () => {
      const errorResult = makeResult("With Error", false);
      const successResult = makeResult("With Error");
      const panel = display([errorResult, successResult])[0];
      expect(panel.props.style).to.equal("danger");
    });
  });
});
