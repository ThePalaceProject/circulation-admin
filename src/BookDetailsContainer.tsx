import * as React from "react";
import { Tabs, Tab } from "react-bootstrap";
require("bootstrap/dist/css/bootstrap.css");
import SuppressForm from "./SuppressForm";
import UnsuppressForm from "./UnsuppressForm";

export default function (csrfToken: string) {

  class BookDetailsContainer extends React.Component<any, any> {

    render(): JSX.Element {
      let tabContentStyle = {
        position: "absolute",
        top: "100px",
        bottom: "0",
        left: "25px",
        right: "25px"
      };

      let suppressLink = this.props.book.rawEntry.links.find(link => {
        return link.rel === "http://librarysimplified.org/terms/rel/suppress";
      });

      let unsuppressLink = this.props.book.rawEntry.links.find(link => {
        return link.rel === "http://librarysimplified.org/terms/rel/unsuppress";
      });

      return (
        <Tabs defaultActiveKey={1}>
          <Tab eventKey={1} title="Book Details">
            <div style={tabContentStyle}>
              {this.props.children}
            </div>
          </Tab>

          { suppressLink &&
            <Tab eventKey={2} title="Suppress">
              <div style={tabContentStyle}>
                <SuppressForm book={this.props.book} csrfToken={csrfToken} link={suppressLink.href} />
              </div>
            </Tab>
          }
          { unsuppressLink &&
            <Tab eventKey={2} title="Unsuppress">
              <div style={tabContentStyle}>
                <UnsuppressForm book={this.props.book} csrfToken={csrfToken} link={unsuppressLink.href} />
              </div>
            </Tab>
          }
        </Tabs>
      );
    }
  }

  return BookDetailsContainer;
}