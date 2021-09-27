import * as React from "react";
import * as PropTypes from "prop-types";
import { TOSContext } from "./TOSContext";

export interface FooterProps {
  className?: string;
}

/** If you run a well-known registry for circulation managers, you can add a link here to the terms of service for
that registry. Make sure to also configure the registry to provide a `terms-of-service` link during the registration
process. */
export default class Footer extends React.Component<FooterProps, {}> {
  static contextType = TOSContext;

  render() {
    const [text, href] = this.context;
    return (
      <footer className={this.props.className}>
        <p>
          <a href={href} target="_blank" rel="noreferrer">
            {this.decode(text)}
          </a>
        </p>
      </footer>
    );
  }
  decode(text) {
    // The current Terms of Service link text has an apostrophe in it.  If we don't go through
    // this extra step, the browser renders the HTML entity code for the apostrophe.
    const element = document.createElement("textarea");
    element.innerHTML = text;
    return element.value;
  }
}
