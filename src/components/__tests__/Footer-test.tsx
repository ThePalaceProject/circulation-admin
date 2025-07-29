import { expect } from "chai";
import * as React from "react";
import { mount } from "enzyme";

import Footer, { makeFooterSupportContactText } from "../Footer";
import { componentWithProviders } from "../../../tests/jest/testUtils/withProviders";
import {
  DEFAULT_SUPPORT_CONTACT_TEXT,
  SupportContactLink,
} from "../../context/appContext";

const expectedTosText = "Terms of Service Text";
const expectedTosHref = "terms_of_service";
const testSupportContactEmail = "helpdesk@example.com";
const expectedSupportContact: SupportContactLink = {
  href: `mailto:${testSupportContactEmail}?subject=Support+request`,
  text: `Email ${testSupportContactEmail}.`,
};
const expectedSupportContactText = makeFooterSupportContactText(
  expectedSupportContact.text
);
const getFooterProviders = ({ hasSupportContactUrl = false } = {}) => {
  const appConfigSettings = {
    tos_link_text: expectedTosText,
    tos_link_href: expectedTosHref,
    // Include support contact URL only if we ask for it.
    support_contact_url: hasSupportContactUrl
      ? "https://example.com/link-from-deprecated-setting"
      : undefined,
    supportContactUrl: hasSupportContactUrl
      ? expectedSupportContact.href
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
      expect(supportContactLink.prop("href")).to.equal(
        expectedSupportContact.href
      );
      expect(supportContactLink.text()).to.equal(expectedSupportContactText);
    });
    it("omits contact link, when no support URL provided", () => {
      const appConfigSettings = {
        supportContactUrl: "mailto:custom@example.com",
        supportContactText: "Email Us Now",
      };
      const wrapper = mount(<Footer />, {
        wrappingComponent: getFooterProviders({ hasSupportContactUrl: false }),
      });
      // There should only be one link....
      const linkElements = wrapper.find("div").find("a");
      expect(linkElements.length).to.equal(1);

      // ... and it should be the TOS link, not a support contact link.
      const otherLink = linkElements.at(0);
      expect(otherLink.prop("href")).to.not.equal(expectedSupportContact.href);
      expect(otherLink.prop("href")).to.equal(expectedTosHref);
    });
    it("displays a default label for an https url", () => {
      const appConfigSettings = {
        supportContactUrl: "https://example.com/support",
      };
      const wrapper = mount(<Footer />, {
        wrappingComponent: componentWithProviders({ appConfigSettings }),
      });
      const linkElements = wrapper.find("div").find("a");
      expect(linkElements.length).to.equal(2);
      const supportLink = linkElements.at(1);
      expect(supportLink.prop("href")).to.equal("https://example.com/support");
      expect(supportLink.text()).to.equal(
        makeFooterSupportContactText(DEFAULT_SUPPORT_CONTACT_TEXT)
      );
    });
    it("displays a custom label for an https url", () => {
      const appConfigSettings = {
        supportContactUrl: "https://example.com/support",
        supportContactText: "Custom Support Text",
      };
      const wrapper = mount(<Footer />, {
        wrappingComponent: componentWithProviders({ appConfigSettings }),
      });
      const linkElements = wrapper.find("div").find("a");
      expect(linkElements.length).to.equal(2);
      const supportLink = linkElements.at(1);
      expect(supportLink.prop("href")).to.equal("https://example.com/support");
      expect(supportLink.text()).to.equal(
        makeFooterSupportContactText("Custom Support Text")
      );
    });
    it("uses the deprecated support_contact_url if supportContactUrl is missing", () => {
      const appConfigSettings = {
        support_contact_url: "https://example.com/deprecated-support",
      };
      const wrapper = mount(<Footer />, {
        wrappingComponent: componentWithProviders({ appConfigSettings }),
      });
      const linkElements = wrapper.find("div").find("a");
      expect(linkElements.length).to.equal(2);
      const supportLink = linkElements.at(1);
      expect(supportLink.prop("href")).to.equal(
        "https://example.com/deprecated-support"
      );
      expect(supportLink.text()).to.equal(
        makeFooterSupportContactText(DEFAULT_SUPPORT_CONTACT_TEXT)
      );
    });
    it("displays a custom label for a mailto url", () => {
      const appConfigSettings = {
        supportContactUrl: "mailto:custom@example.com",
        supportContactText: "Email Us Now",
      };
      const wrapper = mount(<Footer />, {
        wrappingComponent: componentWithProviders({ appConfigSettings }),
      });
      const linkElements = wrapper.find("div").find("a");
      expect(linkElements.length).to.equal(2);
      const supportLink = linkElements.at(1);
      expect(supportLink.prop("href")).to.equal("mailto:custom@example.com");
      expect(supportLink.text()).to.equal(
        makeFooterSupportContactText("Email Us Now")
      );
    });
  });
});
