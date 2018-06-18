import * as React from "react";
import { Store } from "redux";
import { State } from "../reducers/index";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import ActionCreator from "../actions";
import { connect } from "react-redux";
import BookDetailsEditor from "./BookDetailsEditor";
import Classifications from "./Classifications";
import BookCoverEditor from "./BookCoverEditor";
import Complaints from "./Complaints";
import CustomListsForBook from "./CustomListsForBook";
import {
  BookData,
  LibraryData,
} from "../interfaces";
import { TabContainer, TabContainerProps } from "./TabContainer";
import {
  AudioHeadphoneIcon,
  BookIcon,
} from "@nypl/dgx-svg-icons";

export interface EntryPointsTabContainerStateProps {
  bookUrl: string;
  collectionUrl: string;
  library: (collectionUrl, bookUrl) => string;
}
export interface EntryPointsTabContainerDispatchProps {
  fetchLibraries: () => void;
}
export interface EntryPointsTabContainerOwnProps {
  libraries?: LibraryData[];
  store?: Store<State>;
  activeValue?: string;
  homeLink?: string;
}

export interface EntryPointsTabContainerProps extends React.Props<EntryPointsTabContainerProps>, EntryPointsTabContainerStateProps, EntryPointsTabContainerDispatchProps, EntryPointsTabContainerOwnProps {}

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

    return (
      <div className="entry-point-tab-container">
        <ul className="nav nav-tabs">
          { entryPoints.map(entryPoint => {
              const entryPointValue = mapEntryPointsToSchema[entryPoint].value;
              const activeClass = !!(this.props.activeValue === entryPointValue) ?
                "active" : "";
              const url = `${this.props.homeLink}?entrypoint=${entryPointValue}`;
              return (
                <li role="presentation" className={activeClass}>
                  <CatalogLink
                    collectionUrl={url}
                    bookUrl={null}>
                    {svgMediumTypes[entryPointValue]}{mapEntryPointsToSchema[entryPoint].label}
                  </CatalogLink>
                </li>
              );
            })
          }
        </ul>
      </div>
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
    const libraryStr = this.props.library(this.props.collectionUrl, this.props.bookUrl);

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
