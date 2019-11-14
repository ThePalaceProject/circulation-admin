import * as React from "react";
import { Store } from "redux";
import { State } from "../reducers/index";
import SelfTests from "./SelfTests";
import { CollectionData, PatronAuthServiceData, SearchServiceData, SelfTestsResult, ServiceData  } from "../interfaces";
import { Panel } from "library-simplified-reusable-components";

export interface SelfTestsCategoryProps {
  type: string;
  linkName: string;
  csrfToken: string;
  items: CollectionData[] | PatronAuthServiceData[] | SearchServiceData[];
  store: Store<State>;
}

export default class SelfTestsCategory extends React.Component<SelfTestsCategoryProps, {}> {

  render(): JSX.Element {
    let onlyChild = this.props.items && this.props.items.length === 1;
    let getClassName = (item: ServiceData): string => {
      let results = item.self_test_results && item.self_test_results.results;
      return results ? (results.every(r => r.success) ? "success" : "danger") : "default";
    };
    let link = (item: ServiceData): JSX.Element => <a key={item.id} href={`/admin/web/config/${this.props.linkName}/edit/${item.id}`}>{item.name} configuration settings</a>;
    let selfTests = (item: ServiceData): JSX.Element => <SelfTests key={item.name} store={this.props.store} type={this.props.type} item={item} csrfToken={this.props.csrfToken} />;
    return (
      <div className="self-tests-category has-additional-content">
        <ul>
          { this.props.items && this.props.items.map((item, idx) =>
              <li>
                <Panel
                  style={getClassName(item)}
                  key={item.name}
                  id={`${item.name.replace(/\s+/g, "")}-${idx}`}
                  openByDefault={onlyChild}
                  headerText={item.name}
                  content={[link(item), selfTests(item)]}
                />
              </li>)
          }
        </ul>
      </div>
    );
  }
}
