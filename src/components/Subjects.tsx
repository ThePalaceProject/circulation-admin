import * as React from "react";
import { SubjectData } from "../interfaces";

export interface SubjectsProps {
  subjects: SubjectData[];
}

export default class Subjects extends React.Component<SubjectsProps, any> {
  render(): JSX.Element {
    return (
      <div className="bookSubjects" style={{ marginTop: "30px" }}>
        <h3>Related Classifications</h3>
        <table className="table bookSubjects">
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>Source</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            { this.props.subjects.map(subject =>
              <tr key={subject.name} className="bookSubject">
                <td>{subject.type}</td>
                <td>{subject.name}</td>
                <td>{subject.source}</td>
                <td>{subject.weight}</td>
              </tr>
            ) }
          </tbody>
        </table>
      </div>
    );
  }
}