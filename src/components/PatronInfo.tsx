import * as React from "react";
import { PatronData } from "../interfaces";

export interface PatronInfoProps {
  patron: PatronData;
}

export default class PatronInfo extends React.Component<PatronInfoProps, void> {
  constructor(props) {
    super(props);
  }

  render() {
    const patron = this.props.patron;
    return (
      <section className="patron-info">
        <ul className="patron-data-list">
          { patron.username &&
            <li><label>Username:</label><p>{patron.username}</p></li>
          }
          { patron.personal_name &&
            <li><label>Personal Name:</label><p>{patron.personal_name}</p></li>
          }
          { patron.email_address &&
            <li><label>Email Address:</label><p>{patron.email_address}</p></li>
          }
          <li><label>Identifier:</label><p>{patron.authorization_identifier}</p></li>
        </ul>
      </section>
    );
  }
}
