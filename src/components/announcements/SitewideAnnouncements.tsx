import * as React from "react";
import { connect } from "react-redux";
import { Alert } from "react-bootstrap";
import { Form } from "library-simplified-reusable-components";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import { SitewideAnnouncementsData, AnnouncementData } from "../../interfaces";
import {
  configServicesApi,
  getLastMutation,
  rtkErrorToFetchError,
  isResultFetching,
} from "../../features/configServices/configServicesSlice";
import EditableConfigList, {
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
  EditableConfigListProps,
} from "../config/EditableConfigList";
import ErrorMessage from "../shared/ErrorMessage";
import AnnouncementsSection from "./AnnouncementsSection";

/** Right panel for sitewide announcements on the system configuration page. */
export class SitewideAnnouncements extends EditableConfigList<
  SitewideAnnouncementsData,
  AnnouncementData
> {
  // There is no individual item edit form for an announcement.
  EditForm = null;
  listDataKey = "announcements";
  itemTypeName = "sitewide announcement";
  urlBase = "/admin/web/config/sitewideAnnouncements/";
  identifierKey = "id";
  labelKey = "content";

  private announcementsRef = React.createRef<AnnouncementsSection>();

  constructor(props: EditableConfigListProps<SitewideAnnouncementsData>) {
    super(props);

    this.submit = this.submit.bind(this);
  }

  render() {
    const {
      data,
      editOrCreate,
      fetchError,
      formError,
      isFetching,
      responseBody,
    } = this.props;

    const headers = this.getHeaders();

    const canListAllData =
      !isFetching && !editOrCreate && data?.[this.listDataKey];

    const canEdit = this.canEdit(data?.settings?.[0] || {});

    return (
      <div className={this.getClassName()}>
        <h2>{headers["h2"]}</h2>
        {canListAllData && this.links?.["info"] && (
          <Alert bsStyle="info">{this.links["info"]}</Alert>
        )}
        {responseBody && (
          <Alert bsStyle="success">{this.successMessage()}</Alert>
        )}
        {fetchError && <ErrorMessage error={fetchError} />}
        {formError && <ErrorMessage error={formError} />}
        {isFetching && <LoadingIndicator />}

        {canListAllData && (
          <Form
            onSubmit={this.submit}
            className="no-border edit-form"
            disableButton={!canEdit || isFetching}
            content={[
              <AnnouncementsSection
                key="announcements-section"
                setting={data.settings[0]}
                value={data[this.listDataKey]}
                ref={this.announcementsRef}
              />,
            ]}
          />
        )}
      </div>
    );
  }

  async submit(data: FormData) {
    const announcements = this.announcementsRef.current.getValue();

    data?.set("announcements", JSON.stringify(announcements));

    await this.editItem(data);
  }
}

function mapStateToProps(state) {
  const announcementsResult = configServicesApi.endpoints.getSitewideAnnouncements.select()(
    state
  );
  const lastEdit = getLastMutation(state, "editSitewideAnnouncements");
  return {
    data: announcementsResult.data ?? null,
    responseBody:
      lastEdit?.["status"] === "fulfilled"
        ? (lastEdit["data"] as string)
        : null,
    fetchError: announcementsResult.error
      ? rtkErrorToFetchError(announcementsResult.error)
      : null,
    formError:
      lastEdit?.["status"] === "rejected"
        ? rtkErrorToFetchError(lastEdit["error"])
        : null,
    isFetching: isResultFetching(announcementsResult),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const csrfToken: string = ownProps.csrfToken;
  return {
    fetchData: () =>
      dispatch(
        configServicesApi.endpoints.getSitewideAnnouncements.initiate(
          undefined,
          { forceRefetch: true }
        )
      ),
    editItem: (data: FormData) =>
      dispatch(
        configServicesApi.endpoints.editSitewideAnnouncements.initiate({
          data,
          csrfToken,
        })
      ),
  };
}

const ConnectedSitewideAnnouncements = connect<
  EditableConfigListStateProps<SitewideAnnouncementsData>,
  EditableConfigListDispatchProps<SitewideAnnouncementsData>,
  EditableConfigListOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(SitewideAnnouncements);

export default ConnectedSitewideAnnouncements;
