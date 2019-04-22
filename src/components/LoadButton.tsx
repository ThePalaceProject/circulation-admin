import * as React from "react";
import MoreDotsIcon from "./icons/MoreDotsIcon";
import { Button } from "library-simplified-reusable-components";

export interface LoadButtonProps {
  isFetching: boolean;
  loadMore: () => any;
}

export default class LoadButton extends React.Component<LoadButtonProps, void> {
  render(): JSX.Element {
    return (
      <Button
        className="load-more-button"
        disabled={this.props.isFetching}
        callback={this.props.loadMore}
        content={this.props.isFetching ? <MoreDotsIcon /> : "Load more"}
      />
    );
  }
}
