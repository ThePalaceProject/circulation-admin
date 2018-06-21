import * as React from "react";
import DefaultBookDetails, { BookDetailsProps as DefaultBookDetailsProps } from "opds-web-client/lib/components/BookDetails";

export default class BookDetails extends DefaultBookDetails<DefaultBookDetailsProps> {

  fieldNames() {
    return ["Published", "Publisher", "Audience", "Categories", "Distributed By"];
  }

  fields() {
    let fields = super.fields();
    let categoriesIndex = fields.findIndex(field => field.name === "Categories");
    fields[categoriesIndex].value = this.categories();
    fields.push({
      name: "Audience",
      value: this.audience()
    });
    fields.push({
      name: "Distributed By",
      value: this.distributor()
    });
    return fields;
  }

  audience() {
    if (!this.props.book) {
      return null;
    }

    let categories = this.props.book.raw.category;

    if (!categories) {
      return null;
    }

    let audience = categories.find(category =>
      category["$"]["scheme"] && category["$"]["scheme"]["value"] === "http://schema.org/audience"
    );

    if (!audience) {
      return null;
    }

    let audienceStr = audience["$"]["label"] && audience["$"]["label"]["value"];

    if (["Adult", "Adults Only"].indexOf(audienceStr) !== -1) {
      return audienceStr;
    }

    let targetAge = categories.find(category =>
      category["$"]["scheme"] && category["$"]["scheme"]["value"] === "http://schema.org/typicalAgeRange"
    );

    if (targetAge) {
      let targetAgeStr = targetAge["$"]["label"] && targetAge["$"]["label"]["value"];
      audienceStr += " (age " + targetAgeStr + ")";
    }

    return audienceStr;
  }

  categories() {
    if (!this.props.book) {
      return null;
    }

    let audienceSchemas = [
      "http://schema.org/audience",
      "http://schema.org/typicalAgeRange"
    ];
    let fictionScheme = "http://librarysimplified.org/terms/fiction/";
    let rawCategories = this.props.book.raw.category || [];

    let categories = rawCategories.filter(category =>
      category["$"]["label"] && category["$"]["scheme"] &&
          audienceSchemas.concat([fictionScheme])
              .indexOf(category["$"]["scheme"]["value"]) === -1
    ).map(category => category["$"]["label"]["value"]);

    if (!categories.length) {
      categories = rawCategories.filter(category =>
        category["$"]["label"] && category["$"]["scheme"] &&
            category["$"]["scheme"]["value"] === fictionScheme
      ).map(category => category["$"]["label"]["value"]);
    }

    return categories.length > 0 ? categories.join(", ") : null;
  }

  distributor() {
    if (!this.props.book) {
      return null;
    }

    let rawDistributionTags = this.props.book.raw["bibframe:distribution"];
    if (!rawDistributionTags || rawDistributionTags.length < 1) {
      return null;
    }

    let distributor = rawDistributionTags[0]["$"]["bibframe:ProviderName"];
    if (!distributor) {
      return null;
    }

    return distributor.value;
  }
}