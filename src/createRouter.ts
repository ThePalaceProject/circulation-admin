import { Navigate } from "./interfaces";
import { Router, Location } from "opds-browser/lib/interfaces";

function getParam(location, name) {
  let match = RegExp("[?&]" + name + "=([^&]*)").exec(location);
  return match && decodeURIComponent(match[1].replace(/\+/g, " "));
};

export default (navigate: Navigate) => {
  return {
    push: (location: string|Location) => {
      let locationStr: string, isTopLevel: boolean;

      if (typeof location === "string") {
         locationStr = location;
         isTopLevel = false;
      } else {
        locationStr = location.pathname;
        isTopLevel = location.state && location.state.isTopLevel;
      }

      let collection = getParam(locationStr, "collection");
      let book = getParam(locationStr, "book");

      navigate(collection, book, isTopLevel);
    },

    createHref: (location: string|Location) => {
      return typeof location === "string" ? location : location.pathname;
    },

    isActive: (location: string|Location, onlyActiveOnIndex: boolean = false) => {
      return false;
    }
  };
}