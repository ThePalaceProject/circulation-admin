import * as React from "react";
import { Modal } from "react-bootstrap";
import { Button } from "library-simplified-reusable-components";

export const SHOW_CONFIRMATION = "SHOW_CONFIRMATION";
export const SHOW_OUTCOME = "SHOW_OUTCOME";
export type ModalState =
  | typeof SHOW_CONFIRMATION
  | typeof SHOW_OUTCOME
  | undefined;

export type ConfirmationModalWithOutcomeProps = {
  modalState: ModalState;
  onClose: () => void;
  onConfirm: () => void;
  onDismissOutcome?: () => void;
  confirmationTitle?: string;
  confirmationBody?: React.ReactElement;
  confirmationButtonContent?: string;
  confirmationButtonTitle?: string;
  confirmationButtonDisabled?: boolean;
  cancelButtonContent?: string;
  cancelButtonTitle?: string;
  outcomeTitle?: string;
  outcomeBody?: React.ReactElement;
  dismissOutcomeButtonContent?: string;
  dismissOutcomeButtonTitle?: string;
};

export const ConfirmationModalWithOutcome = ({
  modalState,
  onClose,
  onConfirm,
  onDismissOutcome = onClose,
  confirmationTitle = "Confirm",
  confirmationBody = <p>Are you sure?</p>,
  confirmationButtonContent = "Confirm",
  confirmationButtonTitle = "Confirm action.",
  confirmationButtonDisabled = false,
  cancelButtonContent = "Cancel",
  cancelButtonTitle = "Cancel action.",
  outcomeTitle = "Result",
  outcomeBody = <p>Action performed.</p>,
  dismissOutcomeButtonContent = "Dismiss",
  dismissOutcomeButtonTitle = "Dismiss outcome.",
}: ConfirmationModalWithOutcomeProps) => {
  switch (modalState) {
    case SHOW_CONFIRMATION:
      return renderModal({
        show: true,
        onHide: onClose,
        title: confirmationTitle,
        content: (
          <>
            <div>{confirmationBody}</div>
            <Button
              className="left-align small inline"
              onClick={onConfirm}
              title={confirmationButtonTitle}
              content={confirmationButtonContent}
              disabled={confirmationButtonDisabled}
            />
            <Button
              className="inverted left-align small inline"
              callback={onClose}
              title={cancelButtonTitle}
              content={cancelButtonContent}
            />
          </>
        ),
      });
    case SHOW_OUTCOME:
      return renderModal({
        show: true,
        onHide: onDismissOutcome,
        title: outcomeTitle,
        className: "confirmation-modal",
        content: (
          <>
            <div>{outcomeBody}</div>
            <Button
              className="inverted left-align small inline"
              callback={onDismissOutcome}
              title={dismissOutcomeButtonTitle}
              content={dismissOutcomeButtonContent}
            />
          </>
        ),
      });
    default:
      return null;
  }
};

const renderModal = ({
  show = true,
  onHide,
  title = undefined,
  content = undefined,
  footer = undefined,
  className = "",
}) => {
  return (
    <Modal className={className} show={show} onHide={onHide}>
      {!!title && (
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
      )}
      {!!content && (
        <Modal.Body style={{ overflow: "wrap" }}>{content}</Modal.Body>
      )}
      {!!footer && <Modal.Footer>{footer}</Modal.Footer>}
    </Modal>
  );
};

export default ConfirmationModalWithOutcome;
