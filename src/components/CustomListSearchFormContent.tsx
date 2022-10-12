import * as React from "react";
import { LanguagesData, LibraryData } from "../interfaces";
import CustomListSearchAdvancedOptions from "./CustomListSearchAdvancedOptions";
import EditableInput from "./EditableInput";

export interface CustomListSearchFormContentProps {
  entryPoints?: string[];
  languages: LanguagesData;
  library: LibraryData;
  searchTerms: string;
  selectedEntryPoint: string;
  selectedLanguage: string;
  setSearchTerms: (value) => void;
  setSelectedEntryPoint?: (entryPoint: string) => void;
  setSelectedLanguage: (value) => void;
  setSortBy: (value) => void;
  sortBy: string | null;
}

export default function CustomListSearchFormContent({
  entryPoints,
  languages,
  library,
  searchTerms,
  selectedEntryPoint,
  selectedLanguage,
  setSearchTerms,
  setSelectedEntryPoint,
  setSelectedLanguage,
  setSortBy,
  sortBy,
}: CustomListSearchFormContentProps): JSX.Element {
  return (
    <>
      <fieldset key="search">
        <legend className="visuallyHidden">Search for titles</legend>
        {entryPoints && entryPoints.length && (
          <div className="entry-points">
            <span>Select the entry point to search for:</span>
            <div className="entry-points-selection">
              {/* We always want to display "All" as an entrypoint,
              even if it's not selected on the backend. */}
              {!entryPoints.includes("All") && entryPoints.length > 1 && (
                <EditableInput
                  checked={selectedEntryPoint === "All"}
                  key="All"
                  label="All"
                  name="entry-points-selection"
                  onChange={() => setSelectedEntryPoint("All")}
                  type="radio"
                  value="All"
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
                  onChange={() => setSelectedEntryPoint(entryPoint)}
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
