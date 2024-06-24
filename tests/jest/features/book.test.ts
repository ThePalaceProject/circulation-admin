import reducer, {
  initialState,
  getBookData,
  GetBookDataArgs,
  submitBookData,
} from "../../../src/features/book/bookEditorSlice";
import { expect } from "chai";
import * as fetchMock from "fetch-mock-jest";
import { store } from "../../../src/store";
import { BookData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { RequestError } from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import { AsyncThunkAction, Dispatch } from "@reduxjs/toolkit";

const SAMPLE_BOOK_ADMIN_DETAIL = `
<entry xmlns="http://www.w3.org/2005/Atom" xmlns:app="http://www.w3.org/2007/app" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:opds="http://opds-spec.org/2010/catalog" xmlns:opf="http://www.idpf.org/2007/opf" xmlns:drm="http://librarysimplified.org/terms/drm" xmlns:schema="http://schema.org/" xmlns:simplified="http://librarysimplified.org/terms/" xmlns:bibframe="http://bibframe.org/vocab/" xmlns:bib="http://bib.schema.org/" xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/" xmlns:lcp="http://readium.org/lcp-specs/ns" schema:additionalType="http://schema.org/EBook">
    <title>Tea-Cup Reading and Fortune-Telling by Tea Leaves</title>
    <schema:alternativeHeadline>by a Highland Seer</schema:alternativeHeadline>
    <summary>First written in the year 1881 by A Highland Seer, it contains a list of omens, both good and bad, many of which are very familiar. Folklore, mystic paths, and enlightenment of the divine are laid out in simple terms to help the everyday person interpret patterns found in tea leaves. (Google Books)</summary>
    <simplified:pwid>60c23c76-f789-a51d-cd0b-31d2decf1271</simplified:pwid>
    <dcterms:language>en</dcterms:language>
    <dcterms:publisher>GEORGE SULLY AND COMPANY</dcterms:publisher>
    <dcterms:issued>1921-01-01</dcterms:issued>
    <id>urn:uuid:1cca9468-c447-4303-bc5a-c57470b85cb1</id>
    <bibframe:distribution bibframe:ProviderName="Palace Bookshelf"/>
    <published>2022-12-17T00:00:00Z</published>
    <updated>2023-05-03T16:31:10+00:00</updated>
    <category scheme="http://schema.org/audience" term="Adult" label="Adult"/>
    <author>
        <name>Homer</name>
        <link href="http://localhost:8080/minotaur-test-library/works/contributor/Homer/eng/Adult,Adults+Only,All+Ages,Children,Young+Adult" rel="contributor" type="application/atom+xml;profile=opds-catalog;kind=acquisition" title="Homer"/>
    </author>
    <link href="https://palace-bookshelf-downloads.dp.la/assets/0d970df7-275e-45ee-a90e-884f1a93beef?fit=inside&amp;width=10000&amp;height=560" rel="http://opds-spec.org/image" type="image/png"/>
    <link href="https://palace-bookshelf-downloads.dp.la/0d970df7-275e-45ee-a90e-884f1a93beef.jpeg" rel="http://opds-spec.org/image/thumbnail" type="image/jpeg"/>
    <link href="http://localhost:8080/minotaur-test-library/works/URI/urn:uuid:1cca9468-c447-4303-bc5a-c57470b85cb1/borrow" rel="http://opds-spec.org/acquisition/borrow" type="application/atom+xml;type=entry;profile=opds-catalog">
        <opds:indirectAcquisition type="application/epub+zip"/>
        <opds:availability status="available"/>
    </link>
    <link href="http://localhost:8080/minotaur-test-library/works/URI/urn:uuid:1cca9468-c447-4303-bc5a-c57470b85cb1" rel="alternate" type="application/atom+xml;type=entry;profile=opds-catalog"/>
    <link href="http://localhost:8080/minotaur-test-library/works/URI/urn:uuid:1cca9468-c447-4303-bc5a-c57470b85cb1/related_books" rel="related" type="application/atom+xml;profile=opds-catalog;kind=acquisition" title="Recommended Works"/>
    <link href="http://localhost:8080/minotaur-test-library/annotations/URI/urn:uuid:1cca9468-c447-4303-bc5a-c57470b85cb1" rel="http://www.w3.org/ns/oa#annotationService" type="application/ld+json; profile=&quot;http://www.w3.org/ns/anno.jsonld&quot;"/>
    <link href="http://localhost:8080/minotaur-test-library/analytics/URI/urn:uuid:1cca9468-c447-4303-bc5a-c57470b85cb1/open_book" rel="http://librarysimplified.org/terms/rel/analytics/open-book"/>
    <link href="http://localhost:8080/minotaur-test-library/admin/works/URI/urn:uuid:1cca9468-c447-4303-bc5a-c57470b85cb1/suppression" rel="http://palaceproject.io/terms/rel/suppress-for-library"/>
    <link href="http://localhost:8080/admin/works/URI/urn:uuid:1cca9468-c447-4303-bc5a-c57470b85cb1/edit" rel="edit"/>
</entry>
`;
const SAMPLE_BOOK_DATA_BROKEN_XML = `BROKEN ${SAMPLE_BOOK_ADMIN_DETAIL}`;
const FETCH_OPDS_PARSE_ERROR_MESSAGE = "Failed to parse OPDS data";

describe("Redux bookEditorSlice...", () => {
  const bookData = { id: "urn:something:something", title: "test title" };

  describe("reducers...", () => {
    it("should return the initial state from undefined, if no action is passed", () => {
      expect(reducer(undefined, { type: "unknown" })).to.deep.equal(
        initialState
      );
    });
    it("should return the initial state from initialState, if no action is passed", () => {
      expect(reducer(initialState, { type: "unknown" })).to.deep.equal(
        initialState
      );
    });
    it("should handle getBookData.pending", () => {
      const action = {
        type: getBookData.pending.type,
        meta: { arg: { url: "https://example.com/book" } },
      };
      const previousState = { ...initialState, url: null, isFetching: false };
      const state = reducer(previousState, action);

      expect(state.url).to.equal("https://example.com/book");
      expect(state.data).to.be.null;
      expect(state.isFetching).to.equal(true);
      expect(state.fetchError).to.be.null;
      expect(state.editError).to.be.null;
    });
    it("should handle getBookData.fulfilled", () => {
      const action = {
        type: getBookData.fulfilled.type,
        meta: { arg: { url: "https://example.com/book" } },
        payload: bookData,
      };
      const previousState = {
        ...initialState,
        url: null,
        data: null,
        isFetching: true,
      };
      const state = reducer(previousState, action);

      expect(state.url).to.equal("https://example.com/book");
      expect(state.data).to.deep.equal(bookData);
      expect(state.isFetching).to.equal(false);
      expect(state.fetchError).to.be.null;
      expect(state.editError).to.be.null;
    });
    it("should handle getBookData.rejected", () => {
      const errorObject = { error: "some error object" };
      const action = {
        type: getBookData.rejected.type,
        meta: { arg: { url: "https://example.com/book" } },
        payload: errorObject,
      };
      const previousState = {
        ...initialState,
        url: null,
        data: null,
        isFetching: true,
      };
      const state = reducer(previousState, action);

      expect(state.url).to.equal("https://example.com/book");
      expect(state.data).to.be.null;
      expect(state.isFetching).to.equal(false);
      expect(state.fetchError).to.deep.equal(errorObject);
      expect(state.editError).to.be.null;
    });
  });

  describe("thunks...", () => {
    describe("getBookData...", () => {
      const goodBookUrl = "https://example.com/book";
      const brokenBookUrl = "https://example.com/broken-book";
      const errorBookUrl = "https://example.com/error-book";

      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue({
        bookEditor: initialState,
      });

      beforeAll(() => {
        fetchMock
          .get(goodBookUrl, { body: SAMPLE_BOOK_ADMIN_DETAIL, status: 200 })
          .get(brokenBookUrl, {
            body: SAMPLE_BOOK_DATA_BROKEN_XML,
            status: 200,
          })
          .get(errorBookUrl, { body: "Internal server error", status: 400 });
      });

      afterEach(() => {
        fetchMock.resetHistory();
        dispatch.mockClear();
      });
      afterAll(() => fetchMock.restore());

      it("should return the book data on the happy path", async () => {
        const action = getBookData({ url: goodBookUrl });

        const result = await action(dispatch, getState, undefined);
        const dispatchCalls = dispatch.mock.calls;

        const payload = result.payload as BookData;
        expect(payload.id).to.equal(
          "urn:uuid:1cca9468-c447-4303-bc5a-c57470b85cb1"
        );
        expect(payload.title).to.equal(
          "Tea-Cup Reading and Fortune-Telling by Tea Leaves"
        );

        expect(dispatchCalls.length).to.equal(2);
        expect(dispatchCalls[0][0].type).to.equal(getBookData.pending.type);
        expect(dispatchCalls[0][0].payload).to.equal(undefined);
        expect(dispatchCalls[0][0].meta.arg).to.deep.equal({
          url: goodBookUrl,
        });
        expect(dispatchCalls[1][0].type).to.equal(getBookData.fulfilled.type);
        expect(dispatchCalls[1][0].payload).to.deep.equal(payload);
        expect(dispatchCalls[1][0].meta.arg).to.deep.equal({
          url: goodBookUrl,
        });
      });
      it("should return an error, if the data is malformed", async () => {
        const action = getBookData({ url: brokenBookUrl });

        const result = await action(dispatch, getState, undefined);
        const dispatchCalls = dispatch.mock.calls;

        const payload = result.payload as RequestError;
        expect(payload.response).to.equal(FETCH_OPDS_PARSE_ERROR_MESSAGE);
        expect(payload.url).to.equal(brokenBookUrl);

        expect(dispatchCalls.length).to.equal(2);
        expect(dispatchCalls[0][0].type).to.equal(getBookData.pending.type);
        expect(dispatchCalls[0][0].payload).to.equal(undefined);
        expect(dispatchCalls[0][0].meta.arg).to.deep.equal({
          url: brokenBookUrl,
        });
        expect(dispatchCalls[1][0].type).to.equal(getBookData.rejected.type);
        expect(dispatchCalls[1][0].payload).to.deep.equal(payload);
        expect(dispatchCalls[1][0].meta.arg).to.deep.equal({
          url: brokenBookUrl,
        });
      });
      it("should return an error, if the HTTP request fails", async () => {
        const action = getBookData({ url: errorBookUrl });

        const result = await action(dispatch, getState, undefined);
        const dispatchCalls = dispatch.mock.calls;

        const payload = result.payload as RequestError;

        expect(result.type).to.equal(getBookData.rejected.type);
        expect(result.meta.arg).to.deep.equal({ url: errorBookUrl });
        expect(payload.response).to.equal("Internal server error");
        expect(payload.url).to.equal(errorBookUrl);

        expect(dispatchCalls.length).to.equal(2);
        expect(dispatchCalls[0][0].type).to.equal(getBookData.pending.type);
        expect(dispatchCalls[0][0].payload).to.equal(undefined);
        expect(dispatchCalls[0][0].meta.arg).to.deep.equal({
          url: errorBookUrl,
        });
        expect(dispatchCalls[1][0].type).to.equal(getBookData.rejected.type);
        expect(dispatchCalls[1][0].payload).to.deep.equal(payload);
        expect(dispatchCalls[1][0].meta.arg).to.deep.equal({
          url: errorBookUrl,
        });
      });
    });

    describe("submitBookData...", () => {
      const goodBookUrl = "https://example.com/book";
      const editBookUrl = `${goodBookUrl}/edit`;
      const brokenBookUrl = "https://example.com/broken-book";
      const errorBookUrl = "https://example.com/error-book";
      const csrfTokenHeader = "X-CSRF-Token";
      const validCsrfToken = "valid-csrf-token";

      const badCsrfTokenResponseBody = {
        type: "http://librarysimplified.org/terms/problem/invalid-csrf-token",
        title: "Invalid CSRF token",
        status: 400,
        detail: "There was an error saving your changes.",
      };

      //   it("handles EDIT_BOOK_REQUEST", () => {
      //     const action = { type: ActionCreator.EDIT_BOOK_REQUEST };
      //     const newState = Object.assign({}, fetchedState, {
      //       isFetching: true,
      //     });
      //     expect(book(fetchedState, action)).to.deep.equal(newState);
      //   });

      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue({
        bookEditor: initialState,
      });

      beforeAll(() => {
        fetchMock
          .post(
            {
              name: "valid-csrf-token-post",
              url: editBookUrl,
              headers: { [csrfTokenHeader]: validCsrfToken },
            },
            { body: "Success!", status: 201 }
          )
          .post(
            { name: "invalid-csrf-token-post", url: editBookUrl },
            { body: badCsrfTokenResponseBody, status: 400 }
          )
          .get(goodBookUrl, { body: SAMPLE_BOOK_ADMIN_DETAIL, status: 200 });
      });

      afterEach(() => {
        fetchMock.resetHistory();
        dispatch.mockClear();
      });

      afterEach(fetchMock.resetHistory);
      afterAll(() => fetchMock.restore());

      it("should post the book data on the happy path", async () => {
        const csrfToken = validCsrfToken;
        const formData = new FormData();
        formData.append("id", "urn:something:something");
        formData.append("title", "title");

        const action = submitBookData({
          url: editBookUrl,
          data: formData,
          csrfToken,
        });

        const result = await action(dispatch, getState, undefined);
        const dispatchCalls = dispatch.mock.calls;
        const fetchCalls = fetchMock.calls();

        expect(fetchCalls.length).to.equal(1);
        expect(fetchCalls[0].identifier).to.equal("valid-csrf-token-post");
        expect(
          (fetchCalls[0][1].headers as Headers).get(csrfTokenHeader)
        ).to.equal(validCsrfToken);

        expect(fetchCalls[0][0]).to.equal(editBookUrl);
        expect(fetchCalls[0][1].method).to.equal("POST");
        expect(fetchCalls[0][1].body).to.equal(formData);

        expect(dispatchCalls.length).to.equal(3);
        expect(dispatchCalls[0][0].type).to.equal(submitBookData.pending.type);
        expect(dispatchCalls[0][0].payload).to.equal(undefined);
        // On a successful update, the second dispatch is to re-fetch the updated book data.
        // The third dispatch is for the fulfilled action.
        expect(dispatchCalls[2][0].type).to.equal(
          submitBookData.fulfilled.type
        );
        expect(dispatchCalls[2][0].payload.body.toString()).to.equal(
          "Success!"
        );
      });
      it("should fail, if the user is unauthorized", async () => {
        const csrfToken = "invalid-token";
        const formData = new FormData();
        formData.append("id", "urn:something:something");
        formData.append("title", "title");

        const action = submitBookData({
          url: editBookUrl,
          data: formData,
          csrfToken,
        });

        const result = await action(dispatch, getState, undefined);
        const dispatchCalls = dispatch.mock.calls;
        const fetchCalls = fetchMock.calls();

        expect(fetchCalls.length).to.equal(1);
        expect(fetchCalls[0].identifier).to.equal("invalid-csrf-token-post");
        expect(
          (fetchCalls[0][1].headers as Headers).get(csrfTokenHeader)
        ).not.to.equal(validCsrfToken);

        expect(fetchCalls[0][0]).to.equal(editBookUrl);
        expect(fetchCalls[0][1].method).to.equal("POST");
        expect(fetchCalls[0][1].body).to.equal(formData);

        expect(dispatchCalls.length).to.equal(2);
        expect(dispatchCalls[0][0].type).to.equal(submitBookData.pending.type);
        expect(dispatchCalls[0][0].payload).to.equal(undefined);
        // There is no re-fetch on a failed request, ...
        // ...so the second dispatch is for the rejected action.
        expect(dispatchCalls[1][0].type).to.equal(submitBookData.rejected.type);
        expect(dispatchCalls[1][0].payload.status).to.equal(400);
        expect(dispatchCalls[1][0].payload.response).to.equal(
          "There was an error saving your changes."
        );
      });
    });
  });
});
