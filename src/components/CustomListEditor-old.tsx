import * as React from "react";
import {
  LanguagesData,
  LibraryData,
  CollectionData as AdminCollectionData,
} from "../interfaces";
import { CollectionData, BookData } from "opds-web-client/lib/interfaces";
import TextWithEditMode from "./TextWithEditMode";
import EditableInput from "./EditableInput";
import CustomListEntriesEditor, { Entry } from "./CustomListEntriesEditor";
import CustomListSearch from "./CustomListSearch";
import SearchIcon from "./icons/SearchIcon";
import { Button, Panel, Form } from "library-simplified-reusable-components";
import { browserHistory } from "react-router";
// import CustomListEditorHeader from "./CustomListEditorHeader";
// import CustomListEditorBody from "./CustomListEditorBody";

export interface CustomListEditorProps {
  languages: LanguagesData;
  library: LibraryData;
  list?: CollectionData;
  listId?: string | number;
  listCollections?: AdminCollectionData[];
  collections?: AdminCollectionData[];
  responseBody?: string;
  searchResults?: CollectionData;
  editCustomList: (data: FormData, listId?: string) => Promise<void>;
  search: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  isFetchingMoreSearchResults: boolean;
  isFetchingMoreCustomListEntries: boolean;
  entryPoints?: string[];
  entryCount?: string;
  startingTitle?: string;
}

export interface CustomListEditorState {
  title: string;
  entries: Entry[];
  collections?: AdminCollectionData[];
  entryPointSelected?: string;
}

// export default function CustomListEditor({
//   languages,
//   library,
//   list,
//   listId,
//   listCollections,
//   collections,
//   responseBody,
//   searchResults,
//   editCustomList,
//   search,
//   loadMoreSearchResults,
//   loadMoreEntries,
//   isFetchingMoreSearchResults,
//   isFetchingMoreCustomListEntries,
//   entryPoints,
//   entryCount,
//   startingTitle,
// }: CustomListEditorProps): JSX.Element {
//   const [listTitle, setListTitle] = React.useState<string>(
//     (list && list.title) || ""
//   );
//   const [entries, setEntries] = React.useState<Entry[]>(list ? list.books : []);
//   const [deletedEntries, setDeletedEntries] = React.useState<Entry[]>([]);
//   const [collectionsOnState, setCollectionsOnState] = React.useState<
//     AdminCollectionData[]
//   >(listCollections || []);
//   const [entryPointSelected, setEntryPointSelected] = React.useState<string>(
//     "all"
//   );
//   console.log("list ==", list);

//   const crawlable = `${listTitle ? `lists/${listTitle}/` : ""}crawlable`;
//   const opdsFeedUrl = `${library?.short_name}/${crawlable}`;

//   // const getEntries = (entries: Entry[]) => {
//   //   setEntries(entries);
//   // };

//   const changeTitle = (title) => {
//     setListTitle(title);
//   };

//   const changeEntries = (entries: Entry[], deletedEntries: Entry[]) => {
//     setEntries(entries);
//     setDeletedEntries(deletedEntries);
//   };

//   React.useEffect(() => {
//     // CustomListEditor.listener = browserHistory.listen((location) => {
//     //         this.setState({ title: "", entries: [], collections: [] });
//     //       });
//     //     }
//     //     componentWillUnmount() {
//     //       CustomListEditor.listener();
//   });

//   // React.useEffect(() => {

//   // }, [list])

// const save = () => {
//   const data = new (window as any).FormData();
//   if (list) {
//     data.append("id", listId);
//   }
//   // const title = (this.refs["listTitle"] as TextWithEditMode).getText();
//   data.append("name", listTitle);
//   // const entries = (this.refs[
//   //   "listEntries"
//   // ] as CustomListEntriesEditor).getEntries();
//   data.append("entries", JSON.stringify(entries));
//   // const deletedEntries = (this.refs[
//   //   "listEntries"
//   // ] as CustomListEntriesEditor).getDeleted();
//   data.append("deletedEntries", JSON.stringify(deletedEntries));
//   const collections = collectionsOnState.map((collection) => collection.id);
//   data.append("collections", JSON.stringify(collections));

//   editCustomList(data, listId && String(listId)).then(() => {
//     // (this.refs["listEntries"] as CustomListEntriesEditor).clearState();
//     // this.setState({ title: this.state.title, entries });

//     // If a new list was created, go to the new list's edit page.
//     if (!list && responseBody) {
//       window.location.href =
//         "/admin/web/lists/" + library.short_name + "/edit/" + responseBody;
//     }
//   });
// };

//   const isTitleOrEntriesEmpty = (): boolean => {
//     // Checks if the list is in a saveable state (aka, has a title and books).
//     if (
//       (list?.title || listTitle) &&
//       listTitle !== "list title" &&
//       entries.length
//     ) {
//       return false;
//     } else {
//       return (
//         !listTitle ||
//         listTitle === "list title" ||
//         listTitle === "" ||
//         entries.length === 0
//       );
//     }
//   };

//   const getEntryPointsElms = (entryPoints) => {
//     const entryPointsElms = [];
//     !entryPoints.includes("All") &&
//       entryPointsElms.push(
//         <EditableInput
//           key="all"
//           type="radio"
//           name="entry-points-selection"
//           checked={"all" === entryPointSelected}
//           label="All"
//           value="all"
//           onChange={() => setEntryPointSelected("all")}
//         />
//       );
//     entryPoints.forEach((entryPoint) =>
//       entryPointsElms.push(
//         <EditableInput
//           key={entryPoint}
//           type="radio"
//           name="entry-points-selection"
//           checked={
//             entryPoint === entryPointSelected ||
//             entryPoint.toLowerCase() === entryPointSelected
//           }
//           label={entryPoint}
//           value={entryPoint}
//           onChange={() => setEntryPointSelected(entryPoint)}
//         />
//       )
//     );
//     return entryPointsElms;
//   };

//   const hasCollection = (collection: AdminCollectionData) => {
//     for (const stateCollection of collectionsOnState) {
//       if (stateCollection.id === collection.id) {
//         return true;
//       }
//     }
//     return false;
//   };

//   const changeCollection = (collection: AdminCollectionData) => {
//     let newCollections;
//     if (hasCollection(collection)) {
//       newCollections = collectionsOnState.filter(
//         (stateCollection) => stateCollection.id !== collection.id
//       );
//     } else {
//       newCollections = collectionsOnState.slice(0);
//       newCollections.push(collection);
//     }

//     setCollectionsOnState(newCollections);
//   };

//   return (
//     <div className="custom-list-editor">
//       <CustomListEditorHeader
//         library={library}
//         list={list}
//         listId={listId}
//         listCollections={listCollections}
//         collections={collections}
//         editCustomList={editCustomList}
//         responseBody={responseBody}
//       />
//       <CustomListEditorBody />
//       {/* <div className="custom-list-editor-header">
//         <div className="edit-custom-list-title">
//           <fieldset className="save-or-edit">
//             <legend className="visuallyHidden">List name</legend>
//             <TextWithEditMode
//               text={listTitle}
//               placeholder="list title"
//               onUpdate={changeTitle}
//               aria-label="Enter a title for this list"
//               disableIfBlank={true}
//             />
//           </fieldset>
//           {listId && <h4>ID-{listId}</h4>}
//         </div>
//         <div className="save-or-cancel-list">
//           <Button
//             callback={save}
//             disabled={isTitleOrEntriesEmpty() || !hasChanges}
//             content="Save this list"
//           />
//           {hasChanges && (
//             <Button
//               className="inverted"
//               callback={reset}
//               content="Cancel Changes"
//             />
//           )}
//         </div>
//       </div> */}
//       {/* <div className="custom-list-editor-body">
//         <section>
//           {collections && collections.length > 0 && (
//             <div className="custom-list-filters">
//               <Panel
//                 headerText="Add from collections"
//                 id="add-from-collections"
//                 content={
//                   <div className="collections">
//                     <div>
//                       Automatically add new books from these collections to this
//                       list:
//                     </div>
//                     {collections.map((collection) => (
//                       <EditableInput
//                         key={collection.id}
//                         type="checkbox"
//                         name="collection"
//                         checked={hasCollection(collection)}
//                         label={collection.name}
//                         value={String(collection.id)}
//                         onChange={() => {
//                           changeCollection(collection);
//                         }}
//                       />
//                     ))}
//                   </div>
//                 }
//               />
//             </div>
//           )}
//           <CustomListSearch
//             search={search}
//             entryPoints={entryPoints}
//             getEntryPointsElms={getEntryPointsElms}
//             startingTitle={startingTitle}
//             library={library}
//             languages={languages}
//           />
//         </section>
//         <CustomListEntriesEditor
//           searchResults={searchResults}
//           entries={list && list.books}
//           nextPageUrl={list && list.nextPageUrl}
//           loadMoreSearchResults={loadMoreSearchResults}
//           loadMoreEntries={loadMoreEntries}
//           onUpdate={changeEntries}
//           isFetchingMoreSearchResults={isFetchingMoreSearchResults}
//           isFetchingMoreCustomListEntries={isFetchingMoreCustomListEntries}
//           // ref="listEntries"
//           opdsFeedUrl={opdsFeedUrl}
//           entryCount={entryCount}
//           listId={listId}
//         />
//       </div> */}
//     </div>
//   );
// }

/** Right panel of the lists page for editing a single list. */
export default class CustomListEditor extends React.Component<
  CustomListEditorProps,
  CustomListEditorState
> {
  static listener;
  constructor(props) {
    super(props);
    this.state = {
      title: this.props.list && this.props.list.title,
      entries: (this.props.list && this.props.list.books) || [],
      collections: this.props.listCollections || [],
      entryPointSelected: "all",
    };

    this.changeTitle = this.changeTitle.bind(this);
    this.changeEntries = this.changeEntries.bind(this);
    this.save = this.save.bind(this);
    this.reset = this.reset.bind(this);
    this.search = this.search.bind(this);
    this.changeEntryPoint = this.changeEntryPoint.bind(this);
    this.getEntryPointsElms = this.getEntryPointsElms.bind(this);
  }

  render(): JSX.Element {
    console.log("testing");
    const listId = this.props.listId;
    const listTitle =
      this.props.list && this.props.list.title ? this.props.list.title : "";
    const nextPageUrl = this.props.list && this.props.list.nextPageUrl;
    const crawlable = `${listTitle ? `lists/${listTitle}/` : ""}crawlable`;
    const opdsFeedUrl = `${this.props.library?.short_name}/${crawlable}`;
    const hasChanges = this.hasChanges();
    // The "save this list" button should be disabled if there are no changes
    // or if the list's title is empty.
    const disableSave = this.isTitleOrEntriesEmpty() || !hasChanges;
    return (
      <div className="custom-list-editor">
        <div className="custom-list-editor-header">
          <div className="edit-custom-list-title">
            <fieldset className="save-or-edit">
              <legend className="visuallyHidden">List name</legend>
              <TextWithEditMode
                text={listTitle}
                placeholder="list title"
                onUpdate={this.changeTitle}
                ref="listTitle"
                aria-label="Enter a title for this list"
                disableIfBlank={true}
              />
            </fieldset>
            {listId && <h4>ID-{listId}</h4>}
          </div>
          <div className="save-or-cancel-list">
            <Button
              callback={this.save}
              disabled={disableSave}
              content="Save this list"
            />
            {hasChanges && (
              <Button
                className="inverted"
                callback={this.reset}
                content="Cancel Changes"
              />
            )}
          </div>
        </div>
        <div className="custom-list-editor-body">
          <section>
            {this.props.collections && this.props.collections.length > 0 && (
              <div className="custom-list-filters">
                <Panel
                  headerText="Add from collections"
                  id="add-from-collections"
                  content={
                    <div className="collections">
                      <div>
                        Automatically add new books from these collections to
                        this list:
                      </div>
                      {this.props.collections.map((collection) => (
                        <EditableInput
                          key={collection.id}
                          type="checkbox"
                          name="collection"
                          checked={this.hasCollection(collection)}
                          label={collection.name}
                          value={String(collection.id)}
                          onChange={() => {
                            this.changeCollection(collection);
                          }}
                        />
                      ))}
                    </div>
                  }
                />
              </div>
            )}
            <CustomListSearch
              search={this.search}
              entryPoints={this.props.entryPoints}
              getEntryPointsElms={this.getEntryPointsElms}
              startingTitle={this.props.startingTitle}
              library={this.props.library}
              languages={this.props.languages}
            />
          </section>
          <CustomListEntriesEditor
            searchResults={this.props.searchResults}
            entries={this.props.list && this.props.list.books}
            nextPageUrl={nextPageUrl}
            loadMoreSearchResults={this.props.loadMoreSearchResults}
            loadMoreEntries={this.props.loadMoreEntries}
            onUpdate={this.changeEntries}
            isFetchingMoreSearchResults={this.props.isFetchingMoreSearchResults}
            isFetchingMoreCustomListEntries={
              this.props.isFetchingMoreCustomListEntries
            }
            ref="listEntries"
            opdsFeedUrl={opdsFeedUrl}
            entryCount={this.props.entryCount}
            listId={this.props.listId}
          />
        </div>
      </div>
    );
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Note: This gets called after performing a search, at which point the
    // state of the component can already have updates that need to be taken
    // into account.
    if (!nextProps.list && !this.props.list) {
      this.setState({ entries: [], collections: [] });
    } else if (nextProps.list && nextProps.listId !== this.props.listId) {
      // Update the state with the next list to edit.
      this.setState({
        title: nextProps.list && nextProps.list.title,
        entries: (nextProps.list && nextProps.list.books) || [],
        collections: (nextProps.list && nextProps.listCollections) || [],
      });
    } else if (
      nextProps.list &&
      nextProps.list.books &&
      nextProps.list.books.length !== this.state.entries.length
    ) {
      let collections = this.state.collections;
      if (
        (!this.props.list || !this.props.listCollections) &&
        nextProps.list &&
        nextProps.listCollections
      ) {
        collections = nextProps.listCollections;
      }
      const title = this.state.title ? this.state.title : nextProps.list.title;
      this.setState({
        title,
        entries: nextProps.list.books,
        collections: collections,
      });
    } else if (
      (!this.props.list || !this.props.listCollections) &&
      nextProps.list &&
      nextProps.listCollections
    ) {
      this.setState({
        title: this.state.title,
        entries: this.state.entries,
        collections: nextProps.listCollections,
      });
    }
  }

  isTitleOrEntriesEmpty(): boolean {
    // Checks if the list is in a saveable state (aka, has a title and books).
    if (
      (this.props.list?.title || this.state.title) &&
      this.state.title !== "list title" &&
      this.state.entries.length
    ) {
      return false;
    } else {
      return (
        !this.state.title ||
        this.state.title === "list title" ||
        this.state.title === "" ||
        this.state.entries.length === 0
      );
    }
  }

  hasChanges(): boolean {
    let titleChanged =
      this.props.list && this.props.list.title !== this.state.title;
    let entriesChanged =
      this.props.list &&
      !!this.props.list.books &&
      this.props.list.books.length !== this.state.entries.length;
    // If the current list is new then this.props.list will be undefined, but
    // the state for the entries or title can be populated so there's a need to check.
    if (!this.props.list) {
      titleChanged = this.state.title && this.state.title !== "";
      entriesChanged = this.state.entries?.length > 0;
    }

    if (!entriesChanged) {
      const propsIds = ((this.props.list && this.props.list.books) || [])
        .map((entry) => entry.id)
        .sort();
      const stateIds = this.state.entries?.map((entry) => entry.id).sort();
      for (let i = 0; i < propsIds.length; i++) {
        if (propsIds[i] !== stateIds[i]) {
          entriesChanged = true;
          break;
        }
      }
    }
    let collectionsChanged = false;
    if (
      this.props.listCollections &&
      this.props.listCollections.length !== this.state.collections.length
    ) {
      collectionsChanged = true;
    } else {
      const propsIds = (this.props.listCollections || [])
        .map((collection) => collection.id)
        .sort();
      const stateIds = this.state.collections
        .map((collection) => collection.id)
        .sort();
      for (let i = 0; i < propsIds.length; i++) {
        if (propsIds[i] !== stateIds[i]) {
          collectionsChanged = true;
          break;
        }
      }
    }
    const hasChanges = titleChanged || entriesChanged || collectionsChanged;
    return hasChanges;
  }

  changeTitle(title: string) {
    this.setState({
      title,
      entries: this.state.entries,
      collections: this.state.collections,
    });
  }

  changeEntries(entries: Entry[]) {
    this.setState({
      entries,
      title: this.state.title,
      collections: this.state.collections,
    });
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
      newCollections = this.state.collections.filter(
        (stateCollection) => stateCollection.id !== collection.id
      );
    } else {
      newCollections = this.state.collections.slice(0);
      newCollections.push(collection);
    }
    this.setState({
      title: this.state.title,
      entries: this.state.entries,
      collections: newCollections,
    });
  }

  changeEntryPoint(entryPointSelected: string) {
    this.setState({
      title: this.state.title,
      entries: this.state.entries,
      collections: this.state.collections,
      entryPointSelected,
    });
  }

  save() {
    const data = new (window as any).FormData();
    if (this.props.list) {
      data.append("id", this.props.listId);
    }
    const title = (this.refs["listTitle"] as TextWithEditMode).getText();
    data.append("name", title);
    const entries = (this.refs[
      "listEntries"
    ] as CustomListEntriesEditor).getEntries();
    data.append("entries", JSON.stringify(entries));
    const deletedEntries = (this.refs[
      "listEntries"
    ] as CustomListEntriesEditor).getDeleted();
    data.append("deletedEntries", JSON.stringify(deletedEntries));
    const collections = this.state.collections.map(
      (collection) => collection.id
    );
    data.append("collections", JSON.stringify(collections));

    this.props
      .editCustomList(data, this.props.listId && String(this.props.listId))
      .then(() => {
        (this.refs["listEntries"] as CustomListEntriesEditor).clearState();
        this.setState({ title: this.state.title, entries });

        // If a new list was created, go to the new list's edit page.
        if (!this.props.list && this.props.responseBody) {
          window.location.href =
            "/admin/web/lists/" +
            this.props.library.short_name +
            "/edit/" +
            this.props.responseBody;
        }
      });
  }

  reset() {
    (this.refs["listTitle"] as TextWithEditMode).reset();
    (this.refs["listEntries"] as CustomListEntriesEditor).reset();
    setTimeout(() => {
      this.setState({
        title: this.state.title,
        entries: this.state.entries,
        collections: this.props.listCollections || [],
        entryPointSelected: "all",
      });
    }, 200);
  }

  getSearchQueries(sortBy: string, language: string) {
    const entryPointSelected = this.state.entryPointSelected;
    let query = "";
    if (entryPointSelected && entryPointSelected !== "all") {
      query += `&entrypoint=${encodeURIComponent(entryPointSelected)}`;
    }
    sortBy && (query += `&order=${encodeURIComponent(sortBy)}`);
    language && (query += `&language=${[language]}`);
    return query;
  }

  getEntryPointsElms(entryPoints) {
    const entryPointsElms = [];
    !entryPoints.includes("All") &&
      entryPointsElms.push(
        <EditableInput
          key="all"
          type="radio"
          name="entry-points-selection"
          checked={"all" === this.state.entryPointSelected}
          label="All"
          value="all"
          onChange={() => this.changeEntryPoint("all")}
        />
      );
    entryPoints.forEach((entryPoint) =>
      entryPointsElms.push(
        <EditableInput
          key={entryPoint}
          type="radio"
          name="entry-points-selection"
          checked={
            entryPoint === this.state.entryPointSelected ||
            entryPoint.toLowerCase() === this.state.entryPointSelected
          }
          label={entryPoint}
          value={entryPoint}
          onChange={() => this.changeEntryPoint(entryPoint)}
        />
      )
    );

    return entryPointsElms;
  }

  /**
   * search()
   * Search for items along with an EntryPoint query and a default
   * language query set to 'all', for librarians who may want to search
   * for items without a language filter.
   */
  search(searchTerms: string, sortBy: string, language: string) {
    const searchQueries = this.getSearchQueries(sortBy, language);
    const url = `/${this.props.library.short_name}/search?q=${searchTerms}${searchQueries}`;
    this.props.search(url);
  }
}
