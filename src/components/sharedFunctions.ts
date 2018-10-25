// When a SaveButton is clicked or a form is otherwise submitted, collect and
// format the data as necessary, and then call EditableConfigList's save function.
// Used by SaveButton, IndividualAdminEditForm, LibraryEditForm, ServiceEditForm,
// and SitewideSettingEditForm.

export async function handleSubmit(form) {
  let data = new (window as any).FormData(form.refs.form);
  form.handleData && form.handleData(data);
  await form.props.save(data);
}

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
