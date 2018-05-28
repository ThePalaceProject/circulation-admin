import { expect } from "chai";
import { stub } from "sinon";

import adapter from "../editorAdapter";
import { OPDSEntry, Contributor, Series, Category, Summary } from "opds-feed-parser";

describe("editorAdapter", () => {
  it("adapts valid OPDS entry", () => {
    let entry = new OPDSEntry({
      id: "id",
      updated: "updated",
      title: "title",
      authors: [new Contributor({ name: "name", uri: "uri", role: "role" })],
      contributors: [new Contributor({ name: "name2", uri: "uri2", role: "role2" })],
      series: new Series({ name: "series", position: 2 }),
      categories: [
        new Category({ term: "term", scheme: "scheme", label: "label" }),
        new Category({ term: "13-16", scheme: "http://schema.org/typicalAgeRange", label: "age" }),
        new Category({ term: "ya", scheme: "http://schema.org/audience", label: "ya" }),
        new Category({ term: "fiction", scheme: "http://librarysimplified.org/terms/fiction/", label: "Fiction" })
      ],
      identifiers: [],
      links: [
        { href: "hide", rel: "http://librarysimplified.org/terms/rel/hide", type: "type", title: "title" },
        { href: "restore", rel: "http://librarysimplified.org/terms/rel/restore", type: "type", title: "title" },
        { href: "refresh", rel: "http://librarysimplified.org/terms/rel/refresh", type: "type", title: "title" },
        { href: "edit", rel: "edit", type: "type", title: "title" },
        { href: "issues", rel: "issues", type: "type", title: "title" },
        { href: "change-cover", rel: "http://librarysimplified.org/terms/rel/change_cover", type: "type", title: "title" },
        { href: "cover", rel: "http://opds-spec.org/image", type: "image/png", title: "title" },
      ],
      issued: "issued",
      language: "language",
      rights: "rights",
      publisher: "publisher",
      published: "published",
      summary: new Summary({ content: "content", link: "link" }),
      unparsed: {
        "schema:alternativeHeadline": [{ "_": "subtitle" }],
        "$": {
          "schema:additionalType": { value: "medium" }
        },
        "bib:publisherImprint": [{ "_": "imprint" }],
        "schema:Rating": [
          { "$": { "schema:ratingValue": { value: "0.3" },
                   "schema:additionalType": { value: "http://librarysimplified.org/terms/rel/quality" }}},
          { "$": { "schema:ratingValue": { value: "4" },
                   "schema:additionalType": { value: "http://schema.org/ratingValue" }}}
        ]
      }
    });

    let adapted = adapter(entry);
    expect(adapted.title).to.equal("title");
    expect(adapted.authors).to.deep.equal([{ name: "name", uri: "uri", role: "aut" }]);
    expect(adapted.contributors).to.deep.equal(entry.contributors);
    expect(adapted.subtitle).to.equal("subtitle");
    expect(adapted.summary).to.equal("content");
    expect(adapted.audience).to.equal("ya");
    expect(adapted.targetAgeRange).to.deep.equal(["13", "16"]);
    expect(adapted.fiction).to.equal(true);
    expect(adapted.categories).to.deep.equal(["label", "age", "ya", "Fiction"]);
    expect(adapted.hideLink).to.deep.equal(entry.links[0]);
    expect(adapted.restoreLink).to.deep.equal(entry.links[1]);
    expect(adapted.refreshLink).to.deep.equal(entry.links[2]);
    expect(adapted.editLink).to.deep.equal(entry.links[3]);
    expect(adapted.issuesLink).to.deep.equal(entry.links[4]);
    expect(adapted.changeCoverLink).to.deep.equal(entry.links[5]);
    expect(adapted.coverUrl).to.equal(entry.links[6].href);
    expect(adapted.series).to.equal("series");
    expect(adapted.seriesPosition).to.equal(2);
    expect(adapted.medium).to.equal("medium");
    expect(adapted.language).to.equal("language");
    expect(adapted.publisher).to.equal("publisher");
    expect(adapted.imprint).to.equal("imprint");
    expect(adapted.issued).to.equal("issued");
    expect(adapted.rating).to.equal("4");
  });

  it("doesn't crash when expected data is missing", () => {
    let entry = new OPDSEntry({
      id: "id",
      updated: "updated",
      title: "title",
      authors: [],
      contributors: [],
      series: new Series({ name: "series", position: 2 }),
      categories: [],
      identifiers: [],
      links: [],
      issued: "issued",
      language: "language",
      rights: "rights",
      publisher: "publisher",
      published: "published",
      summary: new Summary({ content: "content", link: "link" }),
      unparsed: {}
    });

    let adapted = adapter(entry);
    expect(adapted.title).to.equal("title");
  });
});