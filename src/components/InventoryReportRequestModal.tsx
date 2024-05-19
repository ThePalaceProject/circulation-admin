import * as React from "react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Modal } from "react-bootstrap";
import { Button } from "library-simplified-reusable-components";
import {
  getInventoryReportInfo,
  requestInventoryReport,
  InventoryReportCollectionInfo,
  InventoryReportRequestParams,
} from "../api/admin";
import Admin from "../models/Admin";
import * as PropTypes from "prop-types";

interface FormProps {
  show: boolean;
  onHide: () => void;
  library: string;
}

// Create a modal to request an inventory report library and email address and to report on success.
// *** To use the legacy context here, we need to create a `contextProps` property on this function object:
// ***   InventoryReportRequestModal.contextTypes = { email: PropTypes.string }
// *** See: https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-stateless-function-components
const InventoryReportRequestModal = (
  { show, onHide, library }: FormProps,
  context: { admin: Admin }
) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(true);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);

  const resetState = () => {
    setShowConfirmationModal(true);
    setShowResponseModal(false);
    setResponseMessage(null);
  };

  const { mutate: generateReport } = useGenerateReport({
    library,
    setResponseMessage,
    setShowConfirmationModal,
    setShowResponseModal,
  });

  const resetForm = () => {
    onHide();
    resetState();
  };

  const { email } = context.admin;
  const { collections } = useReportInfo(show, { library });

  return componentContent({
    show,
    onHide: resetForm,
    generateReport,
    shouldShowConfirmation: showConfirmationModal,
    shouldShowResponse: showResponseModal,
    collections,
    email,
    responseMessage,
  });
};
// TODO: This is needed to support legacy context provider on this component (see above).
//  The overall approach should be replaced with another mechanism (e.g., `useContext` or
//  `useSelector` if we move `email` to new context provider or Redux, respectively).
InventoryReportRequestModal.contextTypes = {
  admin: PropTypes.object.isRequired,
};

type componentContentProps = {
  show: boolean;
  onHide: () => void;
  generateReport: () => void;
  email?: string;
  collections: InventoryReportCollectionInfo[];
  responseMessage: React.ReactElement;
  shouldShowConfirmation: boolean;
  shouldShowResponse: boolean;
};
const componentContent = ({
  show,
  onHide,
  generateReport,
  email = undefined,
  collections = [],
  responseMessage,
  shouldShowConfirmation,
  shouldShowResponse,
}: componentContentProps) => {
  if (!show) {
    return null;
  }

  return (
    <>
      {shouldShowConfirmation &&
        renderConfirmationModal({
          show,
          onHide,
          email,
          collections,
          generateReport,
        })}
      {shouldShowResponse &&
        renderResponseModal({ show, onHide, responseMessage })}
    </>
  );
};

const renderResponseModal = ({ show, onHide, responseMessage }) => {
  return renderModal({
    show,
    onHide: onHide,
    title: "Report Request Response",
    content: (
      <>
        <p>{responseMessage}</p>
        <Button
          className="inverted left-align small inline"
          callback={onHide}
          title="Acknowledge Response"
          content="Ok"
        />
      </>
    ),
  });
};

const renderConfirmationModal = ({
  show,
  onHide,
  email,
  collections,
  generateReport,
}) => {
  const eligibleCollections = (collections) => collections?.length !== 0;

  const confirmationMessage = (collections) => {
    return eligibleCollections(collections) ? (
      <>
        <p>{reportDestinationText(email)}</p>
        <p>{reportCollectionsMessage(collections)}</p>
        {collectionList(collections)}
      </>
    ) : (
      <p>
        Inventory reports are available for only a subset of collection types.
        There are no eligible collections for this library.
      </p>
    );
  };
  console.log(collections, eligibleCollections(collections));
  return renderModal({
    show,
    onHide: onHide,
    title: "Request Inventory Report",
    content: (
      <>
        {confirmationMessage(collections)}
        <Button
          className="left-align small inline"
          onClick={generateReport}
          title="Confirm Report Request"
          content="Run Report"
          disabled={!eligibleCollections(collections)}
        />
        <Button
          className="inverted left-align small inline"
          callback={onHide}
          title="Cancel Report Request"
          content="Cancel"
        />
      </>
    ),
  });
};

const renderModal = ({
  show,
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
        <Modal.Body styles={{ overflow: "wrap", color: "red" }}>
          {content}
        </Modal.Body>
      )}
      {!!footer && <Modal.Footer>{footer}</Modal.Footer>}
    </Modal>
  );
};

export const reportDestinationText = (email: string) => {
  return `The inventory report will be generated in the background and\
          emailed to you${email ? ` at <${email}>` : ""} when ready.`;
};

const reportCollectionsMessage = (
  collections: InventoryReportCollectionInfo[]
) => {
  return collections.length > 0
    ? "The report will include titles from the following collections:"
    : "The report will include titles from all eligible collections.";
};

const collectionList = (collections: InventoryReportCollectionInfo[]) => {
  return (
    collections.length > 0 && (
      <ul>
        {collections.map((c) => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    )
  );
};

/**
 * Try to fetch report information from the backend. If successful, it
 * will be used in the confirmation view.
 *
 * param library: The name of the library for which to request information.
 * param show: Whether to show the modal or not. If false, the modal will be hidden and no information will be fetched from
 *
 */
export const useReportInfo = (
  show: boolean,
  { library, baseEndpointUrl = undefined }: InventoryReportRequestParams
) => {
  const { fetchStatus, isSuccess, isError, data, error } = useQuery({
    queryKey: ["inventory_report_info", library, baseEndpointUrl],
    queryFn: () => getInventoryReportInfo({ library, baseEndpointUrl }),
    enabled: show,
    staleTime: 1000 * 60 * 5, // 5 minutes (in milliseconds)
    retry: 0, // Currently, this information isn't that important, so we don't retry.
  });
  const collections =
    isSuccess && show
      ? // TODO: We could avoid repeatedly performing this transformation
        //  by pushing it down to the API layer.
        data.collections.sort((a, b) => (a.name > b.name ? 1 : -1))
      : undefined;
  return { fetchStatus, isSuccess, isError, error, collections };
};

export const useGenerateReport = ({
  library,
  baseEndpointUrl = undefined,
  setShowConfirmationModal,
  setResponseMessage,
  setShowResponseModal,
}) => {
  return useMutation({
    mutationFn: () => requestInventoryReport({ library, baseEndpointUrl }),
    onMutate: () => setShowConfirmationModal(false),
    onSuccess: (data) => setResponseMessage(`✅ ${data.message}`),
    onError: (error) => setResponseMessage(`❌ ${(error as Error).message}`),
    onSettled: () => setShowResponseModal(true),
  });
};

export default InventoryReportRequestModal;
