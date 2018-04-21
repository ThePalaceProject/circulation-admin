import { AdminRoleData } from "../interfaces";

export default class Admin {
   roles: AdminRoleData[];

   constructor(roles: AdminRoleData[]) {
     this.roles = roles;
   }

   isSystemAdmin() {
     for (const role of this.roles) {
       if (role.role === "system") {
         return true;
       }
     }
     return false;
   }

   isSitewideLibraryManager() {
     if (this.isSystemAdmin()) {
       return true;
     }
     for (const role of this.roles) {
       if (role.role === "manager-all") {
         return true;
       }
     }
     return false;
   }

   isSitewideLibrarian() {
     if (this.isSitewideLibraryManager()) {
       return true;
     }
     for (const role of this.roles) {
       if (role.role === "librarian-all") {
         return true;
       }
     }
     return false;
   }

   isLibraryManager(library: string) {
     if (this.isSitewideLibraryManager()) {
       return true;
     }
     for (const role of this.roles) {
       if (role.role === "manager" && role.library === library) {
         return true;
       }
     }
     return false;
   }

   isLibrarian(library: string) {
     if (this.isSitewideLibrarian()) {
       return true;
     }
     if (this.isLibraryManager(library)) {
       return true;
     }
     for (const role of this.roles) {
       if (role.role === "librarian" && role.library === library) {
         return true;
       }
     }
     return false;
   }

   isLibraryManagerOfSomeLibrary() {
     if (this.isSitewideLibraryManager()) {
       return true;
     }
     for (const role of this.roles) {
       if (role.role === "manager") {
         return true;
       }
     }
     return false;
   }
};