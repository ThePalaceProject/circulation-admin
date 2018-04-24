import { expect } from "chai";

import Admin from "../Admin";

describe("Admin", () => {

  const systemAdmin = new Admin([{ "role": "system" }]);
  const sitewideLibraryManager = new Admin([{ "role": "manager-all" }]);
  const sitewideLibrarian = new Admin([{ "role": "librarian-all" }]);
  const libraryManagerA = new Admin([{ "role": "manager", "library": "a" }]);
  const librarianA = new Admin([{ "role": "librarian", "library": "a" }]);
  const libraryManagerB = new Admin([{ "role": "manager", "library": "b" }]);
  const librarianB = new Admin([{ "role": "librarian", "library": "b" }]);
  const libraryManagerASitewideLibrarian = new Admin([{ "role": "librarian-all" },
                                                      { "role": "manager", "library": "a" }]);
  const libraryManagerALibrarianB = new Admin([{ "role": "manager", "library": "a" },
                                               { "role": "librarian", "library": "b" }]);

  it("stores email", () => {
    expect((new Admin([], "email")).email).to.equal("email");
    expect((new Admin([])).email).not.to.be.ok;
  });

  it("identifies system admins", () => {
    expect(systemAdmin.isSystemAdmin()).to.be.ok;
    expect(sitewideLibraryManager.isSystemAdmin()).not.to.be.ok;
    expect(sitewideLibrarian.isSystemAdmin()).not.to.be.ok;
    expect(libraryManagerA.isSystemAdmin()).not.to.be.ok;
    expect(librarianA.isSystemAdmin()).not.to.be.ok;
    expect(libraryManagerB.isSystemAdmin()).not.to.be.ok;
    expect(librarianB.isSystemAdmin()).not.to.be.ok;
    expect(libraryManagerASitewideLibrarian.isSystemAdmin()).not.to.be.ok;
    expect(libraryManagerALibrarianB.isSystemAdmin()).not.to.be.ok;
  });

  it("identifies sitewide library managers", () => {
    expect(systemAdmin.isSitewideLibraryManager()).to.be.ok;
    expect(sitewideLibraryManager.isSitewideLibraryManager()).to.be.ok;
    expect(sitewideLibrarian.isSitewideLibraryManager()).not.to.be.ok;
    expect(libraryManagerA.isSitewideLibraryManager()).not.to.be.ok;
    expect(librarianA.isSitewideLibraryManager()).not.to.be.ok;
    expect(libraryManagerB.isSitewideLibraryManager()).not.to.be.ok;
    expect(librarianB.isSitewideLibraryManager()).not.to.be.ok;
    expect(libraryManagerASitewideLibrarian.isSitewideLibraryManager()).not.to.be.ok;
    expect(libraryManagerALibrarianB.isSitewideLibraryManager()).not.to.be.ok;
  });

  it("identifies sitewide librarians", () => {
    expect(systemAdmin.isSitewideLibrarian()).to.be.ok;
    expect(sitewideLibraryManager.isSitewideLibrarian()).to.be.ok;
    expect(sitewideLibrarian.isSitewideLibrarian()).to.be.ok;
    expect(libraryManagerA.isSitewideLibrarian()).not.to.be.ok;
    expect(librarianA.isSitewideLibrarian()).not.to.be.ok;
    expect(libraryManagerB.isSitewideLibrarian()).not.to.be.ok;
    expect(librarianB.isSitewideLibrarian()).not.to.be.ok;
    expect(libraryManagerASitewideLibrarian.isSitewideLibrarian()).to.be.ok;
    expect(libraryManagerALibrarianB.isSitewideLibrarian()).not.to.be.ok;
  });

  it("identifies library managers", () => {
    expect(systemAdmin.isLibraryManager("a")).to.be.ok;
    expect(sitewideLibraryManager.isLibraryManager("a")).to.be.ok;
    expect(sitewideLibrarian.isLibraryManager("a")).not.to.be.ok;
    expect(libraryManagerA.isLibraryManager("a")).to.be.ok;
    expect(librarianA.isLibraryManager("a")).not.to.be.ok;
    expect(libraryManagerB.isLibraryManager("a")).not.to.be.ok;
    expect(librarianB.isLibraryManager("a")).not.to.be.ok;
    expect(libraryManagerASitewideLibrarian.isLibraryManager("a")).to.be.ok;
    expect(libraryManagerALibrarianB.isLibraryManager("a")).to.be.ok;

    expect(systemAdmin.isLibraryManager("b")).to.be.ok;
    expect(sitewideLibraryManager.isLibraryManager("b")).to.be.ok;
    expect(sitewideLibrarian.isLibraryManager("b")).not.to.be.ok;
    expect(libraryManagerA.isLibraryManager("b")).not.to.be.ok;
    expect(librarianA.isLibraryManager("b")).not.to.be.ok;
    expect(libraryManagerB.isLibraryManager("b")).to.be.ok;
    expect(librarianB.isLibraryManager("b")).not.to.be.ok;
    expect(libraryManagerASitewideLibrarian.isLibraryManager("b")).not.to.be.ok;
    expect(libraryManagerALibrarianB.isLibraryManager("b")).not.to.be.ok;
  });

  it("identifies librarians", () => {
    expect(systemAdmin.isLibrarian("a")).to.be.ok;
    expect(sitewideLibraryManager.isLibrarian("a")).to.be.ok;
    expect(sitewideLibrarian.isLibrarian("a")).to.be.ok;
    expect(libraryManagerA.isLibrarian("a")).to.be.ok;
    expect(librarianA.isLibrarian("a")).to.be.ok;
    expect(libraryManagerB.isLibrarian("a")).not.to.be.ok;
    expect(librarianB.isLibrarian("a")).not.to.be.ok;
    expect(libraryManagerASitewideLibrarian.isLibrarian("a")).to.be.ok;
    expect(libraryManagerALibrarianB.isLibrarian("a")).to.be.ok;

    expect(systemAdmin.isLibrarian("b")).to.be.ok;
    expect(sitewideLibraryManager.isLibrarian("b")).to.be.ok;
    expect(sitewideLibrarian.isLibrarian("b")).to.be.ok;
    expect(libraryManagerA.isLibrarian("b")).not.to.be.ok;
    expect(librarianA.isLibrarian("b")).not.to.be.ok;
    expect(libraryManagerB.isLibrarian("b")).to.be.ok;
    expect(librarianB.isLibrarian("b")).to.be.ok;
    expect(libraryManagerASitewideLibrarian.isLibrarian("b")).to.be.ok;
    expect(libraryManagerALibrarianB.isLibrarian("b")).to.be.ok;
  });

  it("identifies all library managers", () => {
    expect(systemAdmin.isLibraryManagerOfSomeLibrary()).to.be.ok;
    expect(sitewideLibraryManager.isLibraryManagerOfSomeLibrary()).to.be.ok;
    expect(sitewideLibrarian.isLibraryManagerOfSomeLibrary()).not.to.be.ok;
    expect(libraryManagerA.isLibraryManagerOfSomeLibrary()).to.be.ok;
    expect(librarianA.isLibraryManagerOfSomeLibrary()).not.to.be.ok;
    expect(libraryManagerB.isLibraryManagerOfSomeLibrary()).to.be.ok;
    expect(librarianB.isLibraryManagerOfSomeLibrary()).not.to.be.ok;
    expect(libraryManagerASitewideLibrarian.isLibraryManagerOfSomeLibrary()).to.be.ok;
    expect(libraryManagerALibrarianB.isLibraryManagerOfSomeLibrary()).to.be.ok;
  });

  it("checks for specific roles", () => {
    expect(systemAdmin.hasRole("system")).to.be.ok;
    expect(systemAdmin.hasRole("manager-all")).to.be.ok;
    expect(systemAdmin.hasRole("librarian-all")).to.be.ok;
    expect(systemAdmin.hasRole("manager", "a")).to.be.ok;
    expect(systemAdmin.hasRole("librarian", "a")).to.be.ok;
    expect(systemAdmin.hasRole("manager", "b")).to.be.ok;
    expect(systemAdmin.hasRole("librarian", "b")).to.be.ok;

    expect(sitewideLibraryManager.hasRole("system")).not.to.be.ok;
    expect(sitewideLibraryManager.hasRole("manager-all")).to.be.ok;
    expect(sitewideLibraryManager.hasRole("librarian-all")).to.be.ok;
    expect(sitewideLibraryManager.hasRole("manager", "a")).to.be.ok;
    expect(sitewideLibraryManager.hasRole("librarian", "a")).to.be.ok;
    expect(sitewideLibraryManager.hasRole("manager", "b")).to.be.ok;
    expect(sitewideLibraryManager.hasRole("librarian", "b")).to.be.ok;

    expect(sitewideLibrarian.hasRole("system")).not.to.be.ok;
    expect(sitewideLibrarian.hasRole("manager-all")).not.to.be.ok;
    expect(sitewideLibrarian.hasRole("librarian-all")).to.be.ok;
    expect(sitewideLibrarian.hasRole("manager", "a")).not.to.be.ok;
    expect(sitewideLibrarian.hasRole("librarian", "a")).to.be.ok;
    expect(sitewideLibrarian.hasRole("manager", "b")).not.to.be.ok;
    expect(sitewideLibrarian.hasRole("librarian", "b")).to.be.ok;

    expect(libraryManagerA.hasRole("system")).not.to.be.ok;
    expect(libraryManagerA.hasRole("manager-all")).not.to.be.ok;
    expect(libraryManagerA.hasRole("librarian-all")).not.to.be.ok;
    expect(libraryManagerA.hasRole("manager", "a")).to.be.ok;
    expect(libraryManagerA.hasRole("librarian", "a")).to.be.ok;
    expect(libraryManagerA.hasRole("manager", "b")).not.to.be.ok;
    expect(libraryManagerA.hasRole("librarian", "b")).not.to.be.ok;

    expect(librarianA.hasRole("system")).not.to.be.ok;
    expect(librarianA.hasRole("manager-all")).not.to.be.ok;
    expect(librarianA.hasRole("librarian-all")).not.to.be.ok;
    expect(librarianA.hasRole("manager", "a")).not.to.be.ok;
    expect(librarianA.hasRole("librarian", "a")).to.be.ok;
    expect(librarianA.hasRole("manager", "b")).not.to.be.ok;
    expect(librarianA.hasRole("librarian", "b")).not.to.be.ok;

    expect(libraryManagerB.hasRole("system")).not.to.be.ok;
    expect(libraryManagerB.hasRole("manager-all")).not.to.be.ok;
    expect(libraryManagerB.hasRole("librarian-all")).not.to.be.ok;
    expect(libraryManagerB.hasRole("manager", "a")).not.to.be.ok;
    expect(libraryManagerB.hasRole("librarian", "a")).not.to.be.ok;
    expect(libraryManagerB.hasRole("manager", "b")).to.be.ok;
    expect(libraryManagerB.hasRole("librarian", "b")).to.be.ok;

    expect(librarianB.hasRole("system")).not.to.be.ok;
    expect(librarianB.hasRole("manager-all")).not.to.be.ok;
    expect(librarianB.hasRole("librarian-all")).not.to.be.ok;
    expect(librarianB.hasRole("manager", "a")).not.to.be.ok;
    expect(librarianB.hasRole("librarian", "a")).not.to.be.ok;
    expect(librarianB.hasRole("manager", "b")).not.to.be.ok;
    expect(librarianB.hasRole("librarian", "b")).to.be.ok;

    expect(libraryManagerASitewideLibrarian.hasRole("system")).not.to.be.ok;
    expect(libraryManagerASitewideLibrarian.hasRole("manager-all")).not.to.be.ok;
    expect(libraryManagerASitewideLibrarian.hasRole("librarian-all")).to.be.ok;
    expect(libraryManagerASitewideLibrarian.hasRole("manager", "a")).to.be.ok;
    expect(libraryManagerASitewideLibrarian.hasRole("librarian", "a")).to.be.ok;
    expect(libraryManagerASitewideLibrarian.hasRole("manager", "b")).not.to.be.ok;
    expect(libraryManagerASitewideLibrarian.hasRole("librarian", "b")).to.be.ok;

    expect(libraryManagerALibrarianB.hasRole("system")).not.to.be.ok;
    expect(libraryManagerALibrarianB.hasRole("manager-all")).not.to.be.ok;
    expect(libraryManagerALibrarianB.hasRole("librarian-all")).not.to.be.ok;
    expect(libraryManagerALibrarianB.hasRole("manager", "a")).to.be.ok;
    expect(libraryManagerALibrarianB.hasRole("librarian", "a")).to.be.ok;
    expect(libraryManagerALibrarianB.hasRole("manager", "b")).not.to.be.ok;
    expect(libraryManagerALibrarianB.hasRole("librarian", "b")).to.be.ok;
  });
});