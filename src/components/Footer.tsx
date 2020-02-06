import * as React from "react";
import * as PropTypes from "prop-types";

export interface FooterProps {
  className?: string;
}

export interface FooterContext {
  tos_link_text?: string;
  tos_link_href?: string;
}

/** If you run a well-known registry for circulation managers, you can add a link here to the terms of service for
that registry. Make sure to also configure the registry to provide a `terms-of-service` link during the registration
process. */
export default class Footer extends React.Component<FooterProps, {}> {
  context: FooterContext;

  static contextTypes: React.ValidationMap<FooterContext> = {
    tos_link_text: PropTypes.string,
    tos_link_href: PropTypes.string
  };
  render() {
    let { tos_link_text, tos_link_href } = this.context;
    return (
      <footer className={this.props.className}>
        <p><a href={tos_link_href} target="_blank">{this.decode(tos_link_text)}</a></p>
      </footer>
    );
  }

  decode(text) {
    // The current Terms of Service link text has an apostrophe in it.  If we don't go through
    // this extra step, the browser renders the HTML entity code for the apostrophe.
    let element = document.createElement("textarea");
    element.innerHTML = text;
    return element.value;
  }
}
