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
    let [text, href] = this.context;
    return (
      <footer className={this.props.className}>
          <p><a href={href} target="_blank" dangerouslySetInnerHTML={{__html: text}} /></p>
      </footer>
    );
  }
}
