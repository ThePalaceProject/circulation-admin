interface LinkData {
  href: string;
  rel: string;
}

interface BookData {
  title: string;
  hideLink?: LinkData;
  restoreLink?: LinkData;
  editLink?: LinkData;
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
  refreshBook?: () => Promise<any>;
}

interface ButtonFormProps {
  link: string;
  label: string;
  csrfToken: string;
  refresh: any;
}

interface EditableInputProps extends __React.Props<any> {
  label: string;
  value: string;
}

interface EditFormProps extends BookData {
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
  refreshBook?: () => Promise<any>;
}