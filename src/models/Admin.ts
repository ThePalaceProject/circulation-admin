import { AdminRoleData } from "../interfaces";

export default class Admin {
   roles: AdminRoleData[];
   private systemAdmin: boolean = false;
   private sitewideLibraryManager: boolean = false;
   private sitewideLibrarian: boolean = false;
   private manager: boolean = false;
   private libraryRoles: {[library: string]: string} = {};

   constructor(roles: AdminRoleData[]) {
     this.roles = roles;
     for (const role of this.roles) {
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