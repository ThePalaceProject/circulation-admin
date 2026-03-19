import * as React from "react";
import { Alert } from "../ui/alert";
import { Form } from "../ui";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import { SitewideAnnouncementsData, AnnouncementData } from "../../interfaces";
import {
  useGetSitewideAnnouncementsQuery,
  useEditSitewideAnnouncementsMutation,
  rtkErrorToFetchError,
} from "../../features/configServices/configServicesSlice";
import EditableConfigList, {
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
          <Alert variant="info">{this.links["info"]}</Alert>
        )}
        {responseBody && (
          <Alert variant="success">{this.successMessage()}</Alert>
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

function SitewideAnnouncementsWithData(ownProps: EditableConfigListOwnProps) {
  const { csrfToken } = ownProps;
  const announcementsResult = useGetSitewideAnnouncementsQuery();
  const [
    editAnnouncements,
    editResult,
  ] = useEditSitewideAnnouncementsMutation();
  return (
    <SitewideAnnouncements
      {...ownProps}
      data={announcementsResult.data ?? null}
      fetchError={
        announcementsResult.error
          ? rtkErrorToFetchError(announcementsResult.error)
          : null
      }
      formError={
        editResult.isError ? rtkErrorToFetchError(editResult.error) : null
      }
      isFetching={announcementsResult.isFetching}
      responseBody={editResult.isSuccess ? (editResult.data as string) : null}
      fetchData={() =>
        setTimeout(() => announcementsResult.refetch(), 0) as any
      }
      editItem={(data) => editAnnouncements({ data, csrfToken }) as any}
    />
  );
}

export default SitewideAnnouncementsWithData;
