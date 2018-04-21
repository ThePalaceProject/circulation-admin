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
});