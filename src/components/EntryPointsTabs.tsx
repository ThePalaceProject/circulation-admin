import * as React from "react";
import { Store } from "redux";
import { State } from "../reducers/index";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import ActionCreator from "../actions";
import { connect } from "react-redux";
import { LibraryData, PathFor } from "../interfaces";
import {
  AudioHeadphoneIcon,
  BookIcon,
} from "@nypl/dgx-svg-icons";

export interface EntryPointsTabsDispatchProps {
  fetchLibraries: () => void;
}
export interface EntryPointsTabsContext {
  pathFor: PathFor;
  router: any;
}
export interface EntryPointsTabsOwnProps {
  store?: Store<State>;
  activeValue?: string;
  homeLink?: string;
  collectionUrl: string;
  library: (collectionUrl, bookUrl) => string;
}

export interface EntryPointsTabsStateProps {
  libraries?: LibraryData[];
}

export interface EntryPointsTabsProps extends EntryPointsTabsDispatchProps, EntryPointsTabsStateProps, EntryPointsTabsOwnProps {}

/** This component renders a library's entrypoints as linked tabs. */
export class EntryPointsTabs extends React.Component<EntryPointsTabsProps, EntryPointsTabsStateProps> {
  context: EntryPointsTabsContext;

  constructor(props) {
    super(props);
    this.getEnabledEntryPoints = this.getEnabledEntryPoints.bind(this);
  }

  static contextTypes: React.ValidationMap<EntryPointsTabsContext> = {
    router: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired
  };

  render(): JSX.Element {
    const entryPoints = this.getEnabledEntryPoints(this.props.libraries);
    const mapEntryPointsToSchema = {
      "Book": {
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
    };

    if (!entryPoints.length) {
      return null;
    }

    return (
      <ul className="nav nav-tabs">
        { entryPoints.map(entryPoint => {
            const { value, label } = mapEntryPointsToSchema[entryPoint];
            const activeClass = !!(this.props.activeValue === entryPoint) ?
              "active" : "";
            const url = `${this.props.homeLink}?entrypoint=${entryPoint}`;
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

  componentWillMount() {
    this.props.fetchLibraries();
  }

  getEnabledEntryPoints(libraries: LibraryData[]) {
    if (!libraries) {
      return [];
    }
    let library;
    const libraryStr = this.props.library(this.props.collectionUrl, null);

    libraries.forEach(lib => {
      if (lib.short_name === libraryStr) {
        library = lib;
      }
    });

    return library.settings.enabled_entry_points || [];
  }
};

function mapStateToProps(state, ownProps) {
  return {
    libraries: state.editor.libraries.data && state.editor.libraries.data.libraries,
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher({ adapter });
  let actions = new ActionCreator(fetcher);
  return {
    fetchLibraries: () => dispatch(actions.fetchLibraries()),
  };
}

const ConnectedEntryPointsTabs = connect<EntryPointsTabsStateProps, EntryPointsTabsDispatchProps, EntryPointsTabsOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(EntryPointsTabs);

export default ConnectedEntryPointsTabs;
