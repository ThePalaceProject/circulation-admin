import * as React from "react";
import SearchIcon from "./icons/SearchIcon";
import CustomListSearchFormContent from "./CustomListSearchFormContent";
import { LanguagesData, LibraryData } from "../interfaces";
import { Panel, Form } from "library-simplified-reusable-components";
import { CollectionData } from "opds-web-client/lib/interfaces";

export type EntryPoint = "All" | "Book" | "Audio";
export interface CustomListSearchProps {
  search: (url: string) => Promise<CollectionData>;
  entryPoints?: string[];
  startingTitle?: string;
  library: LibraryData;
  languages: LanguagesData;
}

export default function CustomListSearch({
  search,
  entryPoints,
  startingTitle = "",
  library,
  languages,
}: CustomListSearchProps): JSX.Element {
  const [searchTerms, setSearchTerms] = React.useState(startingTitle);
  const [sortBy, setSortBy] = React.useState(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState("all");
  const [selectedEntryPoint, setSelectedEntryPoint] = React.useState<
    EntryPoint
  >("All");

  console.log("entryPoints -->", entryPoints);

  const getSearchQueries = (sortBy: string, language: string) => {
    let query = "";
    if (selectedEntryPoint && selectedEntryPoint !== "All") {
      query += `&entrypoint=${encodeURIComponent(selectedEntryPoint)}`;
    }
    sortBy && (query += `&order=${encodeURIComponent(sortBy)}`);
    language && (query += `&language=${[language]}`);
    return query;
  };

  const submitSearch = () => {
    const encodedSearchTerms = encodeURIComponent(searchTerms);
    const encodedLanguage = encodeURIComponent(selectedLanguage);
    const searchQueries = getSearchQueries(sortBy, encodedLanguage);
    const url = `/${library.short_name}/search?q=${encodedSearchTerms}${searchQueries}`;
    search(url);
  };
  /**
   * If there is an existing search term, then search should be called after mounting.
   */
  React.useEffect(() => {
    if (searchTerms.trim()) {
      submitSearch();
    }
  }, []);

  return (
    <Panel
      headerText="Search for titles"
      id="search-titles"
      openByDefault={true}
      onEnter={submitSearch}
      content={
        <Form
          onSubmit={submitSearch}
          content={
            <CustomListSearchFormContent
              key="formContent"
              entryPoints={entryPoints}
              setSelectedEntryPoint={setSelectedEntryPoint}
              selectedEntryPoint={selectedEntryPoint}
              searchTerms={searchTerms}
              setSearchTerms={setSearchTerms}
              languages={languages}
              library={library}
              sortBy={sortBy}
              setSortBy={setSortBy}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
            />
          }
          buttonClass="left-align"
          buttonContent={
            <span>
              Search
              <SearchIcon />
            </span>
          }
          disableButton={!searchTerms.trim()}
          className="search-titles"
        />
      }
    />
  );
}
