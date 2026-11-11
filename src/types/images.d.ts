// This file provides type declarations that allow images to be imported via webpack url-loader.

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.md" {
  const content: string;
  export default content;
}
