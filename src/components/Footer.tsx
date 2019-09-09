import * as React from "react";

export interface FooterProps {
  className?: string;
}
export default class Footer extends React.Component<FooterProps, {}> {
  render() {
    return (
      <footer className={this.props.className}>
        <a href="http://www.librarysimplified.org/EULA.html" target="_blank">
          Terms of Service
        </a>
      </footer>
    );
  }
}
