export interface Navigate {
  (collectionUrl: string, bookUrl: string, tab?: string): void;
}

export interface LinkData {
  href: string;
  rel: string;
}

export interface CategoryData {
  label: string;
}

export interface BookData {
  title: string;
  fiction?: boolean;
  audience?: string;
  targetAgeRange?: string[];
  summary?: string;
  hideLink?: LinkData;
  restoreLink?: LinkData;
  refreshLink?: LinkData;
  editLink?: LinkData;
  issuesLink?: LinkData;
  categories?: string[];
}

export interface BookLink {
  text: string;
  url: (book: BookData) => string;
}

export interface ComplaintsData {
  book: {
    id: string;
  };
  complaints: { [key: string]: number };
}

export interface PostComplaint {
  (url: string, data: { type: string }): Promise<any>;
}

export interface GenreTree {
  Fiction: {
    [index: string]: GenreData;
  };
  Nonfiction: {
    [index: string]: GenreData;
  };
}

export interface GenreData {
  name: string;
  parents: string[];
  subgenres: string[];
}

export interface ClassificationData {
  type: string;
  name: string;
  source: string;
  weight: string;
}