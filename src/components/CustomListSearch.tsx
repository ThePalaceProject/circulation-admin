import * as React from "react";
import SearchIcon from "./icons/SearchIcon";
import CustomListSearchFormContent from "./CustomListSearchFormContent";
import { LanguagesData, LibraryData } from "../interfaces";
import { Panel, Form } from "library-simplified-reusable-components";
import { CollectionData } from "opds-web-client/lib/interfaces";

export interface CustomListSearchProps {
  entryPoints?: string[];
  languages: LanguagesData;
  library: LibraryData;
  search: (url: string) => Promise<CollectionData>;
  startingTitle?: string;
}

export default function CustomListSearch({
  entryPoints,
  languages,
  library,
  search,
  startingTitle = "",
}: CustomListSearchProps): JSX.Element {
  const [searchTerms, setSearchTerms] = React.useState<string>(startingTitle);
  const [sortBy, setSortBy] = React.useState(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("all");
  const [selectedEntryPoint, setSelectedEntryPoint] = React.useState<string>(
    entryPoints.length === 1 ? entryPoints[0] : "All"
  );

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
  // If there is an existing search term, then search should be called after mounting.
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
              entryPoints={entryPoints}
              key="formContent"
              languages={languages}
              library={library}
              searchTerms={searchTerms}
              selectedEntryPoint={selectedEntryPoint}
              selectedLanguage={selectedLanguage}
              setSearchTerms={setSearchTerms}
              setSelectedEntryPoint={setSelectedEntryPoint}
              setSelectedLanguage={setSelectedLanguage}
              setSortBy={setSortBy}
              sortBy={sortBy}
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
