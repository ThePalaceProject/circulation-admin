export function handleSubmit(event) {
  event.preventDefault();
  let data = new (window as any).FormData(this.props.form as any);
  this.props.handleData && this.props.handleData(data);
  this.props.save(data);
}
