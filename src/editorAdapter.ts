import { BookData, LinkData } from "./interfaces";
import { OPDSEntry, OPDSLink } from "opds-feed-parser";
import {
  PER_LIBRARY_SUPPRESS_REL,
  PER_LIBRARY_UNSUPPRESS_REL,
} from "./features/book/bookEditorSlice";

const VISIBILITY_STATUS_SCHEME =
  "http://palaceproject.io/terms/visibility-status";

/** Convert an OPDS link to a LinkData object. */
const opdsLinkToLinkData = (link: OPDSLink | undefined): LinkData => {
  if (!link) {
    return link;
  }
  const {
    href,
    rel,
    role = undefined,
    title = undefined,
    type = undefined,
  } = link;
  return { href, rel, title, type, role };
};

/** Extract metadata and links from an OPDS entry for use on the
    book details page. */
export default function adapter(data: OPDSEntry): BookData {
  const hideLink = data.links.find((link) => {
    return link.rel === "http://librarysimplified.org/terms/rel/hide";
  });

  const restoreLink = data.links.find((link) => {
    return link.rel === "http://librarysimplified.org/terms/rel/restore";
  });

  const suppressPerLibraryLink = data.links.find((link) => {
    return link.rel === PER_LIBRARY_SUPPRESS_REL;
  });

  const unsuppressPerLibraryLink = data.links.find((link) => {
    return link.rel === PER_LIBRARY_UNSUPPRESS_REL;
  });

  const refreshLink = data.links.find((link) => {
    return link.rel === "http://librarysimplified.org/terms/rel/refresh";
  });

  const editLink = data.links.find((link) => {
    return link.rel === "edit";
  });

  const issuesLink = data.links.find((link) => {
    return link.rel === "issues";
  });

  const changeCoverLink = data.links.find((link) => {
    return link.rel === "http://librarysimplified.org/terms/rel/change_cover";
  });

  const audience = data.categories.find((category) => {
    return category.scheme === "http://schema.org/audience";
  });

  const targetAgeCategory = data.categories.find((category) => {
    return category.scheme === "http://schema.org/typicalAgeRange";
  });
  let targetAgeRange = [];
  if (targetAgeCategory && /\d\d?-?\d?\d?/.test(targetAgeCategory.term)) {
    targetAgeRange = targetAgeCategory.term.split("-");
  }

  const fictionCategory = data.categories.find((category) => {
    return category.scheme === "http://librarysimplified.org/terms/fiction/";
  });
  let fiction;
  if (fictionCategory) {
    fiction = fictionCategory.label === "Fiction";
  }

  const categories = data.categories.map((category) => category.label);

  // Extract visibility status (manually-suppressed or policy-filtered)
  const visibilityStatusCategory = data.categories.find((category) => {
    return category.scheme === VISIBILITY_STATUS_SCHEME;
  });
  const visibilityStatus = visibilityStatusCategory?.term as
    | "manually-suppressed"
    | "policy-filtered"
    | undefined;

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

  const authors = [];
  for (const author of data.authors) {
    authors.push(Object.assign({}, author, { role: "aut" }));
  }
  const contributors = data.contributors?.map((contributor) => ({
    name: contributor?.name,
    role: contributor?.role,
    uri: contributor?.uri,
  }));

  let rating;
  try {
    const ratings = data.unparsed["schema:Rating"];
    for (const ratingTag of ratings) {
      if (
        ratingTag["$"]["schema:additionalType"]["value"] ===
        "http://schema.org/ratingValue"
      ) {
        rating = ratingTag["$"]["schema:ratingValue"]["value"];
        break;
      }
    }
  } catch (e) {
    rating = null;
  }

  const imageLink = data.links.find((link) => {
    return link.rel === "http://opds-spec.org/image";
  });
  const coverUrl: string | undefined = imageLink?.href;

  return {
    id: data.id,
    title: data.title,
    authors: authors,
    contributors: contributors,
    subtitle: data.subtitle,
    summary: data.summary.content,
    audience: audience && audience.term,
    targetAgeRange: targetAgeRange,
    fiction: fiction,
    categories: categories,
    hideLink: opdsLinkToLinkData(hideLink),
    restoreLink: opdsLinkToLinkData(restoreLink),
    refreshLink: opdsLinkToLinkData(refreshLink),
    suppressPerLibraryLink: opdsLinkToLinkData(suppressPerLibraryLink),
    unsuppressPerLibraryLink: opdsLinkToLinkData(unsuppressPerLibraryLink),
    visibilityStatus: visibilityStatus,
    editLink: opdsLinkToLinkData(editLink),
    issuesLink: opdsLinkToLinkData(issuesLink),
    changeCoverLink: opdsLinkToLinkData(changeCoverLink),
    series: data.series && data.series.name,
    seriesPosition: data.series && data.series.position,
    medium: medium,
    language: data.language,
    publisher: data.publisher,
    imprint: imprint,
    issued: data.issued,
    rating: rating,
    coverUrl: coverUrl,
  };
}
