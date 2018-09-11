import * as React from "react";
import MoreDotsIcon from "./icons/MoreDotsIcon";

export interface LoadButtonProps {
  isFetching: boolean;
  loadMore: () => any;
}

export default class LoadButton extends React.Component<LoadButtonProps, void> {
  render(): JSX.Element {
    return (
      <button
        className="btn btn-default load-more-button"
        disabled={this.props.isFetching}
        onClick={this.props.loadMore}
        >
          { this.props.isFetching ?
            <MoreDotsIcon /> :
            "Load more"
          }
      </button>
    );
  }
}
