import * as React from "react";
import { render, screen } from "@testing-library/react";
import Footer, {
  makeFooterSupportContactText,
} from "../../../src/components/layout/Footer";
import { componentWithProviders } from "../testUtils/withProviders";
import {
  DEFAULT_SUPPORT_CONTACT_TEXT,
  SupportContactLink,
} from "../../../src/context/appContext";

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

const renderFooter = (
  props: { className?: string } = {},
  appConfigSettings: Record<string, unknown> = {}
) => {
  const settings = {
    tos_link_text: expectedTosText,
    tos_link_href: expectedTosHref,
    ...appConfigSettings,
  };
  const Wrapper = componentWithProviders({ appConfigSettings: settings });
  return render(
    <Wrapper>
      <Footer {...props} />
    </Wrapper>
  );
};

describe("Footer", () => {
  it("accepts an optional className prop", () => {
    const { container } = renderFooter({ className: "customClass" });
    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("customClass");
  });

  it("displays a terms of service link", () => {
    renderFooter();
    const links = screen.getAllByRole("link");
    expect(links.length).toEqual(1);
    expect(links[0].textContent).toEqual(expectedTosText);
    expect(links[0]).toHaveAttribute("href", expectedTosHref);
  });

  describe("support contact link", () => {
    it("displays a support contact link, when URL present", () => {
      renderFooter(
        {},
        {
          tos_link_text: expectedTosText,
          tos_link_href: expectedTosHref,
          supportContactUrl: expectedSupportContact.href,
        }
      );
      const links = screen.getAllByRole("link");
      expect(links.length).toEqual(2);
      const supportLink = links[1];
      expect(supportLink).toHaveAttribute("href", expectedSupportContact.href);
      expect(supportLink.textContent).toEqual(expectedSupportContactText);
    });

    it("omits contact link, when no support URL provided", () => {
      renderFooter({}, {});
      const links = screen.getAllByRole("link");
      expect(links.length).toEqual(1);
      expect(links[0]).toHaveAttribute("href", expectedTosHref);
    });

    it("displays a default label for an https url", () => {
      renderFooter(
        {},
        {
          supportContactUrl: "https://example.com/support",
        }
      );
      const links = screen.getAllByRole("link");
      expect(links.length).toEqual(2);
      const supportLink = links[1];
      expect(supportLink).toHaveAttribute(
        "href",
        "https://example.com/support"
      );
      expect(supportLink.textContent).toEqual(
        makeFooterSupportContactText(DEFAULT_SUPPORT_CONTACT_TEXT)
      );
    });

    it("displays a custom label for an https url", () => {
      renderFooter(
        {},
        {
          supportContactUrl: "https://example.com/support",
          supportContactText: "Custom Support Text",
        }
      );
      const links = screen.getAllByRole("link");
      expect(links.length).toEqual(2);
      const supportLink = links[1];
      expect(supportLink).toHaveAttribute(
        "href",
        "https://example.com/support"
      );
      expect(supportLink.textContent).toEqual(
        makeFooterSupportContactText("Custom Support Text")
      );
    });

    it("uses the deprecated support_contact_url if supportContactUrl is missing", () => {
      renderFooter(
        {},
        {
          support_contact_url: "https://example.com/deprecated-support",
        }
      );
      const links = screen.getAllByRole("link");
      expect(links.length).toEqual(2);
      const supportLink = links[1];
      expect(supportLink).toHaveAttribute(
        "href",
        "https://example.com/deprecated-support"
      );
      expect(supportLink.textContent).toEqual(
        makeFooterSupportContactText(DEFAULT_SUPPORT_CONTACT_TEXT)
      );
    });

    it("displays a custom label for a mailto url", () => {
      renderFooter(
        {},
        {
          supportContactUrl: "mailto:custom@example.com",
          supportContactText: "Email Us Now",
        }
      );
      const links = screen.getAllByRole("link");
      expect(links.length).toEqual(2);
      const supportLink = links[1];
      expect(supportLink).toHaveAttribute("href", "mailto:custom@example.com");
      expect(supportLink.textContent).toEqual(
        makeFooterSupportContactText("Email Us Now")
      );
    });
  });
});
