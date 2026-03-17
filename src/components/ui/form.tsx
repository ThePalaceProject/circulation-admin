/* eslint-disable */
/**
 * Form component — drop-in replacement for library-simplified-reusable-components Form.
 *
 * A styled form wrapper with an optional title, slot for content (fields),
 * and an auto-generated submit button.
 *
 * Props:
 *   onSubmit       — form submit handler
 *   content        — form body: ReactNode or ReactNode[]
 *   title          — optional heading displayed above the content
 *   className      — extra CSS classes on the <form> element
 *   buttonContent  — label for the submit button (default "Submit")
 *   buttonClass    — className passed to the submit Button
 *   disableButton  — disable the submit button
 *   withoutButton  — omit the submit button entirely
 *   hiddenName     — name of an optional hidden input
 *   hiddenValue    — value of an optional hidden input
 */
import * as React from "react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

export interface FormProps {
  onSubmit?: (e?: any) => void;
  content?: React.ReactNode | React.ReactNode[];
  title?: string;
  className?: string;
  buttonContent?: React.ReactNode;
  buttonClass?: string;
  disableButton?: boolean;
  withoutButton?: boolean | any;
  /** Name of an optional hidden <input> appended before submission */
  hiddenName?: string;
  /** Value of an optional hidden <input> appended before submission */
  hiddenValue?: string | boolean;
  /** Optional error message displayed inside the form */
  errorText?: React.ReactNode;
  /** Optional success message displayed inside the form */
  successText?: React.ReactNode;
  /** Optional loading indicator displayed inside the form */
  loadingText?: React.ReactNode;
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  (
    {
      onSubmit,
      content,
      title,
      className,
      buttonContent = "Submit",
      buttonClass = "left-align",
      disableButton = false,
      withoutButton = false,
      hiddenName,
      hiddenValue,
      errorText,
      successText,
      loadingText,
    },
    externalRef
  ) => {
    /** Internal ref to the <form> DOM node — used to collect FormData on submit. */
    const internalRef = React.useRef<HTMLFormElement>(null);

    /** Forward the external ref whenever the internal ref changes. */
    React.useEffect(() => {
      if (!externalRef) return;
      const node = internalRef.current;
      if (typeof externalRef === "function") {
        externalRef(node);
      } else {
        (externalRef as React.MutableRefObject<HTMLFormElement | null>).current = node;
      }
    });

    /**
     * Collect FormData from the <form> element and call onSubmit with it.
     * This replicates the original library's behaviour of passing FormData
     * (not a FormEvent) to the consumer's onSubmit callback.
     */
    const fireOnSubmit = () => {
      if (!onSubmit) return;
      const formEl = internalRef.current;
      if (formEl) {
        let data: FormData;
        try {
          // Modern jsdom / browsers support new FormData(formElement).
          data = new (window as any).FormData(formEl);
        } catch (_e) {
          // Fallback: manually collect named form fields (older jsdom versions
          // don't support constructing FormData from an HTMLFormElement).
          data = new FormData();
          const elements = formEl.elements as HTMLFormControlsCollection;
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as
              | HTMLInputElement
              | HTMLSelectElement
              | HTMLTextAreaElement;
            if (el.name) {
              data.append(el.name, (el as HTMLInputElement).value ?? "");
            }
          }
        }
        onSubmit(data);
      } else {
        onSubmit(undefined);
      }
    };

    /** Track whether submission was triggered by the explicit button click,
     *  so the form‑level onSubmit (fired by Enter key or native submit) doesn't
     *  call onSubmit a second time in environments where both events fire. */
    const buttonClickedRef = React.useRef(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (buttonClickedRef.current) {
        // Already handled by button onClick – skip to avoid double‑call.
        buttonClickedRef.current = false;
        return;
      }
      fireOnSubmit();
    };

    const handleButtonClick = (_e?: any) => {
      buttonClickedRef.current = true;
      fireOnSubmit();
    };

    return (
      <form
        ref={internalRef}
        onSubmit={handleSubmit}
        className={cn("p-4 rounded", className)}
      >
        {title && (
          <span className="form-title block text-center w-4/5 mx-auto my-8 pb-2 border-b border-[#135772] font-bold">
            {title}
          </span>
        )}

        {hiddenName && (
          <input
            type="hidden"
            name={hiddenName}
            value={String(hiddenValue ?? "")}
          />
        )}

        {Array.isArray(content) ? content : content}

        {errorText && (
          <div className="alert-danger form-error text-red-600 mt-2">
            {errorText}
          </div>
        )}

        {successText && (
          <div className="alert-success form-success text-green-700 mt-2">
            {successText}
          </div>
        )}

        {loadingText && <div className="form-loading mt-2">{loadingText}</div>}

        {!withoutButton && (
          <Button
            type="submit"
            className={buttonClass}
            disabled={disableButton}
            content={
              <span className="inline-flex items-center gap-1.5 [&_svg]:fill-current [&_svg]:h-5 [&_svg]:w-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                </svg>
                {buttonContent}
              </span>
            }
            onClick={handleButtonClick}
          />
        )}
      </form>
    );
  }
);

Form.displayName = "Form";

export { Form };
export default Form;
