import {LightningElement,wire} from 'lwc';
import {getObjectInfo } from "lightning/uiObjectInfoApi";
import ACCOUNT_OBJECT from "@salesforce/schema/Account";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import CodeField from "@salesforce/schema/Account.Code_of_Conduct__c";

export default class ParnetPicklist extends LightningElement {

    statusOptions = [];
    accountDefaultRecodTypeId;
    childData = ''

    @wire(getObjectInfo,{ objectApiName: ACCOUNT_OBJECT})
    accountMetadata({data,error}){
        if(data){
            console.log('data---',JSON.stringify(data.defaultRecordTypeId));    
            this.accountDefaultRecodTypeId = data.defaultRecordTypeId;
        }
        if(error){
            console.log('error---',JSON.stringify(error));
        
        }
    }

    handleChange(event){
        console.log('event.target.value');
        this.childData  = event.target.value
    }

    @wire(getPicklistValues, {recordTypeId: "$accountDefaultRecodTypeId", fieldApiName: CodeField})
    getCodeValues({data,error}){
    if(data){
        console.log('pcilistvalues--->',JSON.stringify(data));
        this.statusOptions = data.values      
        console.log('statusoptions--->',JSON.stringify(this.statusOptions));

    } if(error){
      console.log('error---->',error);
    }
  }

    



}