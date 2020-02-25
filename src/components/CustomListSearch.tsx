import * as React from "react";
import EditableInput from "./EditableInput";
import SearchIcon from "./icons/SearchIcon";
import { Button, Panel, Form } from "library-simplified-reusable-components";

export interface CustomListSearchProps {
  search: (searchTerms: string, sortBy: string) => void;
  entryPoints?: string[];
  getEntryPointsElms?: (entryPoints: string[]) => {};
}

export interface CustomListSearchState {
  sortBy?: string;
}

export default class CustomListSearch extends React.Component<CustomListSearchProps, CustomListSearchState> {
  constructor(props: CustomListSearchProps) {
    super(props);
    this.submitSearch = this.submitSearch.bind(this);
    this.sort = this.sort.bind(this);
    this.state = { sortBy: "score" };
  }
  submitSearch() {
    const searchTerms = encodeURIComponent((this.refs["searchTerms"] as HTMLInputElement).value);
    this.props.search(searchTerms, this.state.sortBy);
  }
  sort(sortBy: string) {
    this.setState({ sortBy });
  }
  render(): JSX.Element {
    const sortBy = {"Relevance (default)": "score", "Title": "title", "Author": "author"};

    const searchOptions = (
      <Panel
        id="advanced-search-options"
        key="advanced-search-options"
        style="instruction"
        headerText="Advanced search options"
        openByDefault={true}
        content={[
            <fieldset key="sortBy" className="search-options">
              <legend>Sort by:</legend>
              <ul>
                {
                  Object.keys(sortBy).map(x => (
                      <li key={sortBy[x]}><EditableInput
                        type="radio"
                        name={sortBy[x]}
                        value={sortBy[x]}
                        label={x}
                        ref={sortBy[x]}
                        checked={sortBy[x] === this.state.sortBy}
                        onChange={() => this.sort(sortBy[x])}
                      /></li>
                    ))
                  }
                </ul>
                <p><i>Selecting "Title" or "Author" will automatically filter out less relevant results.</i></p>
              </fieldset>
            ]}
          />
        );
    const searchForm = (
      <Form
        onSubmit={this.submitSearch}
        content={[
          <fieldset key="search">
            <legend className="visuallyHidden">Search for titles</legend>
            {
              this.props.entryPoints?.length ? (
                <div className="entry-points">
                  <span>Select the entry point to search for:</span>
                  <div className="entry-points-selection">
                    {this.props.getEntryPointsElms(this.props.entryPoints)}
                  </div>
                </div>
              ) : null
            }
            <input
              aria-label="Search for a book title"
              className="form-control"
              ref="searchTerms"
              type="text"
              placeholder="Enter a search term"
            />
          </fieldset>,
          searchOptions
        ]}
        buttonClass="left-align"
        buttonContent={<span>Search<SearchIcon /></span>}
      />
    );

    return (
      <Panel
        headerText="Search for titles"
        id="search-titles"
        openByDefault={true}
        onEnter={this.submitSearch}
        content={searchForm}
      />
    );
  }
}
