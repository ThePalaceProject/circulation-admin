import { stub } from "sinon";

import * as React from "react";

export const mockRouter = (push) => {
  return {
    push,
    createHref: (location) => "test href",
  };
};

export const mockRouterContext = (push?, pathFor?) => {
  return {
    router: mockRouter(push || stub()),
    pathFor:
      pathFor || ((collectionUrl, bookUrl) => collectionUrl + "::" + bookUrl),
  };
};
