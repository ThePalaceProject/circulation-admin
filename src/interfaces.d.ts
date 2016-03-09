interface LinkData {
  href: string;
  rel: string;
}

interface BookData {
  title: string;
  hideLink: LinkData;
  restoreLink: LinkData;
}

interface RootProps {
  csrfToken: string;
  collection: string;
  book: string;
  app: string;
  onNavigate: (app: string, collection: string, book: string) => void;
}

interface EditorProps {
  book: string;
  bookUrl?: string;
  bookData?: BookData;
  csrfToken: string;
  store: Redux.Store;
  setBook?: (url: string) => void;
}

interface ButtonFormProps {
  link: string;
  label: string;
  csrfToken: string;
  refresh: () => void;
}