interface LinkData {
  href: string;
  rel: string;
}

interface BookData {
  title: string;
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

interface RootProps extends __React.Props<any> {
  csrfToken: string;
  collectionUrl: string;
  bookUrl: string;
  tab: string;
  isTopLevel: boolean;
  navigate: (collection: string, book: string, isTopLevel: boolean, tab?: string) => void;
  bookLinks?: BookLink[];
}

interface EditorProps extends __React.Props<any> {
  bookUrl?: string;
  bookData?: BookData;
  bookAdminUrl?: string;
  fetchError?: ErrorData;
  editError?: ErrorData;
  csrfToken: string;
  store?: Redux.Store;
  fetchBook?: (url: string) => void;
  refreshBook?: () => void;
  editBook?: (url: string, data: FormData) => Promise<any>;
  isFetching?: boolean;
}

interface ButtonFormProps {
  link: string;
  label: string;
  csrfToken: string;
  disabled: boolean;
  refresh: () => any;
  submit: (url: string, data: FormData) => Promise<any>;
  handleError?: (error) => void;
}

interface EditableInputProps extends __React.Props<any> {
  label: string;
  value: string;
  name: string;
  disabled: boolean;
}

interface EditFormProps extends BookData {
  csrfToken: string;
  disabled: boolean;
  refresh: () => any;
  editBook: (url: string, data: FormData) => Promise<any>;
}

interface ErrorMessageProps {
  error: ErrorData;
  tryAgain?: () => any;
}

interface BookDetailsContainerProps extends __React.Props<any> {
  bookUrl: string;
  collectionUrl: string;
  refreshBrowser: () => void;
}

interface TabContainerProps extends __React.Props<any> {
  bookUrl: string;
  bookData?: BookData;
  collectionUrl: string;
  store: Redux.Store;
  csrfToken: string;
  tab: string;
  navigate: (collectionUrl: string, bookUrl: string, isToplevel: boolean, tab?: string) => void;
  refreshBrowser: () => void;
  complaintsCount?: number;
  postComplaint?: (url: string, data: PostComplaintData) => Promise<any>;
}

interface ComplaintsData {
  book: {
    id: string;
  };
  complaints: { [key: string]: number };
}

interface ComplaintsProps extends __React.Props<any> {
  bookUrl: string;
  book: BookData;
  complaints?: any;
  fetchError?: ErrorData;
  store?: Redux.Store;
  fetchComplaints?: (url: string) => Promise<any>;
  isFetching?: boolean;
  postComplaint: (url: string, data: PostComplaintData) => Promise<any>;
}

interface ComplaintFormProps extends __React.Props<any> {
  disabled?: boolean;
  complaintUrl: string;
  postComplaint: (url: string, data: PostComplaintData) => Promise<any>;
  refreshComplaints: () => void;
}

interface PostComplaintData {
  type: string;
}

interface BookDetailsContainerContext {
  csrfToken?: string;
  navigate?: (collection: string, book: string, isTopLevel: boolean, tab?: string) => void;
  tab?: string;
  refreshBook?: () => void;
  editorStore?: Redux.Store;
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