import * as React from "react";
import { Store } from "redux";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { State } from "../reducers/index";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";

export interface EditableConfigListStateProps<T> {
  data?: T;
  fetchError?: FetchErrorData;
  isFetching?: boolean;
  editedIdentifier?: string;
}

export interface EditableConfigListDispatchProps<T> {
  fetchData?: () => Promise<T>;
  editItem?: (data: FormData) => Promise<void>;
  deleteItem?: (identifier: string | number) => Promise<void>;
}

export interface EditableConfigListOwnProps {
  store?: Store<State>;
  csrfToken: string;
  editOrCreate?: string;
  identifier?: string;
}

export interface EditableConfigListProps<T> extends EditableConfigListStateProps<T>, EditableConfigListDispatchProps<T>, EditableConfigListOwnProps {}

export interface EditFormProps<T, U> {
  item?: U;
  data: T;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
  urlBase: string;
  listDataKey: string;
  editedIdentifier?: string;
}

export abstract class GenericEditableConfigList<T, U, V extends EditableConfigListProps<T>> extends React.Component<V, void> {
  abstract EditForm: new(props: EditFormProps<T, U>) => React.Component<EditFormProps<T, U>, any>;
  abstract listDataKey: string;
  abstract itemTypeName: string;
  abstract urlBase: string;
  abstract identifierKey: string;
  abstract labelKey: string;
  limitOne = false;

  constructor(props) {
    super(props);
    this.editItem = this.editItem.bind(this);
    this.label = this.label.bind(this);
  }

  render(): JSX.Element {
    let EditForm = this.EditForm;
    return (
      <div>
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} />
        }
        { this.props.isFetching &&
          <LoadingIndicator />
        }

        { !this.props.isFetching && !this.props.editOrCreate && this.props.data && this.props.data[this.listDataKey] &&
          <div>
            <h2>Edit {this.itemTypeName} configurations</h2>
            <ul>
              { this.props.data[this.listDataKey].map((item, index) =>
                  <li key={index}>
                    <h3>
                      <a href={this.urlBase + "edit/" + item[this.identifierKey]}>{this.label(item)}</a>
                    </h3>
                    <button
                      className="btn btn-danger"
                      onClick={() => this.delete(item) }
                      >Delete
                    </button>
                  </li>
                )
              }
              { (!this.limitOne || this.props.data[this.listDataKey].length === 0) &&
                <li>
                  <h3>
                    <a href={this.urlBase + "create"}>Create a new {this.itemTypeName}</a>
                  </h3>
                </li>
              }
            </ul>
          </div>
        }
        { (this.props.editOrCreate === "create") &&
          <div>
            <h2>Create a new {this.itemTypeName}</h2>
            <EditForm
              data={this.props.data}
              disabled={this.props.isFetching}
              editItem={this.editItem}
              urlBase={this.urlBase}
              listDataKey={this.listDataKey}
              editedIdentifier={this.props.editedIdentifier}
              />
          </div>
        }

        { this.itemToEdit() &&
          <div>
            <h2>Edit {this.itemTypeName}</h2>
            <EditForm
              item={this.itemToEdit()}
              data={this.props.data}
              disabled={this.props.isFetching}
              editItem={this.editItem}
              urlBase={this.urlBase}
              listDataKey={this.listDataKey}
              editedIdentifier={this.props.editedIdentifier}
              />
          </div>
        }
      </div>
    );
  }

  label(item): string {
    return item[this.labelKey];
  }

  componentWillMount() {
    if (this.props.fetchData) {
      this.props.fetchData();
    }
  }

  async editItem(data: FormData): Promise<void> {
    await this.props.editItem(data);
    this.props.fetchData();
  }

  itemToEdit(): U | null {
    if (this.props.editOrCreate === "edit" && this.props.data && this.props.data[this.listDataKey]) {
      for (const item of this.props.data[this.listDataKey]) {
        if (String(item[this.identifierKey]) === this.props.identifier) {
          return item;
        }
      }
    }
    return null;
  }

  async delete(item: U): Promise<void> {
    if (window.confirm("Are you sure you want to delete \"" + this.label(item) + "\"?")) {
      await this.props.deleteItem(item[this.identifierKey]);
      this.props.fetchData();
    }
  }
}

export abstract class EditableConfigList<T, U> extends GenericEditableConfigList<T, U, EditableConfigListProps<T>> {}

export default EditableConfigList;