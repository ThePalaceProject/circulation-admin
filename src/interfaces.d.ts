interface Navigate {
  (collection: string, book: string, isTopLevel: boolean, tab?: string): void;
}

interface PathFor {
  (collectionUrl: string, bookUrl: string): string;
}

interface LinkData {
  href: string;
  rel: string;
}

interface BookData {
  title: string;
  publisher?: string;
  summary?: string;
  hideLink?: LinkData;
  restoreLink?: LinkData;
  refreshLink?: LinkData;
  editLink?: LinkData;
  issuesLink?: LinkData;
}

interface BookLink {
  text: string;
  url: (book: BookData) => string;
}

interface ComplaintsData {
  book: {
    id: string;
  };
  complaints: { [key: string]: number };
}

interface PostComplaint {
  (url: string, data: { type: string }): Promise<any>;
}

// this should be same as RequestError from opd-browser/lib/DataFetcher,
// but for now we're not importing that interface because then all the
// other interfaces in this file would have to be explicitly imported
// and exported throughout the project
interface ErrorData {
  status: number;
  response: string;
  url: string;
}