import { LegacyRouter } from "../../../src/components/LegacyRouterBridge";

/**
 * Returns a mock of the router that `LegacyRouterBridge` provides, with a
 * `vi.fn()` for each method. To check what one of our components pushes, give
 * the mock to the component through `LegacyRouterContext` (or as its `router`
 * prop), then assert on `push`. `getCurrentLocation()` returns a location at
 * `pathname`.
 */
export const mockLegacyRouter = (pathname = "/admin/web") =>
  ({
    push: vi.fn<LegacyRouter["push"]>(),
    createHref: vi.fn<LegacyRouter["createHref"]>(),
    getCurrentLocation: vi.fn<LegacyRouter["getCurrentLocation"]>(() => ({
      pathname,
      search: "",
      hash: "",
      state: null,
      key: "default",
    })),
    isActive: vi.fn<LegacyRouter["isActive"]>(() => false),
  }) satisfies LegacyRouter;
