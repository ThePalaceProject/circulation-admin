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
//
// The shim returns a real `FormData` (Node's, from the test environment), so
// `fetch` sends it as form data and a mock server can read its fields. It is a
// function, not a class, because tests compile to ES5, and ES5 code cannot
// extend a built-in class. `new FormDataShim(form)` still works.
const BaseFormData = globalThis.FormData;

export type FormDataShim = FormData;

export const FormDataShim = function FormDataShim(form?: HTMLFormElement) {
  const data = new BaseFormData();
  if (form) {
    appendSuccessfulControls(data, form);
  }
  return data;
} as unknown as { new (form?: HTMLFormElement): FormData };
// So `instanceof FormDataShim` is true for the FormData it returns.
FormDataShim.prototype = BaseFormData.prototype;

function appendSuccessfulControls(data: FormData, form: HTMLFormElement) {
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
        if (["submit", "reset", "button", "image", "file"].includes(el.type)) {
          return;
        }
        if ((el.type === "checkbox" || el.type === "radio") && !el.checked) {
          return;
        }
      }
      if (el instanceof HTMLSelectElement && el.multiple) {
        Array.from(el.selectedOptions).forEach((option) =>
          data.append(el.name, option.value)
        );
        return;
      }
      data.append(el.name, el.value);
    });
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
