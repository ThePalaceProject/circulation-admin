import * as React from "react";
import EditableInput from "./EditableInput";
import { LanguagesData, LibraryData } from "../interfaces";
import { Panel } from "library-simplified-reusable-components";

export interface CustomListSearchAdvancedOptionsProps {
  languages: LanguagesData;
  library: LibraryData;
  sortBy: string | null;
  setSortBy: (value) => void;
  selectedLanguage: string;
  setSelectedLanguage: (value) => void;
}

export default function CustomListSearchAdvancedOptions({
  languages,
  library,
  sortBy,
  setSortBy,
  setSelectedLanguage,
  selectedLanguage,
}: CustomListSearchAdvancedOptionsProps): JSX.Element {
  const sortByOptions = {
    "Relevance (default)": null,
    Title: "title",
    Author: "author",
  };

  const languageFields =
    library?.settings &&
    Object.keys(library.settings).filter((x) => x.match(/_collections/));

  const languagesToMap = [].concat(
    ...languageFields?.map((x) => library.settings[x])
  );

  const getLanguageName = (languageAbbreviation: string): string => {
    return languages && languages[languageAbbreviation].join("; ");
  };

  return (
    <Panel
      id="advanced-search-options"
      key="advanced-search-options"
      style="instruction"
      headerText="Advanced search options"
      content={[
        <fieldset key="sortBy" className="well search-options">
          <legend>Sort by:</legend>
          <ul>
            {Object.keys(sortByOptions).map((option) => (
              <li key={sortByOptions[option]}>
                <EditableInput
                  type="radio"
                  name={sortByOptions[option]}
                  value={sortByOptions[option]}
                  label={option}
                  checked={sortByOptions[option] === sortBy}
                  onChange={() => setSortBy(sortByOptions[option])}
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
        </fieldset>,
        <fieldset key="languages" className="well search-options">
          <legend>Filter by language:</legend>
          <section>
            {/* eslint-disable-next-line jsx-a11y/no-onchange */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="all" aria-selected={false}>
                All
              </option>
              {languagesToMap.length &&
                languagesToMap.map((x) => (
                  <option key={x} value={x} aria-selected={false}>
                    {getLanguageName(x)}
                  </option>
                ))}
            </select>
          </section>
        </fieldset>,
      ]}
    />
  );
}
