import * as React from "react";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { FacetData } from "opds-web-client/lib/interfaces";
import { PathFor } from "../interfaces";
import {
  AudioHeadphoneIcon,
  BookIcon,
} from "@nypl/dgx-svg-icons";

export interface EntryPointsTabsContext {
  pathFor: PathFor;
  router: any;
}
export interface EntryPointsTabsProps {
  facets?: FacetData[];
}

/** This component renders a library's entrypoints as linked tabs. */
export class EntryPointsTabs extends React.Component<EntryPointsTabsProps, void> {
  context: EntryPointsTabsContext;

  constructor(props) {
    super(props);
  }

  static contextTypes: React.ValidationMap<EntryPointsTabsContext> = {
    router: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired
  };

  render(): JSX.Element {
    const mapEntryPointsToSchema = {
      "All": {
        value: "",
        label: "All",
      },
      "Books": {
        value: "http://schema.org/EBook",
        label: "eBooks",
      },
      "Audio": {
        value: "http://bib.schema.org/Audiobook",
        label: "Audio Books",
      },
    };
    const svgMediumTypes = {
      "http://bib.schema.org/Audiobook":
        <AudioHeadphoneIcon ariaHidden title="Audio Headphones Icon" />,
      "http://schema.org/EBook": <BookIcon ariaHidden title="Book Icon" />,
      "": null,
    };

    let entryPoints = this.props.facets ? this.props.facets : [];
    if (!entryPoints.length) {
      return null;
    }

    return (
      <ul className="nav nav-tabs">
        { entryPoints.map(entryPoint => {
            const { value, label } = mapEntryPointsToSchema[entryPoint.label];
            const activeClass = entryPoint.active ? "active" : "";
            const url = entryPoint.href;
            const svg = svgMediumTypes[value] ? svgMediumTypes[value] : null;
            const noSVGClass = !svg ? "no-svg" : "";

            return (
              <li
                key={value}
                role="presentation"
                className={`${activeClass} ${noSVGClass}`}
              >
                <CatalogLink
                  collectionUrl={url}
                  bookUrl={null}>
                  {svg}{label}
                </CatalogLink>
              </li>
            );
          })
        }
      </ul>
    );
  }
};

export default EntryPointsTabs;
