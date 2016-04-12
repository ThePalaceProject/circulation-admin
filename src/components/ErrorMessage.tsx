import * as React from "react";
import { Alert } from "react-bootstrap";
import { FetchErrorData } from "opds-browser/lib/interfaces";

export interface ErrorMessageProps {
  error: FetchErrorData;
  tryAgain?: () => any;
}

export default class ErrorMessage extends React.Component<ErrorMessageProps, any> {
  render(): JSX.Element {
    let status = this.props.error.status;

    if (status === 401) {
      return (
        <Alert bsStyle="danger">
          <h4>You have been logged out.<br />
            <a target="_blank" href="/admin/sign_in_again">Log in again</a><br />
            { this.props.tryAgain &&
              <a onClick={this.tryAgain.bind(this)}>Try again</a>
            }
          </h4>
        </Alert>
      );
    } else {
      let response;
      try {
        response = JSON.parse(this.props.error.response).detail;
      } catch (e) {
        // response wasn't json
        response = this.props.error.response;
      }
      return (
        <Alert bsStyle="danger">
          <h4>Error: {response}<br />
            { this.props.tryAgain &&
              <a onClick={this.tryAgain.bind(this)}>Try again</a>
            }
          </h4>
        </Alert>
      );
    }
  }

  tryAgain() {
    this.props.tryAgain();
  }
}