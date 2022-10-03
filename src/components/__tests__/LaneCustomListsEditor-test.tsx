import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { Droppable, Draggable } from "react-beautiful-dnd";
import LaneCustomListsEditor from "../LaneCustomListsEditor";
import ShareIcon from "../icons/ShareIcon";

describe("LaneCustomListsEditor", () => {
  let wrapper;
  let onUpdate;

  const allCustomListsData = [
    { id: 1, name: "list 1", entry_count: 0, is_owner: true, is_shared: false },
    { id: 2, name: "list 2", entry_count: 2, is_owner: true, is_shared: false },
    { id: 3, name: "list 3", entry_count: 0, is_owner: true, is_shared: false },
  ];

  beforeEach(() => {
    onUpdate = stub();
  });

  it("renders available lists", () => {
    const filteredCustomListsData = [
      allCustomListsData[0],
      allCustomListsData[2],
    ];

    let wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[]}
        filter="owned"
        filteredCustomLists={filteredCustomListsData}
      />
    );
    let container = wrapper.find(".available-lists");
    expect(container.length).to.equal(1);

    let droppable = container.find(Droppable);
    expect(droppable.length).to.equal(1);

    let lists = droppable.find(Draggable);
    expect(lists.length).to.equal(2);

    expect(lists.at(0).text()).to.contain("list 1");
    expect(lists.at(0).text()).to.contain("Items in list: 0");
    expect(lists.at(1).text()).to.contain("list 3");
    expect(lists.at(1).text()).to.contain("Items in list: 0");

    wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1]}
        filter="owned"
        filteredCustomLists={filteredCustomListsData}
      />
    );

    container = wrapper.find(".available-lists");
    expect(container.length).to.equal(1);

    droppable = container.find(Droppable);
    expect(droppable.length).to.equal(1);

    lists = droppable.find(Draggable);
    expect(lists.length).to.equal(1);

    expect(lists.at(0).text()).to.contain("list 3");
    expect(lists.at(0).text()).to.contain("Items in list: 0");
  });

  it("renders a share icon on available lists that are not owned by the current library", () => {
    const sharedCustomListsData = [
      ...allCustomListsData,
      {
        id: 4,
        name: "list 4",
        entry_count: 0,
        is_owner: false,
        is_shared: true,
      },
    ];

    const wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={sharedCustomListsData}
        customListIds={[]}
        filter=""
        filteredCustomLists={sharedCustomListsData}
      />
    );

    const lists = wrapper.find(".available-lists").find(Draggable);

    expect(lists.length).to.equal(4);

    expect(lists.at(0).find(ShareIcon).length).to.equal(0);
    expect(lists.at(1).find(ShareIcon).length).to.equal(0);
    expect(lists.at(2).find(ShareIcon).length).to.equal(0);
    expect(lists.at(3).find(ShareIcon).length).to.equal(1);
  });

  it("renders filter select", () => {
    const changeFilter = stub();

    const wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[]}
        filter="owned"
        filteredCustomLists={allCustomListsData}
        changeFilter={changeFilter}
      />
    );

    const select = wrapper.find('select[name="filter"]');

    expect(select.prop("value")).to.equal("owned");

    const options = select.find("option");

    expect(options.length).to.equal(3);

    expect(options.at(0).prop("value")).to.equal("");
    expect(options.at(1).prop("value")).to.equal("owned");
    expect(options.at(2).prop("value")).to.equal("shared-in");

    select.getDOMNode().value = "shared-in";
    select.simulate("change");

    expect(changeFilter.callCount).to.equal(1);
    expect(changeFilter.args[0]).to.deep.equal(["shared-in"]);
  });

  it("renders current lists", () => {
    let wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[]}
        filter=""
        filteredCustomLists={allCustomListsData}
      />
    );
    let container = wrapper.find(".current-lists");
    expect(container.length).to.equal(1);

    let droppable = container.find(Droppable);
    expect(droppable.length).to.equal(1);

    let lists = droppable.find(Draggable);
    expect(lists.length).to.equal(0);

    wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[2, 3]}
        filter=""
        filteredCustomLists={allCustomListsData}
      />
    );

    container = wrapper.find(".current-lists");
    expect(container.length).to.equal(1);

    droppable = container.find(Droppable);
    expect(droppable.length).to.equal(1);

    lists = droppable.find(Draggable);
    expect(lists.length).to.equal(2);

    expect(lists.at(0).text()).to.contain("list 2");
    expect(lists.at(0).text()).to.contain("Items in list: 2");
    expect(lists.at(1).text()).to.contain("list 3");
    expect(lists.at(1).text()).to.contain("Items in list: 0");
  });

  it("renders a share icon on current lists that are not owned by the current library", () => {
    const sharedCustomListsData = [
      ...allCustomListsData,
      {
        id: 4,
        name: "list 4",
        entry_count: 0,
        is_owner: false,
        is_shared: true,
      },
    ];

    const wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={sharedCustomListsData}
        customListIds={[3, 4]}
        filter=""
        filteredCustomLists={sharedCustomListsData}
      />
    );

    const lists = wrapper.find(".current-lists").find(Draggable);

    expect(lists.length).to.equal(2);

    expect(lists.at(0).find(ShareIcon).length).to.equal(0);
    expect(lists.at(1).find(ShareIcon).length).to.equal(1);
  });

  it("prevents dragging within available lists", () => {
    const wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[]}
        filter=""
        filteredCustomLists={allCustomListsData}
      />
    );

    // simulate starting a drag from available lists
    (wrapper.instance() as LaneCustomListsEditor).onDragStart({
      draggableId: 1,
      source: {
        droppableId: "available-lists",
      },
    });

    const container = wrapper.find(".available-lists");
    const droppable = container.find(Droppable);
    expect(droppable.prop("isDropDisabled")).to.equal(true);
  });

  it("prevents dragging within current lists", () => {
    const wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1, 2]}
        filter=""
        filteredCustomLists={allCustomListsData}
      />
    );

    // simulate starting a drag from current lists
    (wrapper.instance() as LaneCustomListsEditor).onDragStart({
      draggableId: 1,
      source: {
        droppableId: "current-lists",
      },
    });

    const container = wrapper.find(".current-lists");
    const droppable = container.find(Droppable);
    expect(droppable.prop("isDropDisabled")).to.equal(true);
  });

  it("drags from available lists to current lists", () => {
    const wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1]}
        filter=""
        filteredCustomLists={allCustomListsData}
        onUpdate={onUpdate}
      />
    );

    // simulate starting a drag from available lists
    (wrapper.instance() as LaneCustomListsEditor).onDragStart({
      draggableId: 2,
      source: {
        droppableId: "available-lists",
      },
    });
    wrapper.update();

    let currentContainer = wrapper.find(".current-lists");
    let droppable = currentContainer.find(Droppable);
    expect(droppable.prop("isDropDisabled")).to.equal(false);

    // simulate dropping on the current lists
    (wrapper.instance() as LaneCustomListsEditor).onDragEnd({
      draggableId: 2,
      source: {
        droppableId: "available-lists",
      },
      destination: {
        droppableId: "current-lists",
      },
    });
    wrapper.update();

    currentContainer = wrapper.find(".current-lists");
    droppable = currentContainer.find(Droppable);
    // The dropped item has been added to the current lists.
    const lists = droppable.find(Draggable);
    expect(lists.length).to.equal(2);
    expect(lists.at(0).text()).to.contain("list 1");
    expect(lists.at(1).text()).to.contain("list 2");
    expect(onUpdate.callCount).to.equal(1);
    expect(onUpdate.args[0][0]).to.deep.equal([1, 2]);
  });

  it("shows message in place of available lists when dragging from current lists", () => {
    const wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1]}
        filter=""
        filteredCustomLists={allCustomListsData}
      />
    );

    // simulate starting a drag from current lists
    (wrapper.instance() as LaneCustomListsEditor).onDragStart({
      draggableId: 1,
      source: {
        droppableId: "current-lists",
      },
    });
    wrapper.update();

    let availableContainer = wrapper.find(".available-lists");
    let droppable = availableContainer.find(Droppable);
    let message = droppable.find("p");
    expect(droppable.prop("isDropDisabled")).to.equal(false);
    expect(message.length).to.equal(1);
    expect(message.text()).to.contain("here to remove");

    // if you drop anywhere on the page, the mssage goes away.
    // simulate dropping outside a droppable (no destination)
    (wrapper.instance() as LaneCustomListsEditor).onDragEnd({
      draggableId: 1,
      source: {
        droppableId: "current-lists",
      },
    });
    wrapper.update();

    availableContainer = wrapper.find(".available-lists");
    droppable = availableContainer.find(Droppable);
    message = droppable.find("p");
    expect(droppable.prop("isDropDisabled")).to.equal(true);
    expect(message.length).to.equal(0);
  });

  it("drags from current lists to available lists", () => {
    const wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1, 2]}
        filter=""
        filteredCustomLists={allCustomListsData}
        onUpdate={onUpdate}
      />
    );

    // simulate starting a drag from current lists
    (wrapper.instance() as LaneCustomListsEditor).onDragStart({
      draggableId: 1,
      source: {
        droppableId: "current-lists",
      },
    });
    wrapper.update();

    const availableContainer = wrapper.find(".available-lists");
    let droppable = availableContainer.find(Droppable);
    expect(droppable.prop("isDropDisabled")).to.equal(false);

    // simulate dropping on the available lists
    (wrapper.instance() as LaneCustomListsEditor).onDragEnd({
      draggableId: 1,
      source: {
        droppableId: "current-lists",
      },
      destination: {
        droppableId: "available-lists",
      },
    });
    wrapper.update();
    wrapper.setProps({ customListIds: onUpdate.args[0][0] });

    // the dropped item has been removed from the current lists
    const currentContainer = wrapper.find(".current-lists");
    droppable = currentContainer.find(Droppable);
    const lists = droppable.find(Draggable);

    expect(lists.length).to.equal(1);
    expect(lists.at(0).text()).to.contain("list 2");
    expect(onUpdate.callCount).to.equal(1);
    expect(onUpdate.args[0][0]).to.deep.equal([2]);
  });

  it("adds a list to the lane", () => {
    const wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[2]}
        filter=""
        filteredCustomLists={allCustomListsData}
        onUpdate={onUpdate}
      />
    );

    const addLink = wrapper.find(".available-lists .links button");
    addLink.at(0).simulate("click");

    // the item has been added to the current lists
    const currentContainer = wrapper.find(".current-lists");
    const droppable = currentContainer.find(Droppable);
    const lists = droppable.find(Draggable);
    expect(lists.length).to.equal(2);
    expect(lists.at(0).text()).to.contain("list 1");
    expect(onUpdate.callCount).to.equal(1);
    expect(onUpdate.args[0][0]).to.contain(1);
    expect(onUpdate.args[0][0]).to.contain(2);
  });

  it("removes a list from the lane", () => {
    const wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1, 2]}
        filter=""
        filteredCustomLists={allCustomListsData}
        onUpdate={onUpdate}
      />
    );

    const deleteLink = wrapper.find(".current-lists .links button");
    deleteLink.at(0).simulate("click");
    wrapper.setProps({ customListIds: onUpdate.args[0][0] });
    // this list has been removed from the current lists
    const currentContainer = wrapper.find(".current-lists");
    const droppable = currentContainer.find(Droppable);
    const lists = droppable.find(Draggable);
    expect(lists.length).to.equal(1);
    expect(lists.at(0).text()).to.contain("list 2");
    expect(onUpdate.callCount).to.equal(1);
    expect(onUpdate.args[0][0]).to.deep.equal([2]);
  });

  it("resets", () => {
    const wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1]}
        filter=""
        filteredCustomLists={allCustomListsData}
        onUpdate={onUpdate}
      />
    );

    // simulate dropping a list on the current lists
    (wrapper.instance() as LaneCustomListsEditor).onDragEnd({
      draggableId: 2,
      source: {
        droppableId: "available-lists",
      },
      destination: {
        droppableId: "current-lists",
      },
    });

    // Set customListIds to the new array of list IDs for this lane ([1, 2]), which got passed to
    // onUpdate when we added list 2 to the current lists
    wrapper.setProps({ customListIds: onUpdate.args[0][0] });
    expect(
      (wrapper.instance() as LaneCustomListsEditor).getCustomListIds().length
    ).to.equal(2);
    expect(onUpdate.callCount).to.equal(1);
    (wrapper.instance() as LaneCustomListsEditor).reset([1]);
    // Calling reset passes the original array of list IDs ([1]) to onUpdate
    wrapper.setProps({ customListIds: onUpdate.args[1][0] });
    expect(
      (wrapper.instance() as LaneCustomListsEditor).getCustomListIds().length
    ).to.equal(1);
    expect(onUpdate.callCount).to.equal(2);

    // simulate dropping a list on the available lists
    (wrapper.instance() as LaneCustomListsEditor).onDragEnd({
      draggableId: 1,
      source: {
        droppableId: "current-lists",
      },
      destination: {
        droppableId: "available-lists",
      },
    });

    // Set customListIds to the new array of list IDs for this lane ([]), which got passed to
    // onUpdate when we removed list 1 from the current lists
    wrapper.setProps({ customListIds: onUpdate.args[2][0] });
    expect(
      (wrapper.instance() as LaneCustomListsEditor).getCustomListIds().length
    ).to.equal(0);
    expect(onUpdate.callCount).to.equal(3);
    (wrapper.instance() as LaneCustomListsEditor).reset([1]);
    // Calling reset passes the original array of list IDs ([1]) to onUpdate
    wrapper.setProps({ customListIds: onUpdate.args[3][0] });
    expect(
      (wrapper.instance() as LaneCustomListsEditor).getCustomListIds().length
    ).to.equal(1);
    expect(onUpdate.callCount).to.equal(4);
  });
});
