import * as React from "react";
import { Panel, Form } from "library-simplified-reusable-components";
import { LanguagesData, LibraryData } from "../interfaces";
import { CustomListEditorSearchParams } from "../reducers/customListEditor";
import SearchIcon from "./icons/SearchIcon";
import EditableInput from "./EditableInput";

export interface CustomListSearchProps {
  entryPoints: string[];
  languages: LanguagesData;
  library: LibraryData;
  searchParams: CustomListEditorSearchParams;
  startingTitle?: string;
  search: () => void;
  updateSearchParam?: (name: string, value) => void;
}

const CustomListSearch = ({
  entryPoints,
  languages,
  library,
  searchParams,
  startingTitle,
  updateSearchParam,
  search,
}: CustomListSearchProps) => {
  React.useEffect(() => {
    if (startingTitle) {
      updateSearchParam?.("terms", startingTitle);
      search?.();
    }
  }, []);

  const entryPointsWithAll = entryPoints.includes("All")
    ? entryPoints
    : ["All", ...entryPoints];

  const selectedEntryPoint = searchParams.entryPoint.toLowerCase();

  const searchBox = (
    <fieldset key="search">
      <legend className="visuallyHidden">Search for titles</legend>

      {entryPointsWithAll.length > 0 && (
        <div className="entry-points">
          <span>Select the entry point to search for:</span>

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
      )}

      <input
        aria-label="Search for a book title"
        className="form-control"
        type="text"
        placeholder="Enter a search term"
        value={startingTitle || searchParams.terms}
        onChange={(event) => updateSearchParam?.("terms", event.target.value)}
      />
    </fieldset>
  );

  const librarySettings = library?.settings || {};

  const languageCodes = Object.entries(librarySettings)
    .filter(([key]) => key.match(/_collections/))
    .flatMap(([, value]) => value as string[]);

  const languageOptions = (
    <fieldset key="languages" className="well search-options">
      <legend>Filter by language:</legend>

      <section>
        <select
          value={searchParams.language}
          onBlur={(event) =>
            updateSearchParam?.("language", event.target.value)
          }
          onChange={(event) =>
            updateSearchParam?.("language", event.target.value)
          }
        >
          <option value="all" aria-selected={false}>
            All
          </option>

          {languageCodes.map((code) => (
            <option key={code} value={code} aria-selected={false}>
              {languages?.[code].join("; ")}
            </option>
          ))}
        </select>
      </section>
    </fieldset>
  );

  const sorts = [
    ["Relevance (default)", null],
    ["Title", "title"],
    ["Author", "author"],
  ];

  const sortOptions = (
    <fieldset key="sortBy" className="well search-options">
      <legend>Sort by:</legend>

      <ul>
        {sorts.map(([label, value]) => (
          <li key={value}>
            <EditableInput
              type="radio"
              name={value}
              value={value}
              label={label}
              checked={value === searchParams.sort}
              onChange={() => updateSearchParam?.("sort", value)}
            />
          </li>
        ))}
      </ul>

      <p>
        <i>
          Note: currently, you can sort only by attributes which you have
          enabled in this library's Lanes & Filters configuration.
        </i>
      </p>

      <p>
        <i>
          Selecting "Title" or "Author" will automatically filter out less
          relevant results.
        </i>
      </p>
    </fieldset>
  );

  const searchOptions = (
    <Panel
      id="advanced-search-options"
      key="advanced-search-options"
      style="instruction"
      headerText="Advanced search options"
      content={[sortOptions, languageOptions]}
    />
  );

  const searchForm = (
    <Form
      onSubmit={search}
      content={[searchBox, searchOptions]}
      buttonClass="left-align"
      buttonContent={
        <span>
          Search
          <SearchIcon />
        </span>
      }
      className="search-titles"
    />
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
