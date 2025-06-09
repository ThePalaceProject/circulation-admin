import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import CirculationEventsDownloadForm from "./CirculationEventsDownloadForm";
import { useAppFeatureFlags } from "../context/appContext";

export interface CirculationEventsDownloadProps {
  library?: string;
}

const CirculationEventsDownload = ({
  library,
}: CirculationEventsDownloadProps) => {
  const [isFormVisible, setIsFormVisible] = React.useState(false);
  const { showCircEventsDownload } = useAppFeatureFlags();

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  if (!showCircEventsDownload) {
    return null;
  }

  return (
    <>
      <h2>Circulation Events</h2>
      <Button
        callback={toggleFormVisibility}
        content="Download CSV"
        className="left-align"
      />
      <CirculationEventsDownloadForm
        show={isFormVisible}
        hide={toggleFormVisibility}
        library={library}
      />
    </>
  );
};

export default CirculationEventsDownload;
