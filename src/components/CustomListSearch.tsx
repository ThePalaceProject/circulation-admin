import * as React from "react";
import { Panel } from "library-simplified-reusable-components";
import { AdvancedSearchQuery, LanguagesData, LibraryData } from "../interfaces";
import { CustomListEditorSearchParams } from "../reducers/customListEditor";
import SearchIcon from "./icons/SearchIcon";
import AdvancedSearchBuilder from "./AdvancedSearchBuilder";
import CustomListSearchQueryViewer from "./CustomListSearchQueryViewer";
import EditableInput from "./EditableInput";

export interface CustomListSearchProps {
  entryPoints: string[];
  languages: LanguagesData;
  library: LibraryData;
  searchParams: CustomListEditorSearchParams;
  startingTitle?: string;
  search: () => void;
  updateSearchParam?: (name: string, value) => void;
  addAdvSearchQuery?: (builderName: string, query: AdvancedSearchQuery) => void;
  updateAdvSearchQueryBoolean?: (
    builderName: string,
    id: string,
    bool: string
  ) => void;
  moveAdvSearchQuery?: (
    builderName: string,
    id: string,
    targetId: string
  ) => void;
  removeAdvSearchQuery?: (builderName: string, id: string) => void;
  selectAdvSearchQuery?: (builderName: string, id: string) => void;
}

const sorts = [
  { value: null, label: "Relevance" },
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
];

const CustomListSearch = ({
  entryPoints,
  // languages,
  library,
  searchParams,
  startingTitle,
  updateSearchParam,
  search,
  addAdvSearchQuery,
  updateAdvSearchQueryBoolean,
  moveAdvSearchQuery,
  removeAdvSearchQuery,
  selectAdvSearchQuery,
}: CustomListSearchProps) => {
  React.useEffect(() => {
    if (startingTitle) {
      addAdvSearchQuery?.("include", {
        key: "title",
        op: "eq",
        value: startingTitle,
      });

      search?.();
    }
  }, []);

  const entryPointsWithAll = entryPoints.includes("All")
    ? entryPoints
    : ["All", ...entryPoints];

  const selectedEntryPoint = searchParams.entryPoint.toLowerCase();

  const renderAdvancedSearchBuilder = (name: string) => {
    const builder = searchParams.advanced[name];

    return (
      <AdvancedSearchBuilder
        name={name}
        query={builder.query}
        selectedQueryId={builder.selectedQueryId}
        addQuery={addAdvSearchQuery}
        updateQueryBoolean={updateAdvSearchQueryBoolean}
        moveQuery={moveAdvSearchQuery}
        removeQuery={removeAdvSearchQuery}
        selectQuery={selectAdvSearchQuery}
      />
    );
  };

  const canSearch =
    searchParams.terms ||
    searchParams.advanced.include.query ||
    searchParams.advanced.exclude.query;

  const searchForm = (
    <div className="search-titles">
      <div className="entry-points" key="entry-point-options">
        <span>Search for:</span>

        <div className="entry-points-selection">
          {entryPointsWithAll.map((entryPoint) => (
            <EditableInput
              key={entryPoint}
              type="radio"
              name="entry-points-selection"
              checked={entryPoint.toLowerCase() === selectedEntryPoint}
              label={entryPoint}
              value={entryPoint}
              onChange={() => updateSearchParam?.("entryPoint", entryPoint)}
            />
          ))}
        </div>
      </div>

      <div className="search-options" key="sort-options">
        <span>Sort by:</span>

        <div className="search-options-selection">
          {sorts.map(({ value, label }) => (
            <EditableInput
              key={value}
              type="radio"
              name="sort-selection"
              value={value}
              label={label}
              checked={value === searchParams.sort}
              onChange={() => updateSearchParam?.("sort", value)}
            />
          ))}
        </div>

        <aside>
          Note: Results can be sorted by attributes that are enabled in this
          library's Lanes &amp; Filters configuration. Selecting "Title" or
          "Author" will automatically filter out less relevant results.
        </aside>
      </div>

      <div className="search-builders">
        <Panel
          headerText="Works to include"
          id="search-filters-include"
          openByDefault={true}
          content={renderAdvancedSearchBuilder("include")}
        />

        <Panel
          headerText="Works to exclude"
          id="search-filters-exclude"
          openByDefault={false}
          content={renderAdvancedSearchBuilder("exclude")}
        />
      </div>

      <div key="query-viewer">
        <CustomListSearchQueryViewer
          library={library?.short_name}
          searchParams={searchParams}
        />
      </div>

      <button
        className="btn left-align"
        disabled={!canSearch}
        type="button"
        onClick={search}
      >
        <span>
          Search
          <SearchIcon />
        </span>
      </button>
    </div>
  );

  return (
    <Panel
      headerText="Search for titles"
      id="search-titles"
      openByDefault={true}
      onEnter={search}
      content={searchForm}
    />
  );
};

export default CustomListSearch;
