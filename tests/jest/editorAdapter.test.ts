import adapter from "../../src/editorAdapter";
import {
  OPDSEntry,
  Contributor,
  Series,
  Category,
  Summary,
} from "opds-feed-parser";

describe("editorAdapter", () => {
  it("adapts valid OPDS entry", () => {
    const entry = new OPDSEntry({
      id: "id",
      updated: "updated",
      title: "title",
      authors: [new Contributor({ name: "name", uri: "uri", role: "role" })],
      subtitle: "subtitle",
      contributors: [
        new Contributor({ name: "name2", uri: "uri2", role: "role2" }),
      ],
      series: new Series({ name: "series", position: 2 }),
      categories: [
        new Category({ term: "term", scheme: "scheme", label: "label" }),
        new Category({
          term: "13-16",
          scheme: "http://schema.org/typicalAgeRange",
          label: "age",
        }),
        new Category({
          term: "ya",
          scheme: "http://schema.org/audience",
          label: "ya",
        }),
        new Category({
          term: "fiction",
          scheme: "http://librarysimplified.org/terms/fiction/",
          label: "Fiction",
        }),
      ],
      identifiers: [],
      links: [
        {
          href: "hide",
          rel: "http://librarysimplified.org/terms/rel/hide",
          type: "type",
          title: "title",
          role: "role",
        },
        {
          href: "restore",
          rel: "http://librarysimplified.org/terms/rel/restore",
          type: "type",
          title: "title",
          role: "role",
        },
        {
          href: "refresh",
          rel: "http://librarysimplified.org/terms/rel/refresh",
          type: "type",
          title: "title",
          role: "role",
        },
        {
          href: "edit",
          rel: "edit",
          type: "type",
          title: "title",
          role: "role",
        },
        {
          href: "issues",
          rel: "issues",
          type: "type",
          title: "title",
          role: "role",
        },
        {
          href: "change-cover",
          rel: "http://librarysimplified.org/terms/rel/change_cover",
          type: "type",
          title: "title",
          role: "role",
        },
        {
          href: "cover",
          rel: "http://opds-spec.org/image",
          type: "image/png",
          title: "title",
          role: "role",
        },
      ],
      issued: "issued",
      language: "language",
      rights: "rights",
      publisher: "publisher",
      published: "published",
      summary: new Summary({ content: "content", link: "link" }),
      unparsed: {
        "schema:alternativeHeadline": [{ _: "subtitle" }],
        $: {
          "schema:additionalType": { value: "medium" },
        },
        "bib:publisherImprint": [{ _: "imprint" }],
        "schema:Rating": [
          {
            $: {
              "schema:ratingValue": { value: "0.3" },
              "schema:additionalType": {
                value: "http://librarysimplified.org/terms/rel/quality",
              },
            },
          },
          {
            $: {
              "schema:ratingValue": { value: "4" },
              "schema:additionalType": {
                value: "http://schema.org/ratingValue",
              },
            },
          },
        ],
      },
    });

    const adapted = adapter(entry);
    expect(adapted.title).toBe("title");
    expect(adapted.authors).toEqual([
      { name: "name", uri: "uri", role: "aut" },
    ]);
    expect(adapted.contributors).toEqual(entry.contributors);
    expect(adapted.subtitle).toBe("subtitle");
    expect(adapted.summary).toBe("content");
    expect(adapted.audience).toBe("ya");
    expect(adapted.targetAgeRange).toEqual(["13", "16"]);
    expect(adapted.fiction).toBe(true);
    expect(adapted.categories).toEqual(["label", "age", "ya", "Fiction"]);
    expect(adapted.hideLink).toEqual(entry.links[0]);
    expect(adapted.restoreLink).toEqual(entry.links[1]);
    expect(adapted.refreshLink).toEqual(entry.links[2]);
    expect(adapted.editLink).toEqual(entry.links[3]);
    expect(adapted.issuesLink).toEqual(entry.links[4]);
    expect(adapted.changeCoverLink).toEqual(entry.links[5]);
    expect(adapted.coverUrl).toBe(entry.links[6].href);
    expect(adapted.series).toBe("series");
    expect(adapted.seriesPosition).toBe(2);
    expect(adapted.medium).toBe("medium");
    expect(adapted.language).toBe("language");
    expect(adapted.publisher).toBe("publisher");
    expect(adapted.imprint).toBe("imprint");
    expect(adapted.issued).toBe("issued");
    expect(adapted.rating).toBe("4");
  });

  it("adapts visibility status from categories", () => {
    const entry = new OPDSEntry({
      id: "id",
      updated: "updated",
      title: "title",
      authors: [],
      contributors: [],
      categories: [
        new Category({ term: "term", scheme: "scheme", label: "label" }),
        new Category({
          term: "manually-suppressed",
          scheme: "http://palaceproject.io/terms/visibility-status",
          label: "Manually Suppressed",
        }),
      ],
      identifiers: [],
      links: [],
      issued: "issued",
      language: "language",
      rights: "rights",
      publisher: "publisher",
      published: "published",
      summary: new Summary({ content: "content", link: "link" }),
      unparsed: {},
    });

    const adapted = adapter(entry);
    expect(adapted.visibilityStatus).toBe("manually-suppressed");
  });

  it("adapts policy-filtered visibility status", () => {
    const entry = new OPDSEntry({
      id: "id",
      updated: "updated",
      title: "title",
      authors: [],
      contributors: [],
      categories: [
        new Category({
          term: "policy-filtered",
          scheme: "http://palaceproject.io/terms/visibility-status",
          label: "Policy Filtered",
        }),
      ],
      identifiers: [],
      links: [],
      issued: "issued",
      language: "language",
      rights: "rights",
      publisher: "publisher",
      published: "published",
      summary: new Summary({ content: "content", link: "link" }),
      unparsed: {},
    });

    const adapted = adapter(entry);
    expect(adapted.visibilityStatus).toBe("policy-filtered");
  });

  it("doesn't crash when expected data is missing", () => {
    const entry = new OPDSEntry({
      id: "id",
      updated: "updated",
      title: "title",
      subtitle: "subtitle",
      authors: [],
      contributors: [],
      categories: [],
      identifiers: [],
      links: [],
      issued: "issued",
      language: "language",
      rights: "rights",
      publisher: "publisher",
      published: "published",
      summary: new Summary({ content: "content", link: "link" }),
      unparsed: {},
    });

    expect(() => adapter(entry)).not.toThrow();
  });
});
