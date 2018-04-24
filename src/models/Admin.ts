import { AdminRoleData } from "../interfaces";

export default class Admin {
  roles: AdminRoleData[];
  email: string | null = null;
  private systemAdmin: boolean = false;
  private sitewideLibraryManager: boolean = false;
  private sitewideLibrarian: boolean = false;
  private manager: boolean = false;
  private libraryRoles: {[library: string]: string} = {};

  constructor(roles: AdminRoleData[], email?: string) {
    this.roles = roles;
    this.email = email;
    for (const role of roles) {
      switch (role.role) {
        case "system": {
          this.systemAdmin = true;
        }
        case "manager-all": {
          this.sitewideLibraryManager = true;
          this.manager = true;
        }
        case "librarian-all": {
          this.sitewideLibrarian = true;
          break;
        }
        case "manager": {
          this.manager = true;
          this.libraryRoles[role.library] = "manager";
          break;
        }
        case "librarian": {
          this.libraryRoles[role.library] = "librarian";
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  hasRole(role: string, library?: string) {
    if (this.isSystemAdmin()) {
      return true;
    }
    if (role !== "system" && this.isSitewideLibraryManager()) {
      return true;
    }
    if (role === "librarian-all" && this.isSitewideLibrarian()) {
      return true;
    }
    if (role === "manager" && this.isLibraryManager(library)) {
      return true;
    }
    if (role === "librarian" && this.isLibrarian(library)) {
      return true;
    }
    return false;
  }

  isSystemAdmin() {
    return this.systemAdmin;
  }

  isSitewideLibraryManager() {
    return this.sitewideLibraryManager;
  }

  isSitewideLibrarian() {
    return this.sitewideLibrarian;
  }

  isLibraryManager(library: string) {
    return this.sitewideLibraryManager || this.libraryRoles[library] === "manager";
  }

  isLibrarian(library: string) {
    return this.isLibraryManager(library) || this.sitewideLibrarian || this.libraryRoles[library] === "librarian";
  }

  isLibraryManagerOfSomeLibrary() {
    return this.manager;
  }
};