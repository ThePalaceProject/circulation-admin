import * as React from "react";

export interface FooterProps {
  className?: string;
  links?: [string, string][];
}

// If you run a well-known registry for circulation managers, you can add a link here to the terms of service for
// that registry. Make sure to also configure the registry to provide a `terms-of-service` link during the registration
// process.
export default class Footer extends React.Component<FooterProps, {}> {
  render() {
    let links = this.props.links || [[
      "Terms of Service for presenting e-reading materials through NYPL's SimplyE mobile app",
      "https://www.librarysimplified.org/SimplyETermsofService2.html"
    ]];
    return (
      <footer className={this.props.className}>
        <ul>
          {
            links.map((link, idx) => {
              let [text, url] = link;
              return (
                <li key={idx}><a href={url} target="_blank">{text}</a></li>
              );
            })
          }
        </ul>
      </footer>
    );
  }
}
