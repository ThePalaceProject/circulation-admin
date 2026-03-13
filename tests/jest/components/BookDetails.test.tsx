import * as React from "react";
import { render } from "@testing-library/react";
import BookDetails from "../../../src/components/book/BookDetails";
import { BookData } from "@thepalaceproject/web-opds-client/lib/interfaces";

const book: BookData = {
  id: "urn:librarysimplified.org/terms/id/3M%20ID/crrmnr9",
  url: "http://circulation.librarysimplified.org/works/3M/crrmnr9",
  title: "The Mayan Secrets",
  authors: ["Clive Cussler", "Thomas Perry"],
  contributors: ["contributor 1"],
  summary: "A summary.",
  imageUrl: "https://dlotdqc6pnwqb.cloudfront.net/3M/crrmnr9/cover.jpg",
  borrowUrl: "borrow url",
  openAccessLinks: [{ url: "secrets.epub", type: "application/epub+zip" }],
  publisher: "Penguin Publishing Group",
  published: "February 29, 2016",
  categories: ["Children", "10-12", "Fiction", "Adventure", "Fantasy"],
  raw: {
    category: [
      {
        $: {
          scheme: { value: "http://schema.org/audience" },
          label: { value: "Children" },
        },
      },
      {
        $: {
          scheme: { value: "http://schema.org/typicalAgeRange" },
          label: { value: "10-12" },
        },
      },
      {
        $: {
          scheme: { value: "http://librarysimplified.org/terms/fiction/" },
          label: { value: "Fiction" },
        },
      },
      {
        $: {
          scheme: {
            value: "http://librarysimplified.org/terms/genres/Simplified/",
          },
          label: { value: "Adventure" },
        },
      },
      {
        $: {
          scheme: {
            value: "http://librarysimplified.org/terms/genres/Simplified/",
          },
          label: { value: "Fantasy" },
        },
      },
    ],
    "bibframe:distribution": [
      {
        $: {
          "bibframe:ProviderName": { value: "Overdrive" },
        },
      },
    ],
    link: [
      {
        $: {
          rel: { value: "issues" },
          href: { value: "http://example.com/report" },
        },
      },
      {
        $: {
          rel: { value: "http://librarysimplified.org/terms/rel/revoke" },
          href: { value: "http://example.com/revoke" },
        },
      },
    ],
  },
} as any;

const noop = jest.fn().mockResolvedValue(undefined);

describe("BookDetails", () => {
  it("shows audience and target age", () => {
    const { container } = render(<BookDetails book={book} updateBook={noop} />);
    const audience = container.querySelector(".audience");
    expect(audience).toBeInTheDocument();
    expect(audience.textContent).toContain("Children");
    expect(audience.textContent).toContain("10-12");
  });

  it("shows categories", () => {
    const { container } = render(<BookDetails book={book} updateBook={noop} />);
    const categories = container.querySelector(".categories");
    expect(categories).toBeInTheDocument();
    expect(categories.textContent).toContain("Adventure");
    expect(categories.textContent).toContain("Fantasy");
  });

  it("shows distributor", () => {
    const { container } = render(<BookDetails book={book} updateBook={noop} />);
    const distributor = container.querySelector(".distributed-by");
    expect(distributor).toBeInTheDocument();
    expect(distributor.textContent).toContain("Overdrive");
  });
});
