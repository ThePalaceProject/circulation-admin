// This file provides type declarations that allow images to be imported via webpack url-loader.

declare module "*.svg" {
  const src: string;
  export = src;
}
