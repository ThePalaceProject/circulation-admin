import * as React from "react";

export interface FooterProps {
  className?: string;
  links?: {[key: string]: string};
}

// If you run a well-known registry for circulation managers, you can add a link here to the terms of service for
// that registry. Make sure to also configure the registry to provide a `terms-of-service` link during the registration
// process.
export default class Footer extends React.Component<FooterProps, {}> {
  render() {
    let links = this.props.links || {
      "Terms of Service for presenting e-reading materials through NYPL's SimplyE mobile app":
      "https://www.librarysimplified.org/SimplyETermsofService2.html"
    };
    return (
      <footer className={this.props.className}>
        {
          Object.keys(links).map((l) => {
            return (
              <a href={links[l]} target="_blank">{l}</a>
            );
          })
        }
      </footer>
    );
  }
}
