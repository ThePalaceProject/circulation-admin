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
    let results = (item: ServiceData) => item.self_test_results && item.self_test_results.results || [];
    let sortByCollection = (item: ServiceData): boolean => results(item).some(r => r.collection);
    let getClassName = (item: ServiceData): string => {
      return results(item).length ? (results(item).every(r => r.success) ? "success" : "danger") : "default";
    };
    let link = (item: ServiceData): JSX.Element =>
      <a key={item.id} href={`/admin/web/config/${this.props.linkName}/edit/${item.id}`}>
        {item.name} configuration settings
      </a>;
    let selfTests = (item: ServiceData): JSX.Element =>
      <SelfTests
        key={item.name}
        store={this.props.store}
        type={this.props.type}
        item={item}
        csrfToken={this.props.csrfToken}
        sortByCollection={sortByCollection(item)}
      />;
    return (
      <div className="self-tests-category has-additional-content">
        <ul>
          { this.props.items && this.props.items.map((item) =>
              <li key={item.name}>
                <Panel
                  id={`${item.name.replace(/\s/g, "")}-${item.id}`}
                  style={getClassName(item)}
                  openByDefault={onlyChild}
                  headerText={item.name}
                  content={[link(item), selfTests(item)]}
                />
              </li>
            )
          }
        </ul>
      </div>
    );
  }
}
