const ROOT_TITLE = "Palace Collection Manager";

export default (...subtitle: string[]): string => {
  return [ROOT_TITLE, ...subtitle].filter((part) => !!part).join(" - ");
};
