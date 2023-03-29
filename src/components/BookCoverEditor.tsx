import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import editorAdapter from "../editorAdapter";
import DataFetcher from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import ActionCreator from "../actions";
import ErrorMessage from "./ErrorMessage";
import EditableInput from "./EditableInput";
import { BookData, RightsStatusData } from "../interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { RootState } from "../store";
import { Panel, Button, Form } from "library-simplified-reusable-components";
import UpdatingLoader from "./UpdatingLoader";

export interface BookCoverEditorStateProps {
  bookAdminUrl?: string;
  preview?: string;
  rightsStatuses?: RightsStatusData;
  fetchError?: FetchErrorData;
  isFetching?: boolean;
  previewFetchError?: FetchErrorData;
  isFetchingPreview?: boolean;
}

export interface BookCoverEditorDispatchProps {
  fetchBook?: (url: string) => Promise<any>;
  fetchPreview?: (url: string, data: FormData) => Promise<any>;
  clearPreview?: () => Promise<any>;
  editCover?: (url: string, data: FormData) => Promise<any>;
  fetchRightsStatuses?: () => Promise<RightsStatusData>;
}

export interface BookCoverEditorOwnProps {
  store?: Store<RootState>;
  csrfToken: string;
  bookUrl: string;
  book: BookData;
  refreshCatalog: () => Promise<any>;
}

export interface BookCoverEditorProps
  extends BookCoverEditorStateProps,
    BookCoverEditorDispatchProps,
    BookCoverEditorOwnProps {}

/** Tab on the book details page for uploading a new book cover. */
export class BookCoverEditor extends React.Component<BookCoverEditorProps> {
  private formContainerRef = React.createRef<HTMLDivElement>();
  private imageFormRef = React.createRef<Form>();
  private coverUrlRef = React.createRef<EditableInput>();
  private coverFileRef = React.createRef<EditableInput>();
  private titlePositionRef = React.createRef<EditableInput>();
  private rightsFormRef = React.createRef<Form>();
  private rightStatusRef = React.createRef<EditableInput>();
  constructor(props) {
    super(props);
    this.refresh = this.refresh.bind(this);
    this.preview = this.preview.bind(this);
    this.save = this.save.bind(this);
    this.renderCoverForm = this.renderCoverForm.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (this.props.clearPreview) {
      this.props.clearPreview();
    }
    if (this.props.fetchRightsStatuses) {
      this.props.fetchRightsStatuses();
    }
  }

  render(): JSX.Element {
    return (
      this.props.book && (
        <div>
          <h2>{this.props.book.title}</h2>

          <UpdatingLoader show={this.props.isFetching} />

          <div>
            <h3>Current cover:</h3>
            <img
              src={this.props.book.coverUrl}
              className="book-cover current-cover"
              alt="Current book cover"
            />
          </div>
          <div ref={this.formContainerRef} className="cover-edit-form">
            <h3>Change cover:</h3>
            <Panel
              id="cover-metadata"
              headerText="Cover Metadata"
              openByDefault={true}
              content={this.renderCoverForm()}
              onEnter={this.save}
            />
            {this.props.rightsStatuses && (
              <Panel
                id="rights"
                headerText="Rights"
                openByDefault={true}
                onEnter={this.save}
                content={this.renderRightsForm()}
              />
            )}
            <Button
              className="left-align"
              content="Save this cover"
              disabled={this.props.isFetching || !this.props.preview}
              callback={this.save}
            />
          </div>
          {this.props.fetchError && (
            <ErrorMessage error={this.props.fetchError} />
          )}
        </div>
      )
    );
  }

  renderCoverForm() {
    const titlePositionRef = this.titlePositionRef.current;
    const titlePositionValue = titlePositionRef && titlePositionRef.getValue();
    return (
      <div>
        <p>
          Cover must be at least 600px x 900px and in PNG, JPG, or GIF format.
        </p>
        <Form
          ref={this.imageFormRef}
          className="edit-form"
          onSubmit={this.preview}
          buttonContent="Preview"
          buttonClass="top-align"
          errorText={
            this.props.previewFetchError && (
              <ErrorMessage error={this.props.previewFetchError} />
            )
          }
          content={
            <fieldset key="cover-image">
              <legend className="visuallyHidden">Cover Image</legend>
              <EditableInput
                elementType="input"
                type="text"
                disabled={this.props.isFetching}
                name="cover_url"
                label="URL for cover image"
                description={
                  this.props.book.coverUrl
                    ? `Current URL: ${this.props.book.coverUrl}`
                    : ""
                }
                ref={this.coverUrlRef}
                optionalText={false}
              />
              <EditableInput
                elementType="input"
                type="file"
                disabled={this.props.isFetching}
                name="cover_file"
                label="Or upload cover image"
                accept="image/*"
                ref={this.coverFileRef}
                optionalText={false}
              />
              <EditableInput
                elementType="select"
                disabled={this.props.isFetching}
                name="title_position"
                label="Title and Author Position"
                value="none"
                ref={this.titlePositionRef}
              >
                <option
                  value="none"
                  aria-selected={titlePositionValue === "none"}
                >
                  None
                </option>
                <option
                  value="top"
                  aria-selected={titlePositionValue === "top"}
                >
                  Top
                </option>
                <option
                  value="center"
                  aria-selected={titlePositionValue === "center"}
                >
                  Center
                </option>
                <option
                  value="bottom"
                  aria-selected={titlePositionValue === "bottom"}
                >
                  Bottom
                </option>
              </EditableInput>
            </fieldset>
          }
        />

        <UpdatingLoader
          text="Updating Preview"
          show={this.props.isFetchingPreview}
        />

        {this.props.preview && (
          <div>
            <h4>Preview:</h4>
            <img
              src={this.props.preview}
              className="book-cover preview-cover"
              alt="Preview of new cover"
            />
          </div>
        )}
      </div>
    );
  }

  previewUrl() {
    return this.props.bookAdminUrl + "/preview_book_cover";
  }

  preview(data: FormData) {
    const file = this.coverFileRef.current.getValue();
    const url = this.coverUrlRef.current.getValue();
    if (!file && !url && this.props.clearPreview) {
      this.props.clearPreview();
    }
    if ((file || url) && this.props.fetchPreview) {
      this.props.fetchPreview(this.previewUrl(), data);
    }
  }

  renderRightsForm() {
    const copyrightStatusUri =
      "http://librarysimplified.org/terms/rights-status/in-copyright";
    const unknownStatusUri =
      "http://librarysimplified.org/terms/rights-status/unknown";
    const rightStatusRef = this.rightStatusRef.current;
    const rightStatusValue = rightStatusRef && rightStatusRef.getValue();
    return (
      <Form
        ref={this.rightsFormRef}
        onSubmit={this.save}
        className="edit-form"
        withoutButton={true}
        content={
          <fieldset key="rights">
            <legend className="visuallyHidden">Rights:</legend>
            <EditableInput
              elementType="select"
              disabled={this.props.isFetching}
              name="rights_status"
              ref={this.rightStatusRef}
              label="License"
            >
              {Object.keys(this.props.rightsStatuses).map((uri) => {
                const status = this.props.rightsStatuses[uri];
                if (status.allows_derivatives) {
                  return (
                    <option
                      value={uri}
                      key={uri}
                      aria-selected={rightStatusValue === uri}
                    >
                      {status.name}
                    </option>
                  );
                }
                return null;
              })}
              <option
                value={copyrightStatusUri}
                aria-selected={rightStatusValue === copyrightStatusUri}
              >
                In Copyright
              </option>
              <option
                value={unknownStatusUri}
                aria-selected={rightStatusValue === unknownStatusUri}
              >
                Other
              </option>
            </EditableInput>
            <EditableInput
              elementType="textarea"
              disabled={this.props.isFetching}
              name="rights_explanation"
              label="Explanation of rights"
              optionalText={false}
            />
          </fieldset>
        }
      />
    );
  }

  refresh() {
    this.props.fetchBook(this.props.bookAdminUrl);
    this.props.refreshCatalog();
  }

  save() {
    const data = new (window as any).FormData();

    const editUrl =
      this.props.book &&
      this.props.book.changeCoverLink &&
      this.props.book.changeCoverLink.href;

    const imageForm = this.imageFormRef.current.formRef.current;
    const imageFormData = new (window as any).FormData(imageForm);
    data.append("cover_file", imageFormData.get("cover_file"));
    data.append("cover_url", imageFormData.get("cover_url"));
    data.append("title_position", imageFormData.get("title_position"));

    const rightsForm = this.rightsFormRef.current.formRef.current;
    const rightsFormData = new (window as any).FormData(rightsForm);
    data.append("rights_status", rightsFormData.get("rights_status"));
    data.append("rights_explanation", rightsFormData.get("rights_explanation"));

    if (editUrl && this.props.preview && this.props.editCover) {
      this.props.editCover(editUrl, data).then(this.refresh);
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    bookAdminUrl: state.editor.book.url,
    preview: state.editor.bookCoverPreview.data,
    rightsStatuses: state.editor.rightsStatuses.data,
    isFetching:
      state.editor.book.isFetching ||
      state.editor.bookCover.isFetching ||
      state.editor.rightsStatuses.isFetching ||
      state.editor.bookCover.isEditing,
    fetchError:
      state.editor.book.fetchError ||
      state.editor.bookCover.fetchError ||
      state.editor.rightsStatuses.fetchError,
    isFetchingPreview: state.editor.bookCoverPreview.isFetching,
    previewFetchError: state.editor.bookCoverPreview.fetchError,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const fetcher = new DataFetcher({ adapter: editorAdapter });
  const actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    fetchBook: (url: string) => dispatch(actions.fetchBookAdmin(url)),
    fetchPreview: (url: string, data: FormData) =>
      dispatch(actions.fetchBookCoverPreview(url, data)),
    clearPreview: () => dispatch(actions.clearBookCoverPreview()),
    editCover: (url: string, data: FormData) =>
      dispatch(actions.editBookCover(url, data)),
    fetchRightsStatuses: () => dispatch(actions.fetchRightsStatuses()),
  };
}

const ConnectedBookCoverEditor = connect<
  BookCoverEditorStateProps,
  BookCoverEditorDispatchProps,
  BookCoverEditorOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(BookCoverEditor);

export default ConnectedBookCoverEditor;
