import * as React from "react";
import { Store } from "redux";
import { State } from "../reducers/index";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import ActionCreator from "../actions";
import { connect } from "react-redux";
import { LibraryData } from "../interfaces";
import {
  AudioHeadphoneIcon,
  BookIcon,
} from "@nypl/dgx-svg-icons";

export interface EntryPointsTabContainerDispatchProps {
  fetchLibraries: () => void;
}
export interface EntryPointsTabContainerOwnProps {
  libraries?: LibraryData[];
  store?: Store<State>;
  activeValue?: string;
  homeLink?: string;
  collectionUrl: string;
  library: (collectionUrl, bookUrl) => string;
}

export interface EntryPointsTabContainerProps extends EntryPointsTabContainerDispatchProps, EntryPointsTabContainerOwnProps {}

/** Wraps the book details component from OPDSWebClient with additional tabs
    for editing metadata, classifications, and complaints. */
export class EntryPointsTabContainer extends React.Component<EntryPointsTabContainerProps, any> {
  constructor(props) {
    super(props);
    this.getEnabledEntryPoints = this.getEnabledEntryPoints.bind(this);
  }

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
      "http://bib.schema.org/Audiobook": <AudioHeadphoneIcon ariaHidden className="draggable-item-icon" />,
      "http://schema.org/EBook": <BookIcon ariaHidden className="draggable-item-icon" />,
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
              <li role="presentation" className={`${activeClass} ${noSVGClass}`}>
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

const ConnectedEntryPointsTabContainer = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps,
)(EntryPointsTabContainer);

export default ConnectedEntryPointsTabContainer;
