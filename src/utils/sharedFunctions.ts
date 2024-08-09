// Identify which HTML option elements are supposed to be selected by default,
//  so that they stay selected when the form is cleared.  Used by LibraryEditForm
//  and ServiceEditForm.

import numeral = require("numeral");

export function findDefault(setting) {
  const defaultOptions = [];
  setting.options &&
    setting.default &&
    setting.options.map((option) => {
      if (
        setting.default.indexOf(option.key) >= 0 ||
        setting.default === option.key
      ) {
        defaultOptions.push(option);
      }
    });
  if (defaultOptions.length > 0) {
    return defaultOptions;
  }
}

// Blank out the create form on successful submission, so that the user can go
// ahead and create another new thing.  Used by IndividualAdminEditForm,
// LibraryEditForm, and ServiceEditForm.
export function clearForm(refs, useCurrent = false) {
  if (refs) {
    const keys = Object.keys(refs);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (useCurrent) {
        refs[key].current?.clear && refs[key].current.clear();
        if (refs[key].current?.props && refs[key].current.props.onRemove) {
          refs[key].current.props.onRemove();
        }
      } else {
        refs[key]?.clear && refs[key].clear();
        if (refs[key]?.props && refs[key].props.onRemove) {
          refs[key].props.onRemove();
        }
      }
    }
  }
}

export function formatString(
  word: string,
  replacement?: string[],
  capitalize = true
) {
  if (capitalize) {
    word = word.substr(0, 1).toUpperCase() + word.substr(1);
  }
  if (replacement) {
    // If the replacement array contains more than one element, the last element will replace
    // all of the previous ones.  Otherwise, the one element will be replaced with a space.
    const replaceWith = replacement.length > 1 ? replacement.pop() : " ";
    replacement.forEach((char) => {
      word = word.replace(new RegExp(char, "g"), replaceWith);
    });
  }
  return word;
}

/** Compares two arrays to see whether they contain the same items.  (The order of the items doesn't matter.) */
export function isEqual(array1: Array<any>, array2: Array<any>): boolean {
  return (
    array1.length === array2.length &&
    array1.every((x) => array2.indexOf(x) >= 0)
  );
}

/**
 * Format number using US conventions, if value provided is a number.
 *
 * If the value is a non-number string, return that value.
 * Otherwise, return the empty string.
 *
 * @param n - the (possibly numeric) value to format
 */
export const formatNumber = (n: number | string | null): string => {
  return !isNaN(Number(n))
    ? Intl.NumberFormat("en-US").format(Number(n))
    : n === String(n)
    ? n
    : "";
};

/**
 * Make a number rounded to it's nearest units (ones, thousands, millions, ...).
 * @param n - the number to round (e.g., 1,215)
 * @return - the rounded number with its unit (e.g., "1.2k") as string.
 */
export const roundedNumber = (n: number): string =>
  n ? numeral(n).format("0.[0]a") : "0";
