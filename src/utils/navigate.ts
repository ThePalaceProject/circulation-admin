/**
 * Full-page navigation, in its own module so tests can observe it.
 *
 * Assigning `window.location.href` directly is untestable under jsdom: `location`
 * is a non-configurable own accessor, so it can be neither replaced nor spied on,
 * and jsdom refuses the navigation with "Not implemented". Routing through this
 * module lets tests `vi.spyOn` it instead.
 */

export const currentHref = (): string => window.location.href;

export const navigateTo = (url: string): void => {
  window.location.href = url;
};
