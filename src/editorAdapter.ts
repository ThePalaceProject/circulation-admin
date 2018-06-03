import { BookData } from "./interfaces";
import { OPDSEntry } from "opds-feed-parser";

/** Extract metadata and links from an OPDS entry for use on the
    book details page. */
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

  let changeCoverLink = data.links.find(link => {
    return link.rel === "http://librarysimplified.org/terms/rel/change_cover";
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

  let medium;
  try {
    medium = data.unparsed["$"]["schema:additionalType"]["value"];
  } catch (e) {
    medium = null;
  }

  let imprint;
  try {
    imprint = data.unparsed["bib:publisherImprint"][0]["_"];
  } catch (e) {
    imprint = null;
  }

  let authors = [];
  for (let author of data.authors) {
    authors.push(Object.assign({}, author, { role: "aut" }));
  }

  let rating;
  try {
    let ratings = data.unparsed["schema:Rating"];
    for (let ratingTag of ratings) {
      if (ratingTag["$"]["schema:additionalType"]["value"] === "http://schema.org/ratingValue") {
        rating = ratingTag["$"]["schema:ratingValue"]["value"];
        break;
      }
    }
  } catch (e) {
    rating = null;
  }

  let imageLink = data.links.find(link => {
    return link.rel === "http://opds-spec.org/image";
  });
  let coverUrl;
  if (imageLink) {
    coverUrl = imageLink.href;
  }

  return {
    id: data.id,
    title: data.title,
    authors: authors,
    contributors: data.contributors,
    subtitle: subtitle,
    summary: data.summary.content,
    audience: audience && audience.term,
    targetAgeRange: targetAgeRange,
    fiction: fiction,
    categories: categories,
    hideLink: hideLink,
    restoreLink: restoreLink,
    refreshLink: refreshLink,
    editLink: editLink,
    issuesLink: issuesLink,
    changeCoverLink: changeCoverLink,
    series: data.series && data.series.name,
    seriesPosition: data.series && data.series.position,
    medium: medium,
    language: data.language,
    publisher: data.publisher,
    imprint: imprint,
    issued: data.issued,
    rating: rating,
    coverUrl: coverUrl
  };
}
