import * as React from "react";
import { Draggable } from "react-beautiful-dnd";
import { BookData } from "opds-web-client/lib/interfaces";
import GrabIcon from "./icons/GrabIcon";
import TrashIcon from "./icons/TrashIcon";
import AddIcon from "./icons/AddIcon";
import CatalogLink from "./CatalogLink";
import { Button } from "library-simplified-reusable-components";
import { getMedium, getMediumSVG } from "opds-web-client/lib/utils/book";

export interface Entry extends BookData {
  medium?: string;
}

export interface CustomListBookCardProps {
  index: number;
  typeOfCard: "searchResult" | "entry";
  opdsFeedUrl?: string;
  book: any;
  handleAddEntry?: (id: string) => void;
  handleDeleteEntry?: (id: string) => void;
}

export default function CustomListBookCard({
  index,
  typeOfCard,
  book,
  handleAddEntry,
  handleDeleteEntry,
}: CustomListBookCardProps) {
  const isSearchResult = typeOfCard === "searchResult";

  return (
    <Draggable key={book.id} draggableId={String(book.id)} index={index}>
      {(provided, snapshot) => {
        return (
          <li>
            <div
              className={`${
                isSearchResult ? "search-result" : "custom-list-entry"
              } ${snapshot.isDragging && " dragging"}`}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <GrabIcon />
              <div>
                <div className="title">{book.title}</div>
                <div className="authors">{book.authors.join(", ")}</div>
              </div>
              {getMediumSVG(getMedium(book))}
              <div className="links">
                {book.url && (
                  <CatalogLink
                    url={book.url}
                    title={book.title}
                    label="View Details"
                  />
                )}
                {isSearchResult ? (
                  <Button
                    callback={() => handleAddEntry(book.id)}
                    className="right-align"
                    content={
                      <span>
                        Add to list
                        <AddIcon />
                      </span>
                    }
                  />
                ) : (
                  <Button
                    className="small right-align"
                    callback={() => handleDeleteEntry(book.id)}
                    content={
                      <span>
                        Remove from list
                        <TrashIcon />
                      </span>
                    }
                  />
                )}
              </div>
            </div>
          </li>
        );
      }}
    </Draggable>
  );
}
