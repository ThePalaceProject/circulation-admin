// When a SaveButton is clicked or a form is otherwise submitted, collect and
// format the data as necessary, and then call EditableConfigList's save function.
// Used by SaveButton, IndividualAdminEditForm, LibraryEditForm, ServiceEditForm,
// and SitewideSettingEditForm.

export function handleSubmit(event) {
  event.preventDefault();
  let data = new (window as any).FormData(this.props.form as any);
  this.props.handleData && this.props.handleData(data);
  this.props.save(data);
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
