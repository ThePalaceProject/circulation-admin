import * as React from "react";
import CatalogLink from "@thepalaceproject/web-opds-client/lib/components/CatalogLink";
import { FacetData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { AudioHeadphoneIcon, BookIcon } from "@nypl/dgx-svg-icons";
export interface EntryPointsTabsProps {
  facets?: FacetData[];
}

/** This component renders a library's entrypoints as linked tabs. */
export class EntryPointsTabs extends React.Component<
  EntryPointsTabsProps,
  Record<string, never>
> {
  constructor(props) {
    super(props);
  }

  render(): JSX.Element {
    const entryPoints = this.props.facets ? this.props.facets : [];
    if (!entryPoints.length) {
      return null;
    }
    const mapEntryPointsToSchema = {
      All: "http://schema.org/CreativeWork",
      Ebooks: "http://schema.org/EBook",
      Audiobooks: "http://bib.schema.org/Audiobook",
    };
    const svgMediumTypes = {
      "http://bib.schema.org/Audiobook": (
        <AudioHeadphoneIcon ariaHidden title="Audio Headphones Icon" />
      ),
      "http://schema.org/EBook": <BookIcon ariaHidden title="Book Icon" />,
      "http://schema.org/CreativeWork": null,
    };
    return (
      <ul className="nav-tabs flex border-b entry-points-list">
        {entryPoints.map((entryPoint) => {
          const label = entryPoint.label;
          const value = mapEntryPointsToSchema[label];
          const url = entryPoint.href;
          const svg = svgMediumTypes[value] ? svgMediumTypes[value] : null;
          const noSVGClass = !svg ? "no-svg" : "";
          return (
            <li
              key={label}
              role="presentation"
              className={`mr-4 ${noSVGClass} ${
                entryPoint.active ? "active" : ""
              }`}
            >
              <CatalogLink
                collectionUrl={url}
                bookUrl={null}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  entryPoint.active
                    ? "border-blue-600 text-blue-700 bg-white"
                    : "border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300"
                }`}
              >
                {svg}
                {label}
              </CatalogLink>
            </li>
          );
        })}
      </ul>
    );
  }
}

export default EntryPointsTabs;
