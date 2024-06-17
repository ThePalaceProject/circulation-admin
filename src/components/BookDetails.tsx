import DefaultBookDetails, {
  BookDetailsProps as DefaultBookDetailsProps,
} from "@thepalaceproject/web-opds-client/lib/components/BookDetails";

export default class BookDetails extends DefaultBookDetails<
  DefaultBookDetailsProps
> {
  fieldNames() {
    return [
      "Published",
      "Publisher",
      "Audience",
      "Categories",
      "Distributed By",
    ];
  }

  fields() {
    const fields = super.fields();
    const categoriesIndex = fields.findIndex(
      (field) => field.name === "Categories"
    );
    fields[categoriesIndex].value = this.categories();
    fields.push({
      name: "Audience",
      value: this.audience(),
    });
    fields.push({
      name: "Distributed By",
      value: this.distributor(),
    });
    return fields;
  }

  audience() {
    if (!this.props.book) {
      return null;
    }

    const categories = this.props.book.raw.category;

    if (!categories) {
      return null;
    }

    const audience = categories.find(
      (category) =>
        category["$"]["scheme"] &&
        category["$"]["scheme"]["value"] === "http://schema.org/audience"
    );

    if (!audience) {
      return null;
    }

    let audienceStr = audience["$"]["label"] && audience["$"]["label"]["value"];

    if (["Adult", "Adults Only"].indexOf(audienceStr) !== -1) {
      return audienceStr;
    }

    const targetAge = categories.find(
      (category) =>
        category["$"]["scheme"] &&
        category["$"]["scheme"]["value"] === "http://schema.org/typicalAgeRange"
    );

    if (targetAge) {
      const targetAgeStr =
        targetAge["$"]["label"] && targetAge["$"]["label"]["value"];
      audienceStr += " (age " + targetAgeStr + ")";
    }

    return audienceStr;
  }

  categories() {
    if (!this.props.book) {
      return null;
    }

    const audienceSchemas = [
      "http://schema.org/audience",
      "http://schema.org/typicalAgeRange",
    ];
    const fictionScheme = "http://librarysimplified.org/terms/fiction/";
    const rawCategories = this.props.book.raw.category || [];

    let categories = rawCategories
      .filter(
        (category) =>
          category["$"]["label"] &&
          category["$"]["scheme"] &&
          audienceSchemas
            .concat([fictionScheme])
            .indexOf(category["$"]["scheme"]["value"]) === -1
      )
      .map((category) => category["$"]["label"]["value"]);

    if (!categories.length) {
      categories = rawCategories
        .filter(
          (category) =>
            category["$"]["label"] &&
            category["$"]["scheme"] &&
            category["$"]["scheme"]["value"] === fictionScheme
        )
        .map((category) => category["$"]["label"]["value"]);
    }

    return categories.length > 0 ? categories.join(", ") : null;
  }

  distributor() {
    if (!this.props.book) {
      return null;
    }

    const rawDistributionTags = this.props.book.raw["bibframe:distribution"];
    if (!rawDistributionTags || rawDistributionTags.length < 1) {
      return null;
    }

    const distributor = rawDistributionTags[0]["$"]["bibframe:ProviderName"];
    if (!distributor) {
      return null;
    }

    return distributor.value;
  }

  circulationLinks() {
    return null;
  }
}
