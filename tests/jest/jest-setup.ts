import "@testing-library/jest-dom";

// jsdom does not implement scrollTo on elements; provide a no-op implementation.
if (typeof Element.prototype.scrollTo === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Element.prototype.scrollTo = function scrollToNoop() {};
}

// Polyfill FormData to support construction from an HTMLFormElement.
// jsdom's native FormData constructor does not accept a form element, so we
// subclass it and manually collect named form-control values.
const _NativeFormData = (global as any).FormData;
(global as any).FormData = class FormDataPolyfill extends _NativeFormData {
  constructor(form?: any) {
    super();
    if (form?.elements) {
      const elements = form.elements as HTMLFormControlsCollection;
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement;
        if (
          !el.name ||
          el.type === "submit" ||
          el.type === "button" ||
          el.type === "reset"
        ) {
          continue;
        }
        if (el.type === "checkbox" || el.type === "radio") {
          if ((el as HTMLInputElement).checked) {
            this.append(el.name, (el as HTMLInputElement).value || "on");
          }
        } else if (el.type === "file") {
          const file =
            (el as HTMLInputElement).files?.[0] ?? new File([""], "");
          this.append(el.name, file);
        } else {
          this.append(el.name, (el as HTMLInputElement).value ?? "");
        }
      }
    }
  }
};
