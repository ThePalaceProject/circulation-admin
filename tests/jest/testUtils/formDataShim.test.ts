import { FormDataShim } from "./formDataShim";

// Verifies the shim mirrors the browser's `new FormData(form)` "successful
// controls" rules — the fidelity that makes the payload assertions in the form
// suites (BookEditForm, SitewideAnnouncements, ...) trustworthy.
describe("FormDataShim", () => {
  const formWith = (html: string): HTMLFormElement => {
    const form = document.createElement("form");
    form.innerHTML = html;
    return form;
  };

  it("includes named, enabled text controls", () => {
    const data = new FormDataShim(
      formWith(`<input name="title" value="Dune" />`)
    );
    expect(data.get("title")).toBe("Dune");
  });

  it("skips disabled controls, as the browser does", () => {
    const data = new FormDataShim(
      formWith(`<input name="title" value="Dune" disabled />`)
    );
    expect(data.get("title")).toBeNull();
  });

  it("skips unnamed controls", () => {
    const data = new FormDataShim(formWith(`<input value="anon" />`));
    expect(data.get("")).toBeNull();
  });

  it("skips controls disabled by an ancestor fieldset", () => {
    // A control inside <fieldset disabled> is a non-successful control even
    // though its own `disabled` property is false. (Attached to the document so
    // the :disabled match resolves ancestry.)
    const form = formWith(
      `<fieldset disabled><input name="inside" value="x" /></fieldset>
       <input name="outside" value="y" />`
    );
    document.body.appendChild(form);
    try {
      const data = new FormDataShim(form);
      expect(data.get("inside")).toBeNull();
      expect(data.get("outside")).toBe("y");
    } finally {
      form.remove();
    }
  });

  it("includes a checkbox only when it is checked", () => {
    expect(
      new FormDataShim(
        formWith(`<input type="checkbox" name="agree" value="yes" />`)
      ).get("agree")
    ).toBeNull();
    expect(
      new FormDataShim(
        formWith(`<input type="checkbox" name="agree" value="yes" checked />`)
      ).get("agree")
    ).toBe("yes");
  });

  it("includes only the checked radio in a group", () => {
    const data = new FormDataShim(
      formWith(
        `<input type="radio" name="size" value="s" />
         <input type="radio" name="size" value="m" checked />`
      )
    );
    expect(data.get("size")).toBe("m");
  });

  it("excludes submit/reset/button inputs", () => {
    const data = new FormDataShim(
      formWith(`<input type="submit" name="go" value="Save" />`)
    );
    expect(data.get("go")).toBeNull();
  });

  it("omits file inputs (the browser submits them as File objects)", () => {
    // Deliberate divergence from real FormData: a value-reading shim can't
    // reproduce a File, so file fields are treated as absent rather than sent
    // as their string value. Pinned so a regression can't silently re-add them.
    const data = new FormDataShim(formWith(`<input type="file" name="doc" />`));
    expect(data.get("doc")).toBeNull();
  });

  it("includes every selected option of a multi-select", () => {
    const form = document.createElement("form");
    const select = document.createElement("select");
    select.name = "langs";
    select.multiple = true;
    (
      [
        ["en", true],
        ["fr", false],
        ["de", true],
      ] as const
    ).forEach(([value, selected]) => {
      const option = document.createElement("option");
      option.value = value;
      option.selected = selected;
      select.appendChild(option);
    });
    form.appendChild(select);

    expect(new FormDataShim(form).getAll("langs")).toStrictEqual(["en", "de"]);
  });

  it("supports the standard read/write surface", () => {
    const data = new FormDataShim();
    data.append("k", "1");
    data.append("k", "2");
    expect(data.getAll("k")).toStrictEqual(["1", "2"]);
    expect(data.has("k")).toBe(true);
    data.set("k", "3");
    expect(data.getAll("k")).toStrictEqual(["3"]);
    data.delete("k");
    expect(data.has("k")).toBe(false);
  });

  it("set() replaces the first entry in place and drops later duplicates", () => {
    const data = new FormDataShim();
    data.append("a", "1");
    data.append("b", "2");
    data.append("a", "3");

    data.set("a", "9");

    expect(Array.from(data.entries())).toStrictEqual([
      ["a", "9"],
      ["b", "2"],
    ]);
  });
});
