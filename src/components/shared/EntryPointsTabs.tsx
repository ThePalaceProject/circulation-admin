import * as React from "react";
import CatalogLink from "@thepalaceproject/web-opds-client/lib/components/CatalogLink";
import { FacetData } from "@thepalaceproject/web-opds-client/lib/interfaces";
export interface EntryPointsTabsProps {
  facets?: FacetData[];
}

/** This component renders a library's entrypoints as linked filters. */
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
    return (
      <div
        className="entry-points-filter-group"
        role="group"
        aria-label="Format filters"
      >
        {entryPoints.map((entryPoint) => {
          const label = entryPoint.label;
          const value = mapEntryPointsToSchema[label];
          const url = entryPoint.href;
          const activeClass = entryPoint.active
            ? "entry-points-filter--active"
            : "";
          return (
            <CatalogLink
              key={label}
              collectionUrl={url}
              bookUrl={null}
              className={`entry-points-filter ${activeClass}`.trim()}
            >
              <span>{label}</span>
            </CatalogLink>
          );
        })}
      </div>
    );
  }
}

export default EntryPointsTabs;
