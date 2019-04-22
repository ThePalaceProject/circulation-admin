import * as React from "react";

export default class TrashIcon extends React.Component<void, void> {
  render(): JSX.Element {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="58" viewBox="0 0 44 58" aria-hidden="true">
        <title>Trash Icon</title>
        <g>
          <polygon points="1 13 6 58 22 58 38 58 43 13 22 13 1 13"/>
          <path d="M30,7V2a2,2,0,0,0-2-2H16a2,2,0,0,0-2,2V7H0v3H44V7ZM27,7H17V3H27Z"/>
        </g>
      </svg>
    );
  }
}
