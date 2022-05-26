import * as React from "react";
import {
  buildAdvSearchQueryString,
  buildSearchUrl,
  CustomListEditorSearchParams,
} from "../reducers/customListEditor";

export interface CustomListSearchQueryViewerProps {
  library: string;
  searchParams: CustomListEditorSearchParams;
}

export default function CustomListSearchQueryViewer({
  library,
  searchParams,
}: CustomListSearchQueryViewerProps) {
  const [isOpen, setOpen] = React.useState(false);
  const [view, setView] = React.useState("json");

  const handleToggleOpenButtonClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();

    setOpen(!isOpen);
  };

  let content = null;

  if (isOpen) {
    if (view === "json") {
      content = <pre>{buildAdvSearchQueryString(searchParams, 2, false)}</pre>;
    }

    if (view === "url") {
      const url = buildSearchUrl(searchParams, library);

      content = (
        <div>
          <code>
            <a href={url} target="_blank" rel="noreferrer">
              {url}
            </a>
          </code>
        </div>
      );
    }
  }

  return (
    <div className="query-viewer">
      <button type="button" onClick={handleToggleOpenButtonClick}>
        {isOpen ? "-" : "{}"}
      </button>

      {isOpen && (
        <div>
          <header>
            <button
              disabled={view === "json"}
              type="button"
              onClick={() => setView("json")}
            >
              JSON
            </button>

            <button
              disabled={view === "url"}
              type="button"
              onClick={() => setView("url")}
            >
              URL
            </button>
          </header>

          {content}
        </div>
      )}
    </div>
  );
}
