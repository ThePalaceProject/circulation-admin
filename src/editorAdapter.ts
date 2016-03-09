export default function adapter(data: any): any {
  let suppressLink = data.links.find(link => {
    return link.rel === "http://librarysimplified.org/terms/rel/suppress";
  });

  let unsuppressLink = data.links.find(link => {
    return link.rel === "http://librarysimplified.org/terms/rel/unsuppress";
  });


  return {
    title: data.title,
    suppressLink: suppressLink,
    unsuppressLink: unsuppressLink
  };
}