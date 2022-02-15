import * as React from "react";
import { Link } from "react-router";

export default function CatalogLink({ url, title, label }) {
  const prepareBookUrl = (url: string): string => {
    const regexp = new RegExp(document.location.origin + "/(.*)/works/(.*)");
    const match = regexp.exec(url);
    if (match) {
      const library = match[1];
      const work = match[2];
      return encodeURIComponent(library + "/" + work);
    } else {
      return url;
    }
  };

  const pathFor = (bookUrl: string) => {
    let path = "/admin/web";
    path += bookUrl ? `/book/${prepareBookUrl(bookUrl)}` : "";
    return path;
  };

  const finalBookUrl = pathFor(url);

  return (
    <Link
      to={finalBookUrl}
      title={title}
      target="_blank"
      className="btn inverted left-align small top-align"
    >
      {label}
    </Link>
  );
}
