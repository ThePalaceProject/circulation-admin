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

  let categories = data.categories.map(category => category.label);

  let subtitle;
  try {
    subtitle = data.unparsed["schema:alternativeHeadline"][0]["_"];
  } catch (e) {
    subtitle = null;
  };

  let series;
  try {
    series = data.unparsed["schema:Series"][0]["$"]["name"]["value"];
  } catch (e) {
    series = null;
  }

  let seriesPosition;
  try {
    seriesPosition = data.unparsed["schema:Series"][0]["$"]["schema:position"]["value"];
  } catch (e) {
    seriesPosition = null;
  }

  return {
    title: data.title,
    subtitle: subtitle,
    summary: data.summary.content,
    audience: audience.term,
    targetAgeRange: targetAgeRange,
    fiction: fiction,
    categories: categories,
    hideLink: hideLink,
    restoreLink: restoreLink,
    refreshLink: refreshLink,
    editLink: editLink,
    issuesLink: issuesLink,
    series: series,
    seriesPosition: seriesPosition
  };
}
