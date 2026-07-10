// The unit jsdom environment installs undici's `FormData`, which throws on
// `new FormData(formElement)`. The reusable-components `Form` builds FormData
// that way on submit, so tests that assert a submitted payload need a stand-in.
//
// This shim mirrors the browser's `new FormData(form)`: it serializes only
// "successful controls" — named, non-disabled controls, with checkboxes and
// radios contributing only when checked, submit/reset/button/image/file inputs
// excluded, and every selected option of a multi-select included. A naive shim
// that records *every* named control can make a payload assertion pass while the
// real browser omits a disabled or unchecked field.
export class FormDataShim {
  private items: Array<[string, string]> = [];

  constructor(form?: HTMLFormElement) {
    if (!form) {
      return;
    }
    // Serializes the form's own descendant controls; the forms under test don't
    // associate external controls via `form="id"`, so those are not collected.
    form
      .querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input, select, textarea")
      .forEach((el) => {
        // `:disabled` (not the `.disabled` property) so controls disabled via an
        // ancestor `<fieldset disabled>` are omitted too, as the browser does.
        if (!el.name || el.matches(":disabled")) {
          return;
        }
        if (el instanceof HTMLInputElement) {
          // Buttons never contribute a value. File inputs are omitted
          // deliberately: the browser submits them as File objects, which a
          // value-reading shim can't reproduce, so tests treat them as absent.
          if (
            ["submit", "reset", "button", "image", "file"].includes(el.type)
          ) {
            return;
          }
          if ((el.type === "checkbox" || el.type === "radio") && !el.checked) {
            return;
          }
        }
        if (el instanceof HTMLSelectElement && el.multiple) {
          Array.from(el.selectedOptions).forEach((option) =>
            this.items.push([el.name, option.value])
          );
          return;
        }
        this.items.push([el.name, el.value]);
      });
  }

  get(key: string) {
    const found = this.items.find(([k]) => k === key);
    return found ? found[1] : null;
  }
  getAll(key: string) {
    return this.items.filter(([k]) => k === key).map(([, v]) => v);
  }
  has(key: string) {
    return this.items.some(([k]) => k === key);
  }
  append(key: string, value: string) {
    this.items.push([key, value]);
  }
  set(key: string, value: string) {
    // Replace the first matching entry in place and drop any later duplicates,
    // preserving position as FormData.set does.
    const firstIndex = this.items.findIndex(([k]) => k === key);
    this.items = this.items.filter(([k]) => k !== key);
    if (firstIndex === -1) {
      this.items.push([key, value]);
    } else {
      this.items.splice(firstIndex, 0, [key, value]);
    }
  }
  delete(key: string) {
    this.items = this.items.filter(([k]) => k !== key);
  }
  forEach(
    callback: (value: string, key: string, parent: FormDataShim) => void
  ) {
    this.items.forEach(([k, v]) => callback(v, k, this));
  }
  keys() {
    return this.items.map(([k]) => k)[Symbol.iterator]();
  }
  values() {
    return this.items.map(([, v]) => v)[Symbol.iterator]();
  }
  entries() {
    return this.items
      .map(([k, v]) => [k, v] as [string, string])
      [Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries();
  }
}

// Swaps `window.FormData` for the shim around a suite, restoring it afterward.
// Call once at the top level of a test file.
export function installFormDataShim(): void {
  let originalFormData: typeof FormData;
  beforeAll(() => {
    originalFormData = window.FormData;
    (window as any).FormData = FormDataShim;
  });
  afterAll(() => {
    (window as any).FormData = originalFormData;
  });
}
