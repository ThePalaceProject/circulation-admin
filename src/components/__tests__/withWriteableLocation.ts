// Helper for legacy mocha/enzyme tests that need a mutable `window.location`.
//
// jsdom >= 21 makes `window.location` (and `location.href`) non-configurable, so the
// old `delete window.location; window.location = ...` hack throws. Instead we swap
// `global.window` for a Proxy that overrides only `location` while forwarding every
// other property — including branded methods such as `addEventListener` — to the real
// window, so jsdom's internal slot checks keep working.
//
// This is a terrible hack, but browsers allow changing `location.href` and jsdom does
// not. See https://github.com/facebook/jest/issues/890

export interface WriteableLocationHandle {
  restore: () => void;
}

export function installWriteableLocation(): WriteableLocationHandle {
  const realWindow = global.window;

  let location = Object.assign({}, realWindow.location, {
    href: `${realWindow.location.href}`,
  });

  global.window = new Proxy(realWindow, {
    get(target, property) {
      if (property === "location") {
        return location;
      }
      const value = Reflect.get(target, property, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
    set(target, property, value) {
      if (property === "location") {
        location = value;
        return true;
      }
      return Reflect.set(target, property, value, target);
    },
  }) as Window & typeof globalThis;

  return {
    restore: () => {
      global.window = realWindow;
    },
  };
}
