import { LinkData } from "opds-browser/lib/interfaces";
import { DataForBreadcrumbs } from "opds-browser/lib/components/Breadcrumbs";

export default (data: DataForBreadcrumbs): LinkData[] => {
  let { history, hierarchy, collection } = data;
  let links = [];

  if (collection &&
      collection.raw &&
      collection.raw["simplified:breadcrumbs"] &&
      collection.raw["simplified:breadcrumbs"][0] &&
      collection.raw["simplified:breadcrumbs"][0].link
    ) {
    let rawLinks = collection.raw["simplified:breadcrumbs"][0].link;
    links = rawLinks.map(link => {
      return {
        url: link["$"].href.value,
        text: link["$"].title.value
      };
    });
  } else {
    links = hierarchy.slice(0);
  }

  if (collection) {
    links.push({
      url: collection.url,
      text: collection.title
    });
  }

  return links;
};