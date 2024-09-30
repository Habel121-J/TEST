import { LightningElement, api } from 'lwc';
import getAccCons from '@salesforce/apex/GetAccountRelatedContacts.getAccCons';
import handleUnassignAndCreate from '@salesforce/apex/GetAccountRelatedContacts.handleUnassignAndCreate';
import searchCons from '@salesforce/apex/GetAccountRelatedContacts.searchCons';
import dynamicFields from '@salesforce/apex/GetAccountRelatedContacts.dynamicFields';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation'


export default class ContactDetails extends NavigationMixin(LightningElement) {

    @api recordId;
    @api Fields = '';
    @api objName;
    columns = [];
    openModal = false;
    openContactForm = false;
    conData = [];
    showFoot = true;
    searchquery = '';
    searchResults = [];
    dataTable = [];
    isSearch = false;
    checkRows = [];
    isAdd = false;
    isCreate = true;
    dynamicCols = [];
    dynamicInputs = [];
    TableData = [];
    ShowTable = false;
    fieldNames = [];

    async connectedCallback() {
        try {
            let dynamicCols = await this.fetchFields(this.Fields, this.objName);
            this.columns = dynamicCols;
            let fieldApiNames = dynamicCols.map(c => c.fieldName);
            this.fieldNames  = fieldApiNames;
            console.log('field', JSON.stringify(fieldApiNames));
            this.dynamicCols = [...dynamicCols, { label: 'Unassign Contact', fieldName: 'unassign', type: 'button-icon' }];
            this.conData = await this.getData(fieldApiNames, this.objName);
            let arry = this.conData
            this.TableData = await this.createDynamicData(arry, fieldApiNames)
        } catch (error) {
            console.log('ERROR LOADING: ', error.message);
        }
    }
     async createDynamicData(arry, fields) {
        try{
               var newArry = await arry.map(ele => {
                var modObj = { ...ele };
                for (let k in fields) {
                    if (!Object.hasOwn(ele, fields[k])) {
                        modObj[fields[k]] = ' ';
                    }
                }
                return modObj;
            })
            
            var DynamicData = newArry.map(obj => {
                let newobj = {};
                var updatedObj = { ...obj };
                newobj['Id'] = updatedObj.Id,
                delete updatedObj['Id'];
                newobj['values'] = Object.values(updatedObj);
                return newobj;
            });
            console.log('Dynamic Data---', JSON.stringify(DynamicData));
            return DynamicData;
    
        }
        catch(error){
            console.log('errror---',error.message);
        }
        

    }
    
    async fetchFields(fields, objectApiName) {
        let fieldsResult = [];
        await dynamicFields({ fields: fields, objName: objectApiName })
            .then(result => {
                for (let ele of result) {
                    let col = {};
                    col["label"] = ele.label;
                    col["fieldName"] = ele.fieldname;
                    col['isName'] = ele.fieldname.toLowerCase() == 'name' ? true : false;
                    let type = ele.type.toLowerCase();
                    col["type"] = type === 'string' ? 'text' : type === 'boolean' ? 'checkbox' : type;
                    fieldsResult.push(col);
                }
            }).catch(error => {
                console.log('error-- ', error);
            });
        return fieldsResult;
    }

    async getData(fields, objectApiName) {
        let data = [];
        await getAccCons({ fields: fields, objName: objectApiName, recordId: this.recordId })
            .then(result => {
                data = [...result];
            })
            .catch(error => {
                console.log('error--', error);
            })
        return data;
    }
    coulumns = [];

    handleFocus(event) {
        this.isCreate = event.target.label === 'Add Existing';
        this.dataTable = [];
        this.ShowTable = false;

    }
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'

        }));
    }
     async hanldeAddOrCreate(event) {
        if (event.target.title === 'Add') {
            let selectedRecords = this.template.querySelector("lightning-datatable").getSelectedRows();
            this.openModal = false;
            let cont = {};
            console.log('selected rows',JSON.stringify(selectedRecords));
            handleUnassignAndCreate({ cont: cont, recordId: this.recordId, conList: selectedRecords})
                .then(async result => {
                    let Data = [];
                    selectedRecords.forEach(ele =>{
                        console.log('ele',ele);
                        delete (ele.Name); 
                        console.log(ele);
                        Data.push(ele);
                    })
                    let data = await this.createDynamicData(Data,this.fieldNames);
                    console.log('----data ',JSON.stringify(data));
                    this.TableData = [...this.TableData,...data]
                    this.showToast('Added successfully!', 'Contact linked succesfully', 'success');

                }).catch(err => { 
                    console.log('errr---',err);
                    this.showToast('Error while adding', 'Unable to link contact!', 'error');
                })
        }
        else if (event.target.title === 'Create') {
            if (this.checkValidation()) {
                console.log('inisde if ');
                this.openModal = false;
                let con = [];
                   handleUnassignAndCreate({ cont: this.newRecord, recordId: this.recordId, conList: con })
                    .then(async result => {
                        let temparry = [];
                        this.newRecord.Id = result.Id;
                        temparry.push(this.newRecord)
                        console.log('temparry',JSON.stringify(temparry));
                        let data = await this.createDynamicData(temparry,this.fieldNames);
                        console.log('data to table---',JSON.stringify(data));
                        this.TableData = [...this.TableData, ...data];
                        this.showToast('Added successfully!', 'Contact linked succesfully', 'success');
                        this.newRecord = {};

                    })
                    .catch(error => {
                        console.log('erorr', JSON.stringify(error.message()));

                    })

            }
        }
    }

    handleUnassign(event) {
        console.log('inside unassign');
        let conId = event.currentTarget.dataset.id;
        console.log('inside conId', conId);
        let contact = {
            'SObjectType': 'Contact',
            'Id': event.currentTarget.dataset.id,
            'AccountId': null
        }
        let con = [];
        console.log('inside unassign');
        handleUnassignAndCreate({ cont: contact, recordId: null, conList: con })
            .then(result => {
                let newArr = this.TableData.filter(c => (c.Id != conId));
                this.TableData = newArr;
            }).catch(error => {
               
            })
    }

    isOnce = true;
    handleOpenModal() {
        if (this.isOnce) {
            this.dynamicCols.forEach(col => {
                if (col.fieldName && col.fieldName !== 'unassign') {
                    col.type = col.type.toLowerCase();
                    col.type = col.type === 'string' ? 'text' : col.type;
                    this.dynamicInputs.push(col);
                    this.isOnce = false;
                } else {

                }
            });
        }
       this.openModal = true;

    }

    handleCloseModal() {
        this.openModal = false;
        this.openContactForm = false;
        this.ShowTable = [];
    }

    openForm() {
        this.openContactForm = true;
    }

    newRecord = {};
    handleChange(event) {
        if(event.target.dataset.name=='IsCheck__c'){
            console.log('insidee----chckbox',event.target.checked);

            this.newRecord[event.target.dataset.name] = event.target.checked ? event.target.checked : false;

        }else if(event.target.dataset.name!=='IsCheck__c'){
            this.newRecord[event.target.dataset.name] = event.target.value;
            console.log('new reocrd', JSON.stringify(this.newRecord));
        }
        console.log('newrecord',JSON.stringify(this.newRecord));
    }

    checkValidation() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach(element => {
            if (!element.checkValidity()) {
                element.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }
    searchKeyword(event) {
        let searchTerm = event.target.value;
        if (searchTerm.length >= 3) {
            searchCons({ searchterm: searchTerm, Id: this.recordId })
                .then(result => {
                    this.searchResults = result;
                    this.isSearch = this.searchResults.length >= 0;
                    this.noData = this.searchResults.length == 0;
                }).catch(err => {

                })
        } else if (searchTerm.length === 0 || searchTerm.length < 3) {
            this.isSearch = false;
            this.noData = false;
        }

    }

    allIds = [];
    handleSelectedItem(event) {
        let selectedId = event.currentTarget.dataset.id;
        this.isSearch = false;
        let selectedItem = this.searchResults.find(ele => ele.Id === selectedId)
        this.ShowTable = true;
        this.checkRows = [...this.checkRows, selectedId];
        if (!this.allIds.includes(selectedId)) {
            this.dataTable = [...this.dataTable, selectedItem];
            this.allIds.push(selectedId);
        } else {
            console.log('Cannot add duplicates');
        }
        this.template.querySelector('lightning-input[data-id="clear"]').value = null;

    }
    handleSearchBlur() {
        setTimeout(() => {
            this.isSearch = false;
        }, "500");
    }

    handleTabChange() {
        this.isAdd = true;
    }

    navigateToContact(evt) {
        let Id = evt.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: Id,
                objectApiName: 'Contact',
                actionName: 'view',

            },
        });

    }
}