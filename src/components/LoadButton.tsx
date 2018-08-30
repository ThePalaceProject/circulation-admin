import * as React from "react";
import MoreDotsIcon from "./icons/MoreDotsIcon";

export interface LoadButtonProps {
  isFetchingMoreSearchResults: boolean;
  loadMore: () => any;
}

export default class LoadButton extends React.Component<LoadButtonProps, void> {
  render(): JSX.Element {
    return (
      <button
        className="btn btn-default load-more-button"
        disabled={this.props.isFetchingMoreSearchResults}
        onClick={this.props.loadMore}
        >
          { this.props.isFetchingMoreSearchResults ?
            <MoreDotsIcon /> :
            "Load more"
          }
      </button>
    );
  }
}
