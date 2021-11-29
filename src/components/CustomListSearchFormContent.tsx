import * as React from "react";
import { LanguagesData, LibraryData } from "../interfaces";
import CustomListSearchAdvancedOptions from "./CustomListSearchAdvancedOptions";
import EditableInput from "./EditableInput";
import { EntryPoint } from "./CustomListSearch";

export interface CustomListSearchFormContentProps {
  entryPoints?: string[];
  setSelectedEntryPoint?: (entryPoint: EntryPoint) => void;
  selectedEntryPoint: string;
  languages: LanguagesData;
  searchTerms: string;
  setSearchTerms: (value) => void;
  sortBy: string | null;
  setSortBy: (value) => void;
  selectedLanguage: string;
  setSelectedLanguage: (value) => void;
  library: LibraryData;
}

export default function CustomListSearchFormContent({
  entryPoints,
  setSelectedEntryPoint,
  selectedEntryPoint,
  languages,
  searchTerms,
  setSearchTerms,
  sortBy,
  setSortBy,
  selectedLanguage,
  setSelectedLanguage,
  library,
}: CustomListSearchFormContentProps): JSX.Element {
  return (
    <>
      <fieldset key="search">
        <legend className="visuallyHidden">Search for titles</legend>
        {entryPoints && entryPoints.length && (
          <div className="entry-points">
            <span>Select the entry point to search for:</span>
            <div className="entry-points-selection">
              {!entryPoints.includes("All") && (
                <EditableInput
                  key="All"
                  type="radio"
                  name="entry-points-selection"
                  checked={"All" === selectedEntryPoint}
                  label="All"
                  value="All"
                  onChange={() => setSelectedEntryPoint("All")}
                />
              )}
              {entryPoints.map((entryPoint) => (
                <EditableInput
                  key={entryPoint}
                  type="radio"
                  name="entry-points-selection"
                  checked={entryPoint === selectedEntryPoint}
                  label={entryPoint}
                  value={entryPoint}
                  onChange={() =>
                    setSelectedEntryPoint(entryPoint as EntryPoint)
                  }
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
          value={searchTerms}
          onChange={(e) => setSearchTerms(e.target.value)}
        />
      </fieldset>
      <CustomListSearchAdvancedOptions
        key="advancedOptions"
        languages={languages}
        library={library}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
    </>
  );
}
