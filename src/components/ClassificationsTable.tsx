import * as React from "react";
import { ClassificationData } from "../interfaces";

export interface ClassificationsTableProps {
  classifications: ClassificationData[];
}

export default class ClassificationsTable extends React.Component<ClassificationsTableProps, any> {
  render(): JSX.Element {
    return (
      <div className="bookClassifications" style={{ marginTop: "30px" }}>
        <h3>Related Classifications</h3>
        <table className="table bookClassifications">
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>Source</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            { this.props.classifications.map(classification =>
              <tr key={classification.name} className="bookClassification">
                <td>{this.readableType(classification.type)}</td>
                <td>{classification.name}</td>
                <td>{classification.source}</td>
                <td>{classification.weight}</td>
              </tr>
            ) }
          </tbody>
        </table>
      </div>
    );
  }

  readableType(type) {
    return type.replace(/http:\/\/librarysimplified\.org\/terms\/genres\/([^\/]+)\//, '$1');
  }
}