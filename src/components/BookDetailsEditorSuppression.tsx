import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import { LinkData } from "../interfaces";
import ConfirmationModalWithOutcome, {
  SHOW_CONFIRMATION,
  SHOW_OUTCOME,
  ModalState,
} from "./ConfirmationModalWithOutcome";
import ErrorMessage, { pdString } from "./ErrorMessage";
import { SuppressionMutationMethodType } from "../features/book/bookEditorSlice";

type BookDetailsEditorPerLibraryVisibilityProps = {
  link: LinkData;
  onConfirm: () => SuppressionMutationMethodType;
  onComplete: () => void;
  buttonContent: string;
  buttonTitle: string;
  className?: string;
  buttonDisabled: boolean;
  confirmationTitle?: string;
  confirmationBody?: React.ReactElement;
  confirmationButtonContent?: string;
  confirmationButtonTitle?: string;
  dismissOutcomeButtonContent?: string;
  dismissOutcomeButtonTitle?: string;
  defaultSuccessMessage?: React.ReactElement;
  defaultFailureMessage?: React.ReactElement;
};

const BookDetailsEditorSuppression = ({
  link,
  onConfirm,
  onComplete = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  buttonContent,
  buttonTitle = buttonContent,
  className = "",
  buttonDisabled,
  confirmationTitle = "Confirm",
  confirmationBody = <p>Are you sure?</p>,
  confirmationButtonContent = "Confirm",
  confirmationButtonTitle = "Confirm action.",
  defaultSuccessMessage = <p>Success!</p>,
  defaultFailureMessage = <p>Something went wrong.</p>,
}: BookDetailsEditorPerLibraryVisibilityProps) => {
  const [modalState, setModalState] = React.useState<ModalState>(undefined);
  const [outcomeMessage, setOutcomeMessage] = React.useState<
    React.ReactElement
  >(null);
  const [confirmed, setConfirmed] = React.useState(false);

  const reset = () => {
    confirmed && onComplete();
    setConfirmed(false);
    setModalState(undefined);
    setOutcomeMessage(null);
  };
  const modalIsVisible = () => {
    return !!modalState;
  };
  const showModal = () => {
    setModalState(SHOW_CONFIRMATION);
  };
  const localOnConfirm = async () => {
    onConfirm()
      .unwrap()
      .then((resolved) => {
        setOutcomeMessage(
          <span>
            ✅{" "}
            {(resolved?.message || defaultSuccessMessage) as React.ReactElement}
          </span>
        );
      })
      .catch((error) => {
        let errorMessage: React.ReactElement;
        if (!error) {
          errorMessage = defaultFailureMessage;
        } else {
          let response: string;
          if (error.data?.detail && error.data?.title && error.data?.status) {
            response = `${pdString}: ${JSON.stringify(error.data)}`;
          } else {
            response = `<pre>${JSON.stringify(error, undefined, 2)}</pre>`;
          }
          errorMessage = (
            <ErrorMessage
              error={{ url: link.href, status: error?.status, response }}
            />
          );
        }
        setOutcomeMessage(<span>❌ {errorMessage}</span>);
      });
    setModalState(SHOW_OUTCOME);
    setConfirmed(true);
  };

  return (
    <>
      {!!link && (
        <Button
          className={className}
          disabled={buttonDisabled || modalIsVisible()}
          content={buttonContent}
          title={buttonTitle}
          callback={showModal}
        />
      )}
      {modalIsVisible() && (
        <ConfirmationModalWithOutcome
          modalState={modalState}
          onClose={reset}
          onConfirm={localOnConfirm}
          onDismissOutcome={reset}
          confirmationTitle={confirmationTitle}
          confirmationBody={confirmationBody}
          confirmationButtonContent={confirmationButtonContent}
          confirmationButtonTitle={confirmationButtonTitle}
          outcomeTitle="Result"
          outcomeBody={outcomeMessage}
        />
      )}
    </>
  );
};

export default BookDetailsEditorSuppression;
