import * as React from "react";
import { CustomListData } from "../interfaces";
import { CollectionData } from "opds-web-client/lib/interfaces";
import TextWithEditMode from "./TextWithEditMode";
import CustomListEntriesEditor from "./CustomListEntriesEditor";

export interface CustomListEditorProps extends React.Props<CustomListEditor> {
  csrfToken: string;
  library: string;
  list?: CustomListData;
  searchResults?: CollectionData;
  editCustomList: (data: FormData) => Promise<void>;
  search: (url: string) => Promise<CollectionData>;
}

export default class CustomListEditor extends React.Component<CustomListEditorProps, void> {
  constructor(props) {
    super(props);
    this.save = this.save.bind(this);
    this.reset = this.reset.bind(this);
    this.search = this.search.bind(this);
  }

  render(): JSX.Element {
    return (
      <div className="custom-list-editor">
        <div className="custom-list-editor-header">
          <TextWithEditMode
            text={this.props.list && this.props.list.name}
            placeholder="list name"
            ref="listName"
            />
          <span>
            <button
              className="btn btn-default save-list"
              onClick={this.save}
              >Save this list</button>
            <a
              href="#"
              className="cancel-changes"
              onClick={this.reset}
              >Cancel changes</a>
          </span>
        </div>
        <div>
          <h4>Search for titles</h4>
          <form className="form-inline" onSubmit={this.search}>
            <input
              className="form-control"
              ref="searchTerms"
              type="text"
              />&nbsp;
            <button
              className="btn btn-default"
              type="submit">Search</button>
          </form>

          <CustomListEntriesEditor
            searchResults={this.props.searchResults}
            entries={this.props.list && this.props.list.entries}
            ref="listEntries"
            />
        </div>
      </div>
    );
  }

  save() {
    const data = new (window as any).FormData();
    data.append("csrf_token", this.props.csrfToken);
    if (this.props.list) {
      data.append("id", this.props.list.id);
    }
    let name = (this.refs["listName"] as TextWithEditMode).getText();
    data.append("name", name);
    let entries = (this.refs["listEntries"] as CustomListEntriesEditor).getEntries();
    data.append("entries", JSON.stringify(entries));
    this.props.editCustomList(data).then(() => {
      // If a new list was created, go back to the main list manager page.
      if (!this.props.list) {
        window.location.href = "/admin/web/lists/" + this.props.library;
      }
    });
  }

  reset() {
    (this.refs["listName"] as TextWithEditMode).reset();
    (this.refs["listEntries"] as CustomListEntriesEditor).reset();
  }

  search(event) {
    event.preventDefault();
    const searchTerms = encodeURIComponent((this.refs["searchTerms"] as HTMLInputElement).value);
    const url = "/" + this.props.library + "/search?q=" + searchTerms;
    this.props.search(url);
  }
}