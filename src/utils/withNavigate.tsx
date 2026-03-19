import * as React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

export type NavigateFn = (path: string) => void;

/** Injects a `navigate` prop (replacing v3's `this.context.router.push`) into class components. */
export function withNavigate<P extends { navigate?: NavigateFn }>(
  WrappedComponent: React.ComponentType<P>
) {
  const displayName =
    (WrappedComponent as any).displayName ||
    (WrappedComponent as any).name ||
    "Component";

  function WithNavigate(props: Omit<P, "navigate">) {
    const navigate = useNavigate();
    return <WrappedComponent {...(props as P)} navigate={navigate} />;
  }
  WithNavigate.displayName = `withNavigate(${displayName})`;
  return WithNavigate;
}

/** Injects v6 route params as a `params` prop (mimicking v3's `this.props.params`) */
export function withParams<
  Params extends Record<string, string | undefined>,
  P extends { params?: Params; navigate?: NavigateFn; location?: any }
>(WrappedComponent: React.ComponentType<P>) {
  const displayName =
    (WrappedComponent as any).displayName ||
    (WrappedComponent as any).name ||
    "Component";

  function WithParams(props: Omit<P, "params" | "navigate" | "location">) {
    const params = useParams<Params>();
    const navigate = useNavigate();
    const location = useLocation();
    return (
      <WrappedComponent
        {...(props as P)}
        params={params as Params}
        navigate={navigate}
        location={location}
      />
    );
  }
  WithParams.displayName = `withParams(${displayName})`;
  return WithParams;
}
