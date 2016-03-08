import * as React from "react";
import { connect } from "react-redux";
import DataFetcher from "opds-browser/lib/DataFetcher";
import ActionCreator from "../actions";

class Editor extends React.Component<any, any> {
  render(): JSX.Element {
    console.log(this.props.bookData);

    return (
      <div>
        <h1>Editor</h1>
        { this.props.bookData &&
          <h2>Editing {this.props.bookData.title}</h2>
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.book) {
      this.props.setBook(this.props.book);
    }
  }
}

function mapStateToProps(state) {
  return { bookData: state.book.data };
}

function mapDispatchToProps(dispatch) {
  return {
    createDispatchProps: (fetcher) => {
      let actions = new ActionCreator(fetcher);
      return {
        fetchBook: (url: string) => dispatch(actions.fetchBook(url))
      };
    }
  }
}

function mergeRootProps(stateProps, createDispatchProps, componentProps) {
  let adapter = (data: any): any => {
    return data;
  };
  let fetcher = new DataFetcher(null, adapter);
  let dispatchProps = createDispatchProps.createDispatchProps(fetcher);
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