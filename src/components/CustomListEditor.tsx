import * as React from "react";
import { CustomListData, CustomListEntryData } from "../interfaces";
import { CollectionData } from "opds-web-client/lib/interfaces";
import TextWithEditMode from "./TextWithEditMode";
import CustomListEntriesEditor from "./CustomListEntriesEditor";

export interface CustomListEditorProps extends React.Props<CustomListEditor> {
  csrfToken: string;
  library: string;
  list?: CustomListData;
  editedIdentifier?: string;
  searchResults?: CollectionData;
  editCustomList: (data: FormData) => Promise<void>;
  search: (url: string) => Promise<CollectionData>;
}

export interface CustomListEditorState {
  name: string;
  entries: CustomListEntryData[];
}

export default class CustomListEditor extends React.Component<CustomListEditorProps, CustomListEditorState> {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.list && this.props.list.name,
      entries: this.props.list && this.props.list.entries || []
    };

    this.changeName = this.changeName.bind(this);
    this.changeEntries = this.changeEntries.bind(this);
    this.save = this.save.bind(this);
    this.reset = this.reset.bind(this);
    this.search = this.search.bind(this);
  }

  render(): JSX.Element {
    return (
      <div className="custom-list-editor">
        <div className="custom-list-editor-header">
          <div>
            <TextWithEditMode
              text={this.props.list && this.props.list.name}
              placeholder="list name"
              onUpdate={this.changeName}
              ref="listName"
              />
            { this.props.list &&
              <h4>ID-{this.props.list.id}</h4>
            }
          </div>
          <span>
            <button
              className="btn btn-default save-list"
              onClick={this.save}
              >Save this list</button>
            { this.hasChanges() &&
              <a
                href="#"
                className="cancel-changes"
                onClick={this.reset}
                >Cancel changes</a>
            }
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
            onUpdate={this.changeEntries}
            ref="listEntries"
            />
        </div>
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.list && (!nextProps.list || nextProps.list.id !== this.props.list.id)) {
      this.setState({
        name: nextProps.list && nextProps.list.name,
        entries: nextProps.list && nextProps.list.entries
      });
    }
  }

  hasChanges(): boolean {
    const nameChanged = (this.props.list && this.props.list.name !== this.state.name);
    let entriesChanged = false;
    if (this.props.list && this.props.list.entries.length !== this.state.entries.length) {
      entriesChanged = true;
    } else {
      for (const propEntry of this.props.list && this.props.list.entries || []) {
        let found = false;
        for (const stateEntry of this.state.entries) {
          if (stateEntry.pwid === propEntry.pwid) {
            found = true;
            break;
          }
        }
        if (!found) {
          entriesChanged = true;
          break;
        }
      }
    }
    return nameChanged || entriesChanged;
  }

  changeName(name: string) {
    this.setState({ name, entries: this.state.entries });
  }

  changeEntries(entries: CustomListEntryData[]) {
    this.setState({ entries, name: this.state.name });
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
      // If a new list was created, go to the new list's edit page.
      if (!this.props.list && this.props.editedIdentifier) {
        window.location.href = "/admin/web/lists/" + this.props.library + "/edit/" + this.props.editedIdentifier;
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