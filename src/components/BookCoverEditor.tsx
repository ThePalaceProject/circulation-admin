import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import editorAdapter from "../editorAdapter";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";
import ErrorMessage from "./ErrorMessage";
import EditableInput from "./EditableInput";
import { BookData, RightsStatusData } from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { State } from "../reducers/index";
import Collapsible from "./Collapsible";

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
  store?: Store<State>;
  csrfToken: string;
  bookUrl: string;
  book: BookData;
  refreshCatalog: () => Promise<any>;
}

export interface BookCoverEditorProps extends BookCoverEditorStateProps, BookCoverEditorDispatchProps, BookCoverEditorOwnProps {};

/** Tab on the book details page for uploading a new book cover. */
export class BookCoverEditor extends React.Component<BookCoverEditorProps, void> {
  constructor(props) {
    super(props);
    this.refresh = this.refresh.bind(this);
    this.preview = this.preview.bind(this);
    this.save = this.save.bind(this);
    this.renderCoverForm = this.renderCoverForm.bind(this);
  }

  renderCoverForm() {
    return (
      <div>
        <p>Cover must be at least 600px x 900px and in PNG, JPG, or GIF format.</p>
        <form ref="cover">
          <fieldset>
            <legend className="visuallyHidden">Cover Image</legend>
            <EditableInput
              elementType="input"
              type="text"
              disabled={this.props.isFetching}
              name="cover_url"
              label="URL for cover image"
              onChange={this.preview}
              ref="cover_url"
              optionalText={false}
              />
            <EditableInput
              elementType="input"
              type="file"
              disabled={this.props.isFetching}
              name="cover_file"
              label="Or upload cover image"
              accept="image/*"
              onChange={this.preview}
              ref="cover_file"
              optionalText={false}
              />
            <EditableInput
              elementType="select"
              disabled={this.props.isFetching}
              name="title_position"
              label="Title and Author Position"
              onChange={this.preview}
              value="none"
              >
              <option value="none">None</option>
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </EditableInput>
          </fieldset>
        </form>
        { this.props.previewFetchError &&
          <ErrorMessage error={this.props.previewFetchError} />
        }
        { this.props.isFetchingPreview &&
          <h5 className="cover-fetching-preview-container">
            Updating Preview&nbsp;
            <i className="fa fa-spinner fa-spin"></i>
          </h5>
        }
        { this.props.preview &&
          <div>
            <h4>Preview:</h4>
            <img
              src={this.props.preview}
              className="book-cover preview-cover"
              alt="Preview of new cover"
              />
          </div>
        }
      </div>
    );
  }

  render(): JSX.Element {
    return (
      <div>
        { this.props.book &&
          <div>
            <h2>
              {this.props.book.title}
            </h2>
            { this.props.isFetching &&
              <div className="cover-fetching-container">
                <h4>
                  Updating
                  <i className="fa fa-spinner fa-spin"></i>
                </h4>
              </div>
            }
            <div>
              <h3>Current cover:</h3>
              <img
                src={this.props.book.coverUrl}
                className="book-cover current-cover"
                alt="Current book cover"
                />
            </div>
            <div>
              <h3>Change cover:</h3>
              <Collapsible
                title="Cover Metadata"
                openByDefault={true}
                body={this.renderCoverForm()}
              />
              { this.props.rightsStatuses &&
                <Collapsible
                  title="Rights"
                  openByDefault={true}
                  body={
                    <form ref="rights">
                      <fieldset>
                        <legend className="visuallyHidden">Rights:</legend>
                        <EditableInput
                          elementType="select"
                          disabled={this.props.isFetching}
                          name="rights_status"
                          label="License"
                          >
                          { Object.keys(this.props.rightsStatuses).map(uri => {
                                let status = this.props.rightsStatuses[uri];
                                if (status.allows_derivatives) {
                                  return (
                                    <option value={uri} key={uri}>{status.name}</option>
                                  );
                                }
                                return null;
                              }
                            )
                          }
                          <option value="http://librarysimplified.org/terms/rights-status/in-copyright">In Copyright</option>
                          <option value="http://librarysimplified.org/terms/rights-status/unknown">Other</option>
                        </EditableInput>
                        <EditableInput
                          elementType="textarea"
                          disabled={this.props.isFetching}
                          name="rights_explanation"
                          label="Explanation of rights"
                          optionalText={false}
                        />
                      </fieldset>
                    </form>
                  }
                />
              }
              <button
                className="btn btn-default"
                type="submit"
                onClick={this.save}
                disabled={this.props.isFetching || !this.props.preview}
                >Save this cover</button>
            </div>
          </div>
        }

        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} />
        }

      </div>
    );
  }

  componentWillMount() {
    if (this.props.clearPreview) {
      this.props.clearPreview();
    }
    if (this.props.fetchRightsStatuses) {
      this.props.fetchRightsStatuses();
    }
  }

  previewUrl() {
    return this.props.bookAdminUrl + "/preview_book_cover";
  }

  preview() {
    const coverForm = (this.refs["cover"] as any);
    const formData = new (window as any).FormData(coverForm);
    const file = (this.refs["cover_file"] as any).getValue();
    const url = (this.refs["cover_url"] as any).getValue();
    if (!file && !url && this.props.clearPreview) {
      this.props.clearPreview();
    }
    if ((file || url) && this.props.fetchPreview) {
      this.props.fetchPreview(this.previewUrl(), formData);
    }
  }

  refresh() {
    this.props.fetchBook(this.props.bookAdminUrl);
    this.props.refreshCatalog();
  }

  save () {
    const editUrl = this.props.book && this.props.book.changeCoverLink && this.props.book.changeCoverLink.href;
    const coverForm = (this.refs["cover"] as any);
    const formData = new (window as any).FormData(coverForm);
    const coverFile = (this.refs["cover_file"] as any).getValue();
    const coverUrl = (this.refs["cover_url"] as any).getValue();
    const rightsForm = (this.refs["rights"] as any);
    const rightsFormData = new (window as any).FormData(rightsForm);
    formData.append("rights_status", rightsFormData.get("rights_status"));
    formData.append("rights_explanation", rightsFormData.get("rights_explanation"));
    if (editUrl && this.props.preview && this.props.editCover) {
      this.props.editCover(editUrl, formData).then(this.refresh);
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    bookAdminUrl: state.editor.book.url,
    preview: state.editor.bookCoverPreview.data,
    rightsStatuses: state.editor.rightsStatuses.data,
    isFetching: state.editor.book.isFetching || state.editor.bookCover.isFetching || state.editor.rightsStatuses.isFetching || state.editor.bookCover.isEditing,
    fetchError: state.editor.book.fetchError || state.editor.bookCover.fetchError || state.editor.rightsStatuses.fetchError,
    isFetchingPreview: state.editor.bookCoverPreview.isFetching,
    previewFetchError: state.editor.bookCoverPreview.fetchError
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let fetcher = new DataFetcher({ adapter: editorAdapter });
  let actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    fetchBook: (url: string) => dispatch(actions.fetchBookAdmin(url)),
    fetchPreview: (url: string, data: FormData) => dispatch(actions.fetchBookCoverPreview(url, data)),
    clearPreview: () => dispatch(actions.clearBookCoverPreview()),
    editCover: (url: string, data: FormData) => dispatch(actions.editBookCover(url, data)),
    fetchRightsStatuses: () => dispatch(actions.fetchRightsStatuses())
  };
}

const ConnectedBookCoverEditor = connect<BookCoverEditorStateProps, BookCoverEditorDispatchProps, BookCoverEditorOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(BookCoverEditor);

export default ConnectedBookCoverEditor;
