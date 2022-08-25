import { SitewideAnnouncementsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<SitewideAnnouncementsData>(
  ActionCreator.SITEWIDE_ANNOUNCEMENTS,
);
