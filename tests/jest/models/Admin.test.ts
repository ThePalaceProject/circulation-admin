import Admin from "../../../src/models/Admin";

describe("Admin", () => {
  const systemAdmin = new Admin([{ role: "system" }]);
  const sitewideLibraryManager = new Admin([{ role: "manager-all" }]);
  const sitewideLibrarian = new Admin([{ role: "librarian-all" }]);
  const libraryManagerA = new Admin([{ role: "manager", library: "a" }]);
  const librarianA = new Admin([{ role: "librarian", library: "a" }]);
  const libraryManagerB = new Admin([{ role: "manager", library: "b" }]);
  const librarianB = new Admin([{ role: "librarian", library: "b" }]);
  const libraryManagerASitewideLibrarian = new Admin([
    { role: "librarian-all" },
    { role: "manager", library: "a" },
  ]);
  const libraryManagerALibrarianB = new Admin([
    { role: "manager", library: "a" },
    { role: "librarian", library: "b" },
  ]);

  it("stores email", () => {
    expect(new Admin([], "email").email).toBe("email");
    expect(new Admin([]).email).toBeFalsy();
  });

  it("identifies system admins", () => {
    expect(systemAdmin.isSystemAdmin()).toBeTruthy();
    expect(sitewideLibraryManager.isSystemAdmin()).toBeFalsy();
    expect(sitewideLibrarian.isSystemAdmin()).toBeFalsy();
    expect(libraryManagerA.isSystemAdmin()).toBeFalsy();
    expect(librarianA.isSystemAdmin()).toBeFalsy();
    expect(libraryManagerB.isSystemAdmin()).toBeFalsy();
    expect(librarianB.isSystemAdmin()).toBeFalsy();
    expect(libraryManagerASitewideLibrarian.isSystemAdmin()).toBeFalsy();
    expect(libraryManagerALibrarianB.isSystemAdmin()).toBeFalsy();
  });

  it("identifies sitewide library managers", () => {
    expect(systemAdmin.isSitewideLibraryManager()).toBeTruthy();
    expect(sitewideLibraryManager.isSitewideLibraryManager()).toBeTruthy();
    expect(sitewideLibrarian.isSitewideLibraryManager()).toBeFalsy();
    expect(libraryManagerA.isSitewideLibraryManager()).toBeFalsy();
    expect(librarianA.isSitewideLibraryManager()).toBeFalsy();
    expect(libraryManagerB.isSitewideLibraryManager()).toBeFalsy();
    expect(librarianB.isSitewideLibraryManager()).toBeFalsy();
    expect(
      libraryManagerASitewideLibrarian.isSitewideLibraryManager()
    ).toBeFalsy();
    expect(libraryManagerALibrarianB.isSitewideLibraryManager()).toBeFalsy();
  });

  it("identifies sitewide librarians", () => {
    expect(systemAdmin.isSitewideLibrarian()).toBeTruthy();
    expect(sitewideLibraryManager.isSitewideLibrarian()).toBeTruthy();
    expect(sitewideLibrarian.isSitewideLibrarian()).toBeTruthy();
    expect(libraryManagerA.isSitewideLibrarian()).toBeFalsy();
    expect(librarianA.isSitewideLibrarian()).toBeFalsy();
    expect(libraryManagerB.isSitewideLibrarian()).toBeFalsy();
    expect(librarianB.isSitewideLibrarian()).toBeFalsy();
    expect(libraryManagerASitewideLibrarian.isSitewideLibrarian()).toBeTruthy();
    expect(libraryManagerALibrarianB.isSitewideLibrarian()).toBeFalsy();
  });

  it("identifies library managers", () => {
    expect(systemAdmin.isLibraryManager("a")).toBeTruthy();
    expect(sitewideLibraryManager.isLibraryManager("a")).toBeTruthy();
    expect(sitewideLibrarian.isLibraryManager("a")).toBeFalsy();
    expect(libraryManagerA.isLibraryManager("a")).toBeTruthy();
    expect(librarianA.isLibraryManager("a")).toBeFalsy();
    expect(libraryManagerB.isLibraryManager("a")).toBeFalsy();
    expect(librarianB.isLibraryManager("a")).toBeFalsy();
    expect(libraryManagerASitewideLibrarian.isLibraryManager("a")).toBeTruthy();
    expect(libraryManagerALibrarianB.isLibraryManager("a")).toBeTruthy();

    expect(systemAdmin.isLibraryManager("b")).toBeTruthy();
    expect(sitewideLibraryManager.isLibraryManager("b")).toBeTruthy();
    expect(sitewideLibrarian.isLibraryManager("b")).toBeFalsy();
    expect(libraryManagerA.isLibraryManager("b")).toBeFalsy();
    expect(librarianA.isLibraryManager("b")).toBeFalsy();
    expect(libraryManagerB.isLibraryManager("b")).toBeTruthy();
    expect(librarianB.isLibraryManager("b")).toBeFalsy();
    expect(libraryManagerASitewideLibrarian.isLibraryManager("b")).toBeFalsy();
    expect(libraryManagerALibrarianB.isLibraryManager("b")).toBeFalsy();
  });

  it("identifies librarians", () => {
    expect(systemAdmin.isLibrarian("a")).toBeTruthy();
    expect(sitewideLibraryManager.isLibrarian("a")).toBeTruthy();
    expect(sitewideLibrarian.isLibrarian("a")).toBeTruthy();
    expect(libraryManagerA.isLibrarian("a")).toBeTruthy();
    expect(librarianA.isLibrarian("a")).toBeTruthy();
    expect(libraryManagerB.isLibrarian("a")).toBeFalsy();
    expect(librarianB.isLibrarian("a")).toBeFalsy();
    expect(libraryManagerASitewideLibrarian.isLibrarian("a")).toBeTruthy();
    expect(libraryManagerALibrarianB.isLibrarian("a")).toBeTruthy();

    expect(systemAdmin.isLibrarian("b")).toBeTruthy();
    expect(sitewideLibraryManager.isLibrarian("b")).toBeTruthy();
    expect(sitewideLibrarian.isLibrarian("b")).toBeTruthy();
    expect(libraryManagerA.isLibrarian("b")).toBeFalsy();
    expect(librarianA.isLibrarian("b")).toBeFalsy();
    expect(libraryManagerB.isLibrarian("b")).toBeTruthy();
    expect(librarianB.isLibrarian("b")).toBeTruthy();
    expect(libraryManagerASitewideLibrarian.isLibrarian("b")).toBeTruthy();
    expect(libraryManagerALibrarianB.isLibrarian("b")).toBeTruthy();
  });

  it("identifies all library managers", () => {
    expect(systemAdmin.isLibraryManagerOfSomeLibrary()).toBeTruthy();
    expect(sitewideLibraryManager.isLibraryManagerOfSomeLibrary()).toBeTruthy();
    expect(sitewideLibrarian.isLibraryManagerOfSomeLibrary()).toBeFalsy();
    expect(libraryManagerA.isLibraryManagerOfSomeLibrary()).toBeTruthy();
    expect(librarianA.isLibraryManagerOfSomeLibrary()).toBeFalsy();
    expect(libraryManagerB.isLibraryManagerOfSomeLibrary()).toBeTruthy();
    expect(librarianB.isLibraryManagerOfSomeLibrary()).toBeFalsy();
    expect(
      libraryManagerASitewideLibrarian.isLibraryManagerOfSomeLibrary()
    ).toBeTruthy();
    expect(
      libraryManagerALibrarianB.isLibraryManagerOfSomeLibrary()
    ).toBeTruthy();
  });

  it("checks for specific roles", () => {
    expect(systemAdmin.hasRole("system")).toBeTruthy();
    expect(systemAdmin.hasRole("manager-all")).toBeTruthy();
    expect(systemAdmin.hasRole("librarian-all")).toBeTruthy();
    expect(systemAdmin.hasRole("manager", "a")).toBeTruthy();
    expect(systemAdmin.hasRole("librarian", "a")).toBeTruthy();
    expect(systemAdmin.hasRole("manager", "b")).toBeTruthy();
    expect(systemAdmin.hasRole("librarian", "b")).toBeTruthy();

    expect(sitewideLibraryManager.hasRole("system")).toBeFalsy();
    expect(sitewideLibraryManager.hasRole("manager-all")).toBeTruthy();
    expect(sitewideLibraryManager.hasRole("librarian-all")).toBeTruthy();
    expect(sitewideLibraryManager.hasRole("manager", "a")).toBeTruthy();
    expect(sitewideLibraryManager.hasRole("librarian", "a")).toBeTruthy();
    expect(sitewideLibraryManager.hasRole("manager", "b")).toBeTruthy();
    expect(sitewideLibraryManager.hasRole("librarian", "b")).toBeTruthy();

    expect(sitewideLibrarian.hasRole("system")).toBeFalsy();
    expect(sitewideLibrarian.hasRole("manager-all")).toBeFalsy();
    expect(sitewideLibrarian.hasRole("librarian-all")).toBeTruthy();
    expect(sitewideLibrarian.hasRole("manager", "a")).toBeFalsy();
    expect(sitewideLibrarian.hasRole("librarian", "a")).toBeTruthy();
    expect(sitewideLibrarian.hasRole("manager", "b")).toBeFalsy();
    expect(sitewideLibrarian.hasRole("librarian", "b")).toBeTruthy();

    expect(libraryManagerA.hasRole("system")).toBeFalsy();
    expect(libraryManagerA.hasRole("manager-all")).toBeFalsy();
    expect(libraryManagerA.hasRole("librarian-all")).toBeFalsy();
    expect(libraryManagerA.hasRole("manager", "a")).toBeTruthy();
    expect(libraryManagerA.hasRole("librarian", "a")).toBeTruthy();
    expect(libraryManagerA.hasRole("manager", "b")).toBeFalsy();
    expect(libraryManagerA.hasRole("librarian", "b")).toBeFalsy();

    expect(librarianA.hasRole("system")).toBeFalsy();
    expect(librarianA.hasRole("manager-all")).toBeFalsy();
    expect(librarianA.hasRole("librarian-all")).toBeFalsy();
    expect(librarianA.hasRole("manager", "a")).toBeFalsy();
    expect(librarianA.hasRole("librarian", "a")).toBeTruthy();
    expect(librarianA.hasRole("manager", "b")).toBeFalsy();
    expect(librarianA.hasRole("librarian", "b")).toBeFalsy();

    expect(libraryManagerB.hasRole("system")).toBeFalsy();
    expect(libraryManagerB.hasRole("manager-all")).toBeFalsy();
    expect(libraryManagerB.hasRole("librarian-all")).toBeFalsy();
    expect(libraryManagerB.hasRole("manager", "a")).toBeFalsy();
    expect(libraryManagerB.hasRole("librarian", "a")).toBeFalsy();
    expect(libraryManagerB.hasRole("manager", "b")).toBeTruthy();
    expect(libraryManagerB.hasRole("librarian", "b")).toBeTruthy();

    expect(librarianB.hasRole("system")).toBeFalsy();
    expect(librarianB.hasRole("manager-all")).toBeFalsy();
    expect(librarianB.hasRole("librarian-all")).toBeFalsy();
    expect(librarianB.hasRole("manager", "a")).toBeFalsy();
    expect(librarianB.hasRole("librarian", "a")).toBeFalsy();
    expect(librarianB.hasRole("manager", "b")).toBeFalsy();
    expect(librarianB.hasRole("librarian", "b")).toBeTruthy();

    expect(libraryManagerASitewideLibrarian.hasRole("system")).toBeFalsy();
    expect(libraryManagerASitewideLibrarian.hasRole("manager-all")).toBeFalsy();
    expect(
      libraryManagerASitewideLibrarian.hasRole("librarian-all")
    ).toBeTruthy();
    expect(
      libraryManagerASitewideLibrarian.hasRole("manager", "a")
    ).toBeTruthy();
    expect(
      libraryManagerASitewideLibrarian.hasRole("librarian", "a")
    ).toBeTruthy();
    expect(
      libraryManagerASitewideLibrarian.hasRole("manager", "b")
    ).toBeFalsy();
    expect(
      libraryManagerASitewideLibrarian.hasRole("librarian", "b")
    ).toBeTruthy();

    expect(libraryManagerALibrarianB.hasRole("system")).toBeFalsy();
    expect(libraryManagerALibrarianB.hasRole("manager-all")).toBeFalsy();
    expect(libraryManagerALibrarianB.hasRole("librarian-all")).toBeFalsy();
    expect(libraryManagerALibrarianB.hasRole("manager", "a")).toBeTruthy();
    expect(libraryManagerALibrarianB.hasRole("librarian", "a")).toBeTruthy();
    expect(libraryManagerALibrarianB.hasRole("manager", "b")).toBeFalsy();
    expect(libraryManagerALibrarianB.hasRole("librarian", "b")).toBeTruthy();
  });
});
