import { stub } from "sinon";

export const mockRouter = (push) => {
  return {
    push,
    createHref: () => "test href",
  };
};

export const mockRouterContext = (push?, pathFor?) => {
  return {
    router: mockRouter(push || stub()),
    pathFor:
      pathFor || ((collectionUrl, bookUrl) => collectionUrl + "::" + bookUrl),
  };
};
