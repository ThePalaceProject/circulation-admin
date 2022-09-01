import * as React from "react";
import { Panel } from "library-simplified-reusable-components";
import { AdvancedSearchQuery, LanguagesData, LibraryData } from "../interfaces";
import { CustomListEditorSearchParams } from "../reducers/customListEditor";
import AdvancedSearchBuilder from "./AdvancedSearchBuilder";
import CustomListSearchQueryViewer from "./CustomListSearchQueryViewer";
import EditableInput from "./EditableInput";

export interface CustomListSearchProps {
  autoUpdate?: boolean;
  entryPoints: string[];
  isOwner?: boolean;
  languages: LanguagesData;
  library: LibraryData;
  searchParams: CustomListEditorSearchParams;
  showAutoUpdate?: boolean;
  startingTitle?: string;
  updateAutoUpdate?: (value: boolean) => void;
  updateSearchParam?: (name: string, value) => void;
  search: () => void;
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
  autoUpdate,
  entryPoints,
  isOwner,
  library,
  searchParams,
  showAutoUpdate,
  startingTitle,
  updateAutoUpdate,
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

  const readOnly = !isOwner;

  const entryPointsWithAll = entryPoints.includes("All")
    ? entryPoints
    : ["All", ...entryPoints];

  const selectedEntryPoint = searchParams.entryPoint.toLowerCase();

  const renderAdvancedSearchBuilder = (name: string) => {
    const builder = searchParams.advanced[name];

    return (
      <AdvancedSearchBuilder
        isOwner={isOwner}
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

  const searchForm = (
    <div className="search-titles">
      <div className="entry-points">
        <span>Search for:</span>

        <div className="entry-points-selection">
          {entryPointsWithAll.map((entryPoint) => (
            <EditableInput
              disabled={readOnly}
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

      <div className="search-options">
        <span>Sort by:</span>

        <div className="search-options-selection">
          {sorts.map(({ value, label }) => (
            <EditableInput
              disabled={readOnly}
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
          Results can be sorted by attributes that are enabled in this library's
          Lanes &amp; Filters configuration. Selecting "Title" or "Author" will
          automatically filter out less relevant results.
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

      {showAutoUpdate && (
        <div className="auto-update">
          <span>Use search to:</span>

          <div className="auto-update-selection">
            <div>
              <EditableInput
                disabled={readOnly}
                type="radio"
                name="auto-update"
                checked={autoUpdate}
                label={"Automatically update this list"}
                onChange={() => updateAutoUpdate?.(true)}
              />

              <aside>
                The system will periodically execute this search and
                automatically update the list with the results.
                {!readOnly &&
                  "The search results below represent the titles that would be in the list if it were updated now, but the actual contents of the list will change over time."}
              </aside>
            </div>

            <div>
              <EditableInput
                disabled={readOnly}
                type="radio"
                name="auto-update"
                checked={!autoUpdate}
                label={"Manually select titles"}
                onChange={() => updateAutoUpdate?.(false)}
              />

              <aside>
                The list entries are manually selected.{" "}
                {!readOnly &&
                  "Move the desired titles from the search results column on the left to the column on the right to add them to the list. "}
                Titles may be removed from the list automatically if they become
                unavailable, but the list is otherwise fixed.
              </aside>
            </div>
          </div>
        </div>
      )}
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
