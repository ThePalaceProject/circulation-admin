interface LinkData {
  href: string;
  rel: string;
}

interface BookData {
  title: string;
  hideLink?: LinkData;
  restoreLink?: LinkData;
  refreshLink?: LinkData;
}

interface BookLink {
  text: string;
  url: (book: BookData) => string;
}

interface RootProps extends __React.Props<any> {
  csrfToken: string;
  collection: string;
  book: string;
  tab?: string;
  onNavigate: (collection: string, book: string, tab?: string) => void;
  bookLinks?: BookLink[];
}

interface EditorProps extends __React.Props<any> {
  book: string;
  bookUrl?: string;
  bookData?: BookData;
  csrfToken: string;
  store?: Redux.Store;
  setBook?: (url: string) => void;
}

interface ButtonFormProps {
  link: string;
  label: string;
  csrfToken: string;
  refresh: any;
}

interface BookDetailsContainerProps extends __React.Props<any> {
  book: {
    url: string;
  };
  collection: string;
}

interface BookDetailsContainerConfig {
  editorStore: Redux.Store;
  csrfToken: string;
  onNavigate?: (collectionUrl: string, bookUrl: string, tab?: string) => void;
  tab?: string;
}
