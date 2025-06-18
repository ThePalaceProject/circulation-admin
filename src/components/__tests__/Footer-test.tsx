import { expect } from "chai";
import * as React from "react";
import { mount } from "enzyme";

import Footer from "../Footer";
import { componentWithProviders } from "../../../tests/jest/testUtils/withProviders";

const expectedTosText = "Terms of Service Text";
const expectedTosHref = "terms_of_service";
const getFooterProviders = () => {
  const contextProviderProps = {
    tos_link_text: expectedTosText,
    tos_link_href: expectedTosHref,
  };
  return componentWithProviders({ contextProviderProps });
};

describe("Footer", () => {
  it("displays a link", () => {
    const wrapper = mount(<Footer />, {
      wrappingComponent: getFooterProviders(),
    });
    const linkElement = wrapper.find("p").find("a");
    expect(linkElement.length).to.equal(1);
    expect(linkElement.text()).to.equal(expectedTosText);
    expect(linkElement.prop("href")).to.equal(expectedTosHref);
  });
  it("accepts an optional className prop", () => {
    const wrapper = mount(<Footer className="customClass" />, {
      wrappingComponent: getFooterProviders(),
    });
    expect(wrapper.hasClass("customClass")).to.be.true;
  });
});
