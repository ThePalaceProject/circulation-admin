import * as React from "react";
import { useSupportContact, useTermsOfService } from "../context/appContext";

export interface FooterProps {
  className?: string;
}

export const makeFooterSupportContactText = (text: string) =>
  `Need help? ${text}`;

/** If you run a well-known registry for circulation managers, you can add a link here to the terms of service for
that registry. Make sure to also configure the registry to provide a `terms-of-service` link during the registration
process. */
const Footer = ({ className }: FooterProps) => {
  const { text, href } = useTermsOfService();
  const supportContact = useSupportContact();

  return (
    <footer className={className}>
      <div>
        <a href={href} target="_blank" rel="noreferrer">
          {decode(text)}
        </a>
        {supportContact && (
          <>
            <br />
            <a href={supportContact.href}>
              <strong>
                {makeFooterSupportContactText(supportContact.text)}
              </strong>
            </a>
          </>
        )}
      </div>
    </footer>
  );
};

const decode = (text) => {
  // The current Terms of Service link text has an apostrophe in it.  If we don't go through
  // this extra step, the browser renders the HTML entity code for the apostrophe.
  const element = document.createElement("textarea");
  element.innerHTML = text;
  return element.value;
};

export default Footer;
