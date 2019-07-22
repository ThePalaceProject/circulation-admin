import * as React from "react";
import { Store } from "redux";
import { State } from "../reducers/index";
import { SelfTests } from "./SelfTests";
import { CollectionData, PatronAuthServiceData, SearchServiceData  } from "../interfaces";
import { Panel } from "library-simplified-reusable-components";

export interface SelfTestsCategoryProps {
  type: string;
  csrfToken: string;
  items: CollectionData[] | PatronAuthServiceData[] | SearchServiceData[];
  store: Store<State>;
}

export default class SelfTestsCategory extends React.Component<SelfTestsCategoryProps, {}> {
  render() {
    return (
      <div className="self-tests-category">
        <ul>
          { this.props.items && this.props.items.map(i => <Panel key={i.name} headerText={i.name} content={<SelfTests store={this.props.store} type={this.props.type} item={i} />} />)}
        </ul>
      </div>
    );
  }
}
