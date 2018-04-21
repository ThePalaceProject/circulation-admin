import * as React from "react";
import { Store } from "redux";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { State } from "../reducers/index";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import PencilIcon from "./icons/PencilIcon";
import TrashIcon from "./icons/TrashIcon";

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

/** Shows a list of configuration services of a particular type and allows creating a new
    service or editing or deleting an existing services. Used for many of the tabs on the
    system configuration page.

    GenericEditableConfigList allows subclasses to define additional props. Subclasses of
    EditableConfigList cannot change the props and do not have to specify a type for them. */
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
        <h2>{this.itemTypeName.slice(0, 1).toUpperCase() + this.itemTypeName.slice(1)} configuration</h2>
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} />
        }
        { this.props.isFetching &&
          <LoadingIndicator />
        }

        { !this.props.isFetching && !this.props.editOrCreate && this.props.data && this.props.data[this.listDataKey] &&
          <div>
            { (!this.limitOne || this.props.data[this.listDataKey].length === 0) && this.canCreate() &&
              <a
                className="btn btn-default create-item"
                href={this.urlBase + "create"}
                >Create new {this.itemTypeName}</a>
            }
            <ul>
              { this.props.data[this.listDataKey].map((item, index) =>
                  <li key={index}>
                    <a
                      className="btn btn-default edit-item"
                      href={this.urlBase + "edit/" + item[this.identifierKey]}
                      >
                        <span>
                          Edit
                          <PencilIcon />
                        </span>
                    </a>
                    <h4>
                      {this.label(item)}
                    </h4>
                    { this.canDelete(item) &&
                      <button
                        className="btn btn-danger delete-item"
                        onClick={() => this.delete(item) }
                        >
                          <span>
                            Delete
                            <TrashIcon />
                          </span>
                      </button>
                    }
                  </li>
                )
              }
            </ul>
          </div>
        }
        { (this.props.editOrCreate === "create") &&
          <div>
            <h3>Create a new {this.itemTypeName}</h3>
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
            <h3>Edit {this.label(this.itemToEdit())}</h3>
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

  canCreate() {
    return true;
  }

  canDelete(item) {
    return true;
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
    if (window.confirm("Delete \"" + this.label(item) + "\"?")) {
      await this.props.deleteItem(item[this.identifierKey]);
      this.props.fetchData();
    }
  }
}

export abstract class EditableConfigList<T, U> extends GenericEditableConfigList<T, U, EditableConfigListProps<T>> {}

export default EditableConfigList;
