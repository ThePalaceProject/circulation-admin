import * as React from "react";
import { GenericEditableConfigList, EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import * as PropTypes from "prop-types";
import ActionCreator from "../actions";
import { Store } from "redux";
import { State } from "../reducers/index";
import { SelfTests } from "./SelfTests";
import { CollectionsData, CollectionData, LibraryData, LibraryRegistrationsData, ServiceData } from "../interfaces";
import { Panel } from "library-simplified-reusable-components";

export interface SelfTestsCategoryProps {
  type: string;
  csrfToken: string;
  items: any;
}

export interface SelfTestsCategoryContext {
  store: Store<State>;
}

export default class SelfTestsCategory extends React.Component<SelfTestsCategoryProps, {}> {
  context: SelfTestsCategoryContext;
  static contextTypes: React.ValidationMap<SelfTestsCategoryContext> = {
    store: PropTypes.object.isRequired,
  };

  render() {
    let hasItems = this.props.items && !!this.props.items[this.props.type];
    return (
      <div className="self-tests-category">
        <ul>
          { hasItems && this.props.items[this.props.type].map(i => <Panel key={i.name} headerText={i.name} content={<SelfTests store={this.context.store} type={this.props.type} item={i} />} />)}
        </ul>
      </div>
    );
  }
}
