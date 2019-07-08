// Identify which HTML option elements are supposed to be selected by default,
//  so that they stay selected when the form is cleared.  Used by LibraryEditForm
//  and ServiceEditForm.

export function findDefault(setting) {
  let defaultOptions = [];
  setting.options && setting.default && setting.options.map(option => {
    if (setting.default.indexOf(option.key) >= 0 || setting.default === option.key) {
      defaultOptions.push(option);
    }
  });
  if (defaultOptions.length > 0) { return defaultOptions; }
}

// Blank out the create form on successful submission, so that the user can go
// ahead and create another new thing.  Used by IndividualAdminEditForm,
// LibraryEditForm, SitewideSettingEditForm, and ServiceEditForm.
export function clearForm(refs) {
  if (refs) {
    let keys = Object.keys(refs);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      refs[key].clear && refs[key].clear();
      if (refs[key].props && refs[key].props.onRemove) {
        refs[key].props.onRemove();
      }
    }
  }
}

export function formatString(word: string, replacement?: string[], capitalize = true) {
  if (capitalize) {
    word = word.substr(0, 1).toUpperCase() + word.substr(1);
  }
  if (replacement) {
    // If the replacement array contains more than one element, the last element will replace
    // all of the previous ones.  Otherwise, the one element will be replaced with a space.
    let replaceWith = replacement.length > 1 ? replacement.pop() : " ";
    replacement.forEach((char) => {
      word = word.replace(new RegExp(char, "g"), replaceWith);
    });
  }
  return word;
}
