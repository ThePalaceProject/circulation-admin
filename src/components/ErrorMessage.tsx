import * as React from "react";
import * as ReactDOM from "react-dom";
import { Alert } from "react-bootstrap";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { Button } from "library-simplified-reusable-components";

export interface ErrorMessageProps {
  error: FetchErrorData;
  tryAgain?: () => any;
}

/** Shows a bootstrap error message at the top of the page when there's a bad
    response from the server. */
export default class ErrorMessage extends React.Component<ErrorMessageProps> {
  private errorMessageRef = React.createRef<HTMLDivElement>();
  render(): JSX.Element {
    const status = this.props.error.status;
    let errorMessageHeader;
    let errorMessageText;
    let alertElement;

    if (status === 401) {
      alertElement = (
        <Alert bsStyle="danger">
          {/* prettier-ignore */}
          <h4>You have been logged out.<br />
            <a target="_blank" href="/admin/sign_in_again">Log in again</a>
            { this.props.tryAgain &&
              <Button
                className="left-align"
                callback={this.tryAgain.bind(this)}
                content="Try again"
              />
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
        // The response might be a problem detail document encoded as a string rather than as JSON;
        // if so, we need to parse it and display the relevant information from it
        // (rather than just displaying the entire string, which is hard to read)
        const pdString = "Remote service returned a problem detail document";
        if (this.isProblemDetail(response, pdString)) {
          response = this.parseProblemDetail(response, pdString);
          errorMessageHeader = response.title ? response.title : "Error";
          errorMessageText = `${response.description}${response.status}: ${response.detail}`;
        }
      }
      if (!errorMessageText) {
        errorMessageText = `Error: ${response}`;
      }
      alertElement = (
        <Alert bsStyle="danger">
          <h4>
            {errorMessageHeader && (
              <p>
                <b>{errorMessageHeader}</b>&nbsp;
              </p>
            )}
            <span dangerouslySetInnerHTML={{ __html: errorMessageText }} />
            <br />
            {this.props.tryAgain && (
              <Button
                className="left-align"
                callback={this.tryAgain.bind(this)}
                content="Try again"
              />
            )}
          </h4>
        </Alert>
      );
    }

    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      <div tabIndex={0} ref={this.errorMessageRef}>
        {alertElement}
      </div>
    );
  }

  componentDidMount() {
    if (this.errorMessageRef.current) {
      const element = ReactDOM.findDOMNode(
        this.errorMessageRef.current
      ) as HTMLElement;
      element.focus();
    }
  }

  isProblemDetail(response, pdString) {
    // Problem detail strings start with the phrase "Remote service returned a problem detail document";
    // checking for it is the easiest way to test whether this is a problem detail string.
    const pdRegExp = new RegExp(pdString);
    return pdRegExp.test(response);
  }

  parseProblemDetail(response, pdString) {
    // We're going to want to check the second half of the string for the "detail" property.
    // The first half of the string--"Remote service returned a problem detail document"--contains
    // an irrelevant instance of the word "detail."  So we split the string in half and just send
    // the second half to be searched in.
    const responseData = response.split(pdString)[1];
    // prettier-ignore
    const pdInfo = this.extractProperties(responseData, ["\"status\": ", "\"detail\": ", "\"title\": "]);
    // this.extractProperties returns an object in which the keys are "status", "detail", and "title"
    // and the values are extracted from the problem detail string.  If the problem detail string was missing
    // one of those three properties, the value will be set as an empty string instead.
    pdInfo["description"] = pdInfo["status"]
      ? `${pdString} with status `
      : pdString;
    return pdInfo;
  }

  extractProperties(response, propertyStrings) {
    const result = {};
    propertyStrings.map((propertyString) => {
      // We clean up the string containing the name of the property and convert it to a RegExp so that
      // we can more easily check whether the problem detail has it.
      const property = propertyString.replace(/[": ]/g, "");
      const propertyRegExp = new RegExp(property);
      let value = "";
      // If the problem detail does have this property, pull the value out of the
      // string and remove any extraneous characters and whitespaces from it
      if (propertyRegExp.test(response)) {
        value = response
          .split(property)[1]
          .split(",")[0]
          .replace(/["':}]/g, "")
          .trim();
      }
      result[property] = value;
    });
    return result;
  }

  tryAgain() {
    this.props.tryAgain();
  }
}
