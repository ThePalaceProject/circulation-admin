import { BookData } from "./interfaces";
import { OPDSEntry } from "opds-feed-parser";

export default function adapter(data: OPDSEntry): BookData {
  let hideLink = data.links.find(link => {
    return link.rel === "http://librarysimplified.org/terms/rel/hide";
  });

  let restoreLink = data.links.find(link => {
    return link.rel === "http://librarysimplified.org/terms/rel/restore";
  });

  let refreshLink = data.links.find(link => {
    return link.rel === "http://librarysimplified.org/terms/rel/refresh";
  });

  let editLink = data.links.find(link => {
    return link.rel === "edit";
  });

  let issuesLink = data.links.find(link => {
    return link.rel === "issues";
  });

  let audience = data.categories.find(category => {
    return category.scheme === "http://schema.org/audience";
  });

  let targetAgeCategory = data.categories.find(category => {
    return category.scheme === "http://schema.org/typicalAgeRange";
  });
  let targetAgeRange = [];
  if (targetAgeCategory && /\d\d?-?\d?\d?/.test(targetAgeCategory.term)) {
    targetAgeRange = targetAgeCategory.term.split("-");
  }

  let fictionCategory = data.categories.find(category => {
    return category.scheme === "http://librarysimplified.org/terms/fiction/";
  });
  let fiction;
  if (fictionCategory) {
    fiction = (fictionCategory.label === "Fiction");
  }

  return {
    title: data.title,
    summary: data.summary.content,
    audience: audience.term,
    targetAgeRange: targetAgeRange,
    fiction: fiction,
    hideLink: hideLink,
    restoreLink: restoreLink,
    refreshLink: refreshLink,
    editLink: editLink,
    issuesLink: issuesLink
  };
}
