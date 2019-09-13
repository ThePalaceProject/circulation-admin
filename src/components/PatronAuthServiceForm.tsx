import * as React from "react";
import EditableInput from "./EditableInput";
import { Button, Form } from "library-simplified-reusable-components";
import { clearForm } from "../utils/sharedFunctions";
import { PatronAuthServiceData, PatronAuthServicesData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";


export default class PatronAuthServiceForm<T extends PatronAuthServicesData> extends ServiceEditForm<T> {
  constructor(props) {
    super(props);
  }

  

}
