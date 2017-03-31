import { expect } from "chai";

import reducer, { CirculationEventsState } from "../circulationEvents";
import { CirculationEventData } from "../../interfaces";
import ActionCreator from "../../actions";

describe("circulation events reducer", () => {
  let eventsData: CirculationEventData[] = [
    {
      id: 1,
      type: "check_in",
      patron_id: "patron id",
      time: "Wed, 01 Jun 2016 16:49:17 GMT",
      book: {
        title: "book 1 title",
        url: "book 1 url"
      }
    },
    {
      id: 2,
      type: "check_out",
      patron_id: null,
      time: "Wed, 01 Jun 2016 12:00:00 GMT",
      book: {
        title: "book 2 title",
        url: "book 2 url"
      }
    },
  ];

  let initState: CirculationEventsState = {
    data: null,
    isFetching: false,
    fetchError: null,
    isLoaded: false
  };

  let errorState: CirculationEventsState = {
    data: null,
    isFetching: false,
    fetchError: { status: 401, response: "test error", url: "test url" },
    isLoaded: true
  };

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
  });

  it("handles CIRCULATION_EVENTS_REQUEST", () => {
    let action = { type: ActionCreator.CIRCULATION_EVENTS_REQUEST, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetching: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles CIRCULATION_EVENTS_FAILURE", () => {
    let action = { type: ActionCreator.CIRCULATION_EVENTS_FAILURE, error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles CIRCULATION_EVENTS_LOAD", () => {
    let action = { type: ActionCreator.CIRCULATION_EVENTS_LOAD, data: { circulation_events: eventsData } };
    let newState = Object.assign({}, initState, {
      data: eventsData,
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });
});