import * as React from "react";
import { Button } from "../ui";
import CirculationEventsDownloadForm from "./CirculationEventsDownloadForm";
import { useAppFeatureFlags } from "../../context/appContext";

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
        className="left-align text-sm font-semibold"
        content={
          <span className="inline-flex items-center gap-1.5 [&_svg]:fill-current [&_svg]:h-4 [&_svg]:w-4">
            {/* Spreadsheet / table grid icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1zm8-4a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Download CSV
          </span>
        }
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
