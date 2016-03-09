export default function adapter(data: any): any {
  let hideLink = data.links.find(link => {
    return link.rel === "http://librarysimplified.org/terms/rel/hide";
  });

  let restoreLink = data.links.find(link => {
    return link.rel === "http://librarysimplified.org/terms/rel/restore";
  });


  return {
    title: data.title,
    hideLink: hideLink,
    restoreLink: restoreLink
  };
}