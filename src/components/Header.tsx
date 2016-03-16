import * as React from "react";
import * as ReactDOM from "react-dom";

export default class Header extends React.Component<any, any> {
  render(): JSX.Element {
    let CollectionLink = this.props.collectionLink;

    return (
      <nav className="header navbar navbar-default navbar-fixed-top">
        <div className="container-fluid">
          <span className="navbar-brand" style={{ fontSize: "2em", color: "black" }}>
            <img
              style={{ height: "25px", display: "inline", marginRight: "10px", marginTop: "-5px" }}
              src="https://yt3.ggpht.com/-Hyylhdo4Y_s/AAAAAAAAAAI/AAAAAAAAAAA/QUV9jb2rNSs/s900-c-k-no/photo.jpg"/>
            NYPL
          </span>

          { React.cloneElement(
              React.Children.only(this.props.children) as any,
              { className: "navbar-form navbar-right" }
            ) }

            <ul className="nav navbar-nav navbar-right" style={{ marginRight: "0px" }}>
              <li>
                <CollectionLink
                  text="Complaints"
                  url="http://localhost:6500/admin/complaints"
                  setCollectionAndBook={this.props.setCollectionAndBook}
                  pathFor={this.props.pathFor}/>
              </li>
            </ul>
        </div>
      </nav>
    );
  }
}