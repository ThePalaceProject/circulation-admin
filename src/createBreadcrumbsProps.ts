import { BreadcrumbsProps, DataForBreadcrumbsProps } from "opds-browser/lib/components/Breadcrumbs";

export default (data: DataForBreadcrumbsProps): BreadcrumbsProps => {
  let { history, hierarchy, collection, book } = data;
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
  }

  if (collection) {
    links.push({
      url: collection.url,
      text: collection.title
    });
  }

  console.log(links);

  return {
    links: links,
    linkToCurrent: !!book
  };
};