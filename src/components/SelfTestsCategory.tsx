import * as React from "react";
import { Store } from "redux";
import { RootState } from "../store";
import SelfTests from "./SelfTests";
import {
  CollectionData,
  PatronAuthServiceData,
  ServiceData,
} from "../interfaces";
import { Panel } from "library-simplified-reusable-components";

export interface SelfTestsCategoryProps {
  type: string;
  linkName: string;
  csrfToken: string;
  items: CollectionData[] | PatronAuthServiceData[];
  store: Store<RootState>;
}

export default class SelfTestsCategory extends React.Component<
  SelfTestsCategoryProps
> {
  handleUnnamed(): CollectionData[] | PatronAuthServiceData[] {
    // It's possible for older systems to have services in which the name
    // property is null, which will block the page from loading.  We check for
    // these services and assign them a placeholder name.
    const items = [];
    this.props.items.forEach((i) =>
      items.push(
        i.name ? i : { ...i, ...{ name: `Unnamed ${this.props.type}` } }
      )
    );
    return items;
  }

  render(): JSX.Element {
    const propItems = this.props.items && this.handleUnnamed();
    const onlyChild = propItems && propItems.length === 1;
    const results = (item: ServiceData) =>
      (item.self_test_results && item.self_test_results.results) || [];
    const items = {};
    propItems &&
      propItems.map((i) =>
        items[i.name]
          ? items[i.name].concat(results(i))
          : (items[i.name] = results(i))
      );
    const sortByCollection = (item: ServiceData): boolean =>
      items[item.name].some((r) => r.collection);
    const getClassName = (item: ServiceData): string => {
      return items[item.name].length
        ? items[item.name].every((r) => r.success)
          ? "success"
          : "danger"
        : "default";
    };
    const link = (item: ServiceData): JSX.Element => (
      <a
        key={item.id}
        href={`/admin/web/config/${this.props.linkName}/edit/${item.id}`}
      >
        {item.name} configuration settings
      </a>
    );
    const selfTests = (item: ServiceData): JSX.Element => (
      <SelfTests
        key={item.name}
        store={this.props.store}
        type={this.props.type}
        item={item}
        csrfToken={this.props.csrfToken}
        sortByCollection={sortByCollection(item)}
      />
    );
    return (
      <div className="self-tests-category has-additional-content">
        <ul>
          {propItems &&
            propItems.map((item) => (
              <li key={item.name}>
                <Panel
                  id={`${item.name.replace(/\s/g, "")}-${item.id}`}
                  style={getClassName(item)}
                  openByDefault={onlyChild}
                  headerText={item.name}
                  content={[link(item), selfTests(item)]}
                />
              </li>
            ))}
        </ul>
      </div>
    );
  }
}
