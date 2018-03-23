import * as React from "react";
import { CustomListDetailsData, CustomListEntryData, CollectionData as AdminCollectionData } from "../interfaces";
import { CollectionData } from "opds-web-client/lib/interfaces";
import TextWithEditMode from "./TextWithEditMode";
import EditableInput from "./EditableInput";
import CustomListEntriesEditor from "./CustomListEntriesEditor";
import XCloseIcon from "./icons/XCloseIcon";
import SearchIcon from "./icons/SearchIcon";

export interface CustomListEditorProps extends React.Props<CustomListEditor> {
  library: string;
  list?: CustomListDetailsData;
  collections?: AdminCollectionData[];
  editedIdentifier?: string;
  searchResults?: CollectionData;
  editCustomList: (data: FormData, listId?: string) => Promise<void>;
  search: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  isFetchingMoreSearchResults: boolean;
}

export interface Media {
  type: string;
  label: string;
  active: boolean;
}

export interface CustomListEditorState {
  name: string;
  entries: CustomListEntryData[];
  collections: AdminCollectionData[];
  media?: Media[];
}

/** Right panel of the lists page for editing a single list. */
export default class CustomListEditor extends React.Component<CustomListEditorProps, CustomListEditorState> {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.list && this.props.list.name,
      entries: (this.props.list && this.props.list.entries) || [],
      collections: (this.props.list && this.props.list.collections) || [],
      media: [
        { type: "all", label: "All", active: true },
        { type: "audiobooks", label: "Audiobooks", active: false },
        { type: "ebooks", label: "E-books", active: false }
      ],
    };

    this.changeName = this.changeName.bind(this);
    this.changeEntries = this.changeEntries.bind(this);
    this.save = this.save.bind(this);
    this.reset = this.reset.bind(this);
    this.search = this.search.bind(this);
    this.changeMedia = this.changeMedia.bind(this);
    this.getMediaTerm = this.getMediaTerm.bind(this);
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
            { this.props.collections && this.props.collections.length > 0 &&
              <div>
                <span>Automatically add new books from these collections to this list:</span>
                <div className="collections">
                  { this.props.collections.map(collection =>
                      <EditableInput
                        key={collection.id}
                        type="checkbox"
                        name="collection"
                        checked={this.hasCollection(collection)}
                        label={collection.name}
                        value={String(collection.id)}
                        onChange={() => {this.changeCollection(collection);}}
                        />
                    )
                  }
                </div>
                <span>Select the media to search for:</span>
                <div className="media-selection">
                  {
                    this.state.media.map(media =>
                      <EditableInput
                        key={media.type}
                        type="radio"
                        name="media-selection"
                        checked={media.active}
                        label={media.label}
                        value={media.type}
                        onChange={() => this.changeMedia(media)}
                      />
                    )
                  }
                </div>
              </div>
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
                >Cancel changes
                  <XCloseIcon />
              </a>
            }
          </span>
        </div>
        <div className="custom-list-editor-body">
          <h4>Search for titles</h4>
          <form className="form-inline" onSubmit={this.search}>
            <input
              className="form-control"
              ref="searchTerms"
              type="text"
              />&nbsp;
            <button
              className="btn btn-default"
              type="submit">Search
                <SearchIcon />
            </button>
          </form>

          <CustomListEntriesEditor
            searchResults={this.props.searchResults}
            entries={this.props.list && this.props.list.entries}
            loadMoreSearchResults={this.props.loadMoreSearchResults}
            onUpdate={this.changeEntries}
            isFetchingMoreSearchResults={this.props.isFetchingMoreSearchResults}
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
        entries: (nextProps.list && nextProps.list.entries) || [],
        collections: (nextProps.list && nextProps.list.collections) || []
      });
    }
    else if ((!this.props.list || !this.props.list.collections) && nextProps.list && nextProps.list.collections) {
      this.setState({
        name: this.state.name,
        entries: this.state.entries,
        collections: nextProps.list.collections
      });
    }
  }

  hasChanges(): boolean {
    const nameChanged = (this.props.list && this.props.list.name !== this.state.name);
    let entriesChanged = false;
    if (this.props.list && this.props.list.entries.length !== this.state.entries.length) {
      entriesChanged = true;
    } else {
      let propsPwids = ((this.props.list && this.props.list.entries) || []).map(entry => entry.pwid).sort();
      let statePwids = this.state.entries.map(entry => entry.pwid).sort();
      for (let i = 0; i < propsPwids.length; i++) {
        if (propsPwids[i] !== statePwids[i]) {
          entriesChanged = true;
          break;
        }
      }
    }
    let collectionsChanged = false;
    if (this.props.list && this.props.list.collections && this.props.list.collections.length !== this.state.collections.length) {
      collectionsChanged = true;
    } else {
      let propsIds = ((this.props.list && this.props.list.collections) || []).map(collection => collection.id).sort();
      let stateIds = this.state.collections.map(collection => collection.id).sort();
      for (let i = 0; i < propsIds.length; i++) {
        if (propsIds[i] !== stateIds[i]) {
          collectionsChanged = true;
          break;
        }
      }
    }
    return nameChanged || entriesChanged || collectionsChanged;
  }

  changeName(name: string) {
    this.setState({ name, entries: this.state.entries, collections: this.state.collections });
  }

  changeEntries(entries: CustomListEntryData[]) {
    this.setState({ entries, name: this.state.name, collections: this.state.collections });
  }

  hasCollection(collection: AdminCollectionData) {
    for (const stateCollection of this.state.collections) {
      if (stateCollection.id === collection.id) {
        return true;
      }
    }
    return false;
  }

  changeCollection(collection: AdminCollectionData) {
    const hasCollection = this.hasCollection(collection);
    let newCollections;
    if (hasCollection) {
      newCollections = this.state.collections.filter(stateCollection => stateCollection.id !== collection.id);
    } else {
      newCollections = this.state.collections.slice(0);
      newCollections.push(collection);
    }
    this.setState({ name: this.state.name, entries: this.state.entries, collections: newCollections });
  }

  changeMedia(media: Media) {
    const updatedMedia = this.state.media.map(m => {
      if (m.type === media.type) {
        m.active = true;
      } else {
        m.active = false;
      }
      return m;
    });

    this.setState({
      name: this.state.name,
      entries: this.state.entries,
      collections: this.state.collections,
      media: updatedMedia
    });
  }

  save() {
    const data = new (window as any).FormData();
    if (this.props.list) {
      data.append("id", this.props.list.id);
    }
    let name = (this.refs["listName"] as TextWithEditMode).getText();
    data.append("name", name);
    let entries = (this.refs["listEntries"] as CustomListEntriesEditor).getEntries();
    data.append("entries", JSON.stringify(entries));
    let collections = this.state.collections.map(collection => collection.id);
    data.append("collections", JSON.stringify(collections));
    this.props.editCustomList(data, this.props.list && String(this.props.list.id)).then(() => {
      // If a new list was created, go to the new list's edit page.
      if (!this.props.list && this.props.editedIdentifier) {
        window.location.href = "/admin/web/lists/" + this.props.library + "/edit/" + this.props.editedIdentifier;
      }
    });
  }

  reset() {
    (this.refs["listName"] as TextWithEditMode).reset();
    (this.refs["listEntries"] as CustomListEntriesEditor).reset();
    this.setState({
      name: this.state.name,
      entries: this.state.entries,
      collections: (this.props.list && this.props.list.collections) || []
    });
  }

  getMediaTerm() {
    let media = '';

    this.state.media.map(m => {
      if (m.active && m.type !== "all") {
        media = `&media=${encodeURIComponent(m.type)}`;
      }
    });

    return media;
  }

  search(event) {
    event.preventDefault();
    const searchTerms = encodeURIComponent((this.refs["searchTerms"] as HTMLInputElement).value);
    const mediaTerm = this.getMediaTerm();
    console.log(mediaTerm);
    const url = "/" + this.props.library + "/search?q=" + searchTerms + mediaTerm;
    this.props.search(url);
  }
}
