import * as React from "react";
import { Store } from "redux";
import { State } from "../reducers/index";
import SelfTests from "./SelfTests";
import { CollectionData, PatronAuthServiceData, SearchServiceData, SelfTestsResult  } from "../interfaces";
import { Panel } from "library-simplified-reusable-components";

export interface SelfTestsCategoryProps {
  type: string;
  csrfToken: string;
  items: CollectionData[] | PatronAuthServiceData[] | SearchServiceData[];
  store: Store<State>;
}

export default class SelfTestsCategory extends React.Component<SelfTestsCategoryProps, {}> {

  render() {
    let onlyChild = this.props.items && this.props.items.length === 1;
    let type = this.props.type.replace("auth", "authentication").slice(0, -1);
    let getClassName = (item) => {
      let results = item.self_test_results && item.self_test_results.results;
      return results ? (results.every(r => r.success) ? "success" : "danger") : "default";
    };
    let selfTests = (item) => <SelfTests store={this.props.store} type={type} item={item} csrfToken={this.props.csrfToken} />;
    return (
      <div className="self-tests-category has-additional-content">
        <ul>
          { this.props.items && this.props.items.map(i => <Panel style={getClassName(i)} key={i.name} openByDefault={onlyChild} headerText={i.name} content={selfTests(i)} />)}
        </ul>
      </div>
    );
  }
}
