interface LinkData {
  href: string;
  rel: string;
}

interface BookData {
  title: string;
  suppressLink: LinkData;
  unsuppressLink: LinkData;
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
  bookData?: BookData;
  csrfToken: string;
  store: Redux.Store;
  setBook?: (url: string) => void;
}

interface SuppressFormProps {
  link: string;
  csrfToken: string;
}