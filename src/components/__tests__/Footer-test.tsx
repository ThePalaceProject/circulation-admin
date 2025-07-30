import { expect } from "chai";
import * as React from "react";
import { mount } from "enzyme";

import Footer from "../Footer";
import { componentWithProviders } from "../../../tests/jest/testUtils/withProviders";

const expectedTosText = "Terms of Service Text";
const expectedTosHref = "terms_of_service";
const testSupportContactUrl = "helpdesk@example.com";
const getFooterProviders = ({ hasSupportContactUrl = false } = {}) => {
  const appConfigSettings = {
    tos_link_text: expectedTosText,
    tos_link_href: expectedTosHref,
    support_contact_url: hasSupportContactUrl
      ? testSupportContactUrl
      : undefined,
  };
  return componentWithProviders({ appConfigSettings });
};

describe("Footer", () => {
  it("accepts an optional className prop", () => {
    const wrapper = mount(<Footer className="customClass" />, {
      wrappingComponent: getFooterProviders(),
    });
    expect(wrapper.hasClass("customClass")).to.be.true;
  });
  it("displays a terms of service link", () => {
    const wrapper = mount(<Footer />, {
      wrappingComponent: getFooterProviders(),
    });
    const linkElements = wrapper.find("div").find("a");
    expect(linkElements.length).to.equal(1);

    const TosLinkElement = linkElements.at(0);
    expect(TosLinkElement.text()).to.equal(expectedTosText);
    expect(TosLinkElement.prop("href")).to.equal(expectedTosHref);
  });

  describe("support contact link", () => {
    it("displays a support contact link, when URL present", () => {
      const wrapper = mount(<Footer />, {
        wrappingComponent: getFooterProviders({ hasSupportContactUrl: true }),
      });
      const linkElements = wrapper.find("div").find("a");
      expect(linkElements.length).to.equal(2);

      // The second link should be the support contact link.
      const supportContactLink = linkElements.at(1);
      expect(supportContactLink.prop("href")).to.equal(testSupportContactUrl);
      expect(supportContactLink.text()).to.equal("Need help? Contact support.");
    });
    it("displays a omits contact link, when URL missing", () => {
      const wrapper = mount(<Footer />, {
        wrappingComponent: getFooterProviders({ hasSupportContactUrl: false }),
      });
      const linkElements = wrapper.find("div").find("a");
      expect(linkElements.length).to.equal(1);

      // The second link should be the support contact link.
      const otherLink = linkElements.at(0);
      expect(otherLink.prop("href")).to.not.equal(testSupportContactUrl);
    });
  });
});
