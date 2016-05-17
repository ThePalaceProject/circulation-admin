jest.autoMockOff();

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import buildStore from "../../store";
import BookDetailsContainer from "../BookDetailsContainer";
import TabContainer from "../TabContainer";

let initialState = {
  book: {
    url: null,
    data: null,
    isFetching: false,
    fetchError: null,
    editError: null
  },
  complaints: {
    url: null,
    data: null,
    isFetching: false,
    fetchError: null
  }
};

describe("BookDetailsContainer", () => {
  let navigate;
  let container;
  let store;
  let context;

  beforeEach(() => {
    store = buildStore();
    navigate = jest.genMockFunction();

    class FakeContext extends React.Component<any, any> {
      static childContextTypes = {
        editorStore: React.PropTypes.object,
        csrfToken: React.PropTypes.string,
        navigate: React.PropTypes.func,
        tab: React.PropTypes.string
      };

      getChildContext() {
        return {
          editorStore: store,
          csrfToken: "token",
          navigate: navigate,
          tab: "tab"
        };
      }

      render(): JSX.Element {
        return (
          <div>{ this.props.children }</div>
        );
      }
    }

    container = TestUtils.renderIntoDocument(
      <FakeContext>
        <BookDetailsContainer bookUrl="book url" collectionUrl="collection url" refreshBrowser={jest.genMockFunction()}>
          <div className="bookDetails">Moby Dick</div>
        </BookDetailsContainer>
      </FakeContext>
    );
  });

  it("shows a tab container with initial tab", () => {
    let tabContainer = TestUtils.findRenderedComponentWithType(container, TabContainer);
    expect(tabContainer).toBeTruthy();
    expect(tabContainer.props.tab).toBe("tab");
  });
});