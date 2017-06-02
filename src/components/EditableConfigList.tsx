import * as React from "react";
import { Store } from "redux";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { State } from "../reducers/index";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";

export interface EditableConfigListProps<T> {
  store?: Store<State>;
  data?: T;
  fetchError?: FetchErrorData;
  fetchData?: () => Promise<T>;
  editItem?: (data: FormData) => Promise<void>;
  isFetching?: boolean;
  csrfToken: string;
  editOrCreate?: string;
  identifier?: string;
}

export interface EditFormProps<T, U> {
  item?: U;
  data: T;
  csrfToken: string;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
}

export abstract class EditableConfigList<T, U> extends React.Component<EditableConfigListProps<T>, void> {
  abstract EditForm: new(props: EditFormProps<T, U>) => React.Component<EditFormProps<T, U>, any>;
  abstract listDataKey: string;
  abstract itemTypeName: string;
  abstract urlBase: string;
  abstract identifierKey: string;
  abstract labelKey: string;

  constructor(props) {
    super(props);
    this.editItem = this.editItem.bind(this);
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

        { !this.props.isFetching && !this.props.editOrCreate && this.props.data && this.props.data[this.listDataKey] && this.props.data[this.listDataKey].length > 0 &&
          <div>
            <h2>Edit {this.itemTypeName} configurations</h2>
            <ul>
              { this.props.data[this.listDataKey].map((item, index) =>
                  <li key={index}>
                    <h3>{item[this.labelKey]}</h3>
                    <a href={this.urlBase + "edit/" + item[this.identifierKey]}>Edit {this.itemTypeName}</a>
                  </li>
                )
              }
            </ul>
          </div>
        }

        { !this.props.isFetching && !this.props.editOrCreate &&
          <a href={this.urlBase + "create"}>Create a new {this.itemTypeName}</a>
        }

        { !this.props.isFetching && (this.props.editOrCreate === "create") &&
          <div>
            <h2>Create a new {this.itemTypeName}</h2>
            <EditForm
              data={this.props.data}
              csrfToken={this.props.csrfToken}
              disabled={this.props.isFetching}
              editItem={this.editItem}
              />
          </div>
        }

        { !this.props.isFetching && this.itemToEdit() &&
          <div>
            <h2>Edit {this.itemTypeName}</h2>
            <EditForm
              item={this.itemToEdit()}
              data={this.props.data}
              csrfToken={this.props.csrfToken}
              disabled={this.props.isFetching}
              editItem={this.editItem}
              />
          </div>
        }
      </div>
    );
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
        if (item[this.identifierKey] === this.props.identifier) {
          return item;
        }
      }
    }
    return null;
  }
}

export default EditableConfigList;