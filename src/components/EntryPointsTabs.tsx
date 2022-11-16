import * as React from "react";
import CatalogLink from "@thepalaceproject/web-opds-client/lib/components/CatalogLink";
import { FacetData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import * as PropTypes from "prop-types";
import { PathFor } from "../interfaces";
import { AudioHeadphoneIcon, BookIcon } from "@nypl/dgx-svg-icons";

export interface EntryPointsTabsContext {
  pathFor: PathFor;
  router: any;
}
export interface EntryPointsTabsProps {
  facets?: FacetData[];
}

/** This component renders a library's entrypoints as linked tabs. */
export class EntryPointsTabs extends React.Component<EntryPointsTabsProps, {}> {
  context: EntryPointsTabsContext;

  constructor(props) {
    super(props);
  }

  static contextTypes: React.ValidationMap<EntryPointsTabsContext> = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
  };

  render(): JSX.Element {
    const entryPoints = this.props.facets ? this.props.facets : [];
    if (!entryPoints.length) {
      return null;
    }

    const mapEntryPointsToSchema = {
      All: "http://schema.org/CreativeWork",
      eBooks: "http://schema.org/EBook",
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
      <ul className="nav nav-tabs entry-points-list">
        {entryPoints.map((entryPoint) => {
          const label = entryPoint.label;
          const value = mapEntryPointsToSchema[label];
          const activeClass = entryPoint.active ? "active" : "";
          const url = entryPoint.href;
          const svg = svgMediumTypes[value] ? svgMediumTypes[value] : null;
          const noSVGClass = !svg ? "no-svg" : "";

          return (
            <li
              key={label}
              role="presentation"
              className={`${activeClass} ${noSVGClass}`}
            >
              <CatalogLink collectionUrl={url} bookUrl={null}>
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
