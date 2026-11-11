import * as React from "react";
import { renderWithProviders } from "../testUtils/withProviders";
import Footer, {
  makeFooterSupportContactText,
} from "../../../src/components/Footer";
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

// Builds the app config the ContextProvider transforms into terms-of-service and
// support-contact context, mirroring the legacy test's `getFooterProviders`.
const footerConfig = ({ hasSupportContactUrl = false } = {}) => ({
  tos_link_text: expectedTosText,
  tos_link_href: expectedTosHref,
  // Include support contact URL only if we ask for it.
  support_contact_url: hasSupportContactUrl
    ? "https://example.com/link-from-deprecated-setting"
    : undefined,
  supportContactUrl: hasSupportContactUrl
    ? expectedSupportContact.href
    : undefined,
});

describe("Footer", () => {
  it("accepts an optional className prop", () => {
    const { container } = renderWithProviders(
      <Footer className="customClass" />,
      { appConfigSettings: footerConfig() }
    );
    expect(container.querySelector("footer")).toHaveClass("customClass");
  });

  it("displays a terms of service link", () => {
    const { container } = renderWithProviders(<Footer />, {
      appConfigSettings: footerConfig(),
    });
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(1);

    expect(links[0]).toHaveTextContent(expectedTosText);
    expect(links[0]).toHaveAttribute("href", expectedTosHref);
  });

  describe("support contact link", () => {
    it("displays a support contact link, when URL present", () => {
      const { container } = renderWithProviders(<Footer />, {
        appConfigSettings: footerConfig({ hasSupportContactUrl: true }),
      });
      const links = container.querySelectorAll("a");
      expect(links).toHaveLength(2);

      // The second link should be the support contact link.
      expect(links[1]).toHaveAttribute("href", expectedSupportContact.href);
      expect(links[1]).toHaveTextContent(expectedSupportContactText);
    });

    it("omits contact link, when no support URL provided", () => {
      const { container } = renderWithProviders(<Footer />, {
        appConfigSettings: footerConfig({ hasSupportContactUrl: false }),
      });
      // There should only be one link....
      const links = container.querySelectorAll("a");
      expect(links).toHaveLength(1);

      // ... and it should be the TOS link, not a support contact link.
      expect(links[0]).not.toHaveAttribute("href", expectedSupportContact.href);
      expect(links[0]).toHaveAttribute("href", expectedTosHref);
    });

    it("displays a default label for an https url", () => {
      const { container } = renderWithProviders(<Footer />, {
        appConfigSettings: { supportContactUrl: "https://example.com/support" },
      });
      const links = container.querySelectorAll("a");
      expect(links).toHaveLength(2);
      expect(links[1]).toHaveAttribute("href", "https://example.com/support");
      expect(links[1]).toHaveTextContent(
        makeFooterSupportContactText(DEFAULT_SUPPORT_CONTACT_TEXT)
      );
    });

    it("displays a custom label for an https url", () => {
      const { container } = renderWithProviders(<Footer />, {
        appConfigSettings: {
          supportContactUrl: "https://example.com/support",
          supportContactText: "Custom Support Text",
        },
      });
      const links = container.querySelectorAll("a");
      expect(links).toHaveLength(2);
      expect(links[1]).toHaveAttribute("href", "https://example.com/support");
      expect(links[1]).toHaveTextContent(
        makeFooterSupportContactText("Custom Support Text")
      );
    });

    it("uses the deprecated support_contact_url if supportContactUrl is missing", () => {
      const { container } = renderWithProviders(<Footer />, {
        appConfigSettings: {
          support_contact_url: "https://example.com/deprecated-support",
        },
      });
      const links = container.querySelectorAll("a");
      expect(links).toHaveLength(2);
      expect(links[1]).toHaveAttribute(
        "href",
        "https://example.com/deprecated-support"
      );
      expect(links[1]).toHaveTextContent(
        makeFooterSupportContactText(DEFAULT_SUPPORT_CONTACT_TEXT)
      );
    });

    it("displays a custom label for a mailto url", () => {
      const { container } = renderWithProviders(<Footer />, {
        appConfigSettings: {
          supportContactUrl: "mailto:custom@example.com",
          supportContactText: "Email Us Now",
        },
      });
      const links = container.querySelectorAll("a");
      expect(links).toHaveLength(2);
      expect(links[1]).toHaveAttribute("href", "mailto:custom@example.com");
      expect(links[1]).toHaveTextContent(
        makeFooterSupportContactText("Email Us Now")
      );
    });
  });
});
