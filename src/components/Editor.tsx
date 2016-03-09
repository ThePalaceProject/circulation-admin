import * as React from "react";
import { connect } from "react-redux";
import DataFetcher from "opds-browser/lib/DataFetcher";
import ActionCreator from "../actions";
import editorAdapter from "../editorAdapter";
import ButtonForm from "./ButtonForm";

class Editor extends React.Component<EditorProps, any> {
  render(): JSX.Element {
    return (
      <div>
        <h1>Editor</h1>
        { this.props.bookData &&
          (<div>
            <h2>Editing {this.props.bookData.title}</h2>
            { this.props.bookData.hideLink &&
              <ButtonForm label={"Hide"} link={this.props.bookData.hideLink.href} csrfToken={this.props.csrfToken} />
            }
            { this.props.bookData.restoreLink &&
              <ButtonForm label={"Restore"} link={this.props.bookData.restoreLink.href} csrfToken={this.props.csrfToken} />
            }
          </div>)
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.book) {
      let bookUrl = this.props.book.replace("works", "admin/works");
      this.props.setBook(bookUrl);
    }
  }
}

function mapStateToProps(state) {
  return { bookData: state.book.data };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher(null, editorAdapter);
  let actions = new ActionCreator(fetcher);
  return {
    fetchBook: (url: string) => dispatch(actions.fetchBook(url))
  };
}

function mergeRootProps(stateProps, dispatchProps, componentProps) {
  let setBook = (book: string) => {
    return new Promise((resolve, reject) => {
      dispatchProps.fetchBook(book).then(data => resolve(data));
    });
  };

  return Object.assign({}, componentProps, stateProps, dispatchProps, {
    setBook: setBook
  });
}

const ConnectedEditor = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(Editor);

export default ConnectedEditor;