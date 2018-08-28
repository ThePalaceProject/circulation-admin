import * as React from "react";
import { Alert } from "react-bootstrap";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

export interface ErrorMessageProps {
  error: FetchErrorData;
  tryAgain?: () => any;
}

/** Shows a bootstrap error message at the top of the page when there's a bad
    response from the server. */
export default class ErrorMessage extends React.Component<ErrorMessageProps, void> {
  render(): JSX.Element {

    let status = this.props.error.status;
    let errorMessageHeader;
    let errorMessageText;
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
        response = this.props.error.response;
        if (this.isProblemDetail(response)) {
          response = this.parseProblemDetail(response);
          errorMessageHeader = response.title;
          errorMessageText = response.description + response.status + ": " + response.detail;
        }
      }
      if (!errorMessageText) {
        errorMessageText = "Error: " + response;
      }
      return (
        <Alert bsStyle="danger">
          <h4>
            { errorMessageHeader &&
              <p><b>{errorMessageHeader}</b>&nbsp;</p>
            }
            {errorMessageText}<br />
            { this.props.tryAgain &&
              <a onClick={this.tryAgain.bind(this)}>Try again</a>
            }
          </h4>
        </Alert>
      );
    }
  }

  isProblemDetail(response) {
    if (response.split(":")[0]) {
      return response.split(":")[0] === "Remote service returned a problem detail document";
    }
    return false;
  }

  parseProblemDetail(response) {
    let [status, detail, title] = this.extractProperty(response, ["\"status\": ", "\"detail\": ", "\"title\": "]);
    let description = "Remote service returned a problem detail document with status ";
    return {description, status, detail, title};
  }

  extractProperty(response, propertyStrings) {
    let properties = [];
    propertyStrings.map((propertyString) => {
      properties.push(response.split(propertyString)[1].split(",")[0].replace(/["'}]/g, ""));
    });
    return properties;
  }

  tryAgain() {
    this.props.tryAgain();
  }
}
