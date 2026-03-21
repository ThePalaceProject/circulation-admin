import * as React from "react";
import { useInRouterContext, useLocation, useNavigate } from "react-router-dom";
import { PathForContext } from "@thepalaceproject/web-opds-client/lib/components/context/PathForContext";
import { PathFor } from "../interfaces";

export interface RouterCompat {
  push: (path: string) => void;
  replace: (path: string) => void;
  getCurrentLocation: () => { pathname: string };
}

export interface RoutingContextInjectedProps {
  router: RouterCompat;
  pathFor: PathFor;
}

/**
 * HOC PATTERN: Injects a v3-like router object and pathFor function as props,
 * replacing legacy contextTypes ({ router, pathFor }).
 */
export function withRoutingContext<P>(
  WrappedComponent: React.ComponentType<P>
) {
  const displayName =
    (WrappedComponent as any).displayName ||
    (WrappedComponent as any).name ||
    "Component";

  function WithRoutingContext(props: any) {
    const inRouterContext = useInRouterContext();
    const navigate = inRouterContext ? useNavigate() : null;
    const location = inRouterContext ? useLocation() : null;
    const pathForFromContext = React.useContext(PathForContext) as
      | PathFor
      | undefined;
    const normalizeCollectionUrl = (url: string) => {
      if (!url) {
        return url;
      }
      return encodeURIComponent(
        url
          .replace(`${document.location.origin}/`, "")
          .replace(/\/$/, "")
          .replace(/^\//, "")
      );
    };

    const normalizeBookUrl = (url: string) => {
      if (!url) {
        return url;
      }
      const regexp = new RegExp(`${document.location.origin}/(.*)/works/(.*)`);
      const match = regexp.exec(url);
      if (match) {
        return encodeURIComponent(`${match[1]}/${match[2]}`);
      }
      return url;
    };

    const pathFor: PathFor =
      pathForFromContext ||
      ((collectionUrl: string, bookUrl: string, tab?: string) => {
        let path = "/admin/web";
        path += collectionUrl
          ? `/collection/${normalizeCollectionUrl(collectionUrl)}`
          : "";
        path += bookUrl ? `/book/${normalizeBookUrl(bookUrl)}` : "";
        path += tab ? `/tab/${tab}` : "";
        return path;
      });
    const router: RouterCompat = {
      push: (path: string) => {
        if (navigate) {
          navigate(path);
        }
      },
      replace: (path: string) => {
        if (navigate) {
          navigate(path, { replace: true });
        }
      },
      getCurrentLocation: () => ({ pathname: location?.pathname || "" }),
    };

    return (
      <WrappedComponent {...(props as P)} {...({ router, pathFor } as any)} />
    );
  }

  WithRoutingContext.displayName = `withRoutingContext(${displayName})`;
  return WithRoutingContext;
}
