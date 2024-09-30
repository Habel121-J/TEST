import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import upsertMetadata from '@salesforce/apex/CustomMetadata_Service.handleUpsert';
import getMetadataRecord from '@salesforce/apex/CustomMetadata_Helper.getMetadataRecord';
import getMetadataTypes from '@salesforce/apex/CustomMetadata_Helper.getCustomMetadataTypes';
import checkDeploymentStatus from '@salesforce/apex/CustomMetadata_Service.checkDeploymentStatus';

const TEXT_DEFAULT = 'slds-text-color_default';
const TEXT_SUCCESS = 'slds-text-color_success';
const TEXT_ERROR = 'slds-text-color_error';

export default class customMetadataEditor extends LightningElement {
    @api metadataApiName;
    @api recordId;
    @api metadataTypes = [];

    sortBy;
    sortDirection;

    data = [];
    columns = [];
    isSpinner = false;
    draftValues = [];
    columnsForNew = [];
    openModal = false;

    @wire(getMetadataTypes,({}))
    getCustomMdtTypes({data, error}){
        if(data){
            this.metadataTypes = data.map(d =>{
                let obj = {label : d.label, value : d.fieldApiName};
                return obj;
            }); 
            this.template.querySelector(".mdtDropdown").disabled = false;
        }else if(error){
            console.log('Error: ', error);
        }
    }

    connectedCallback(){
        
    }

    renderedCallback(){

    }
    
    async handleMetaRecordChange(event){
        this.isSpinner = true;
        this.metadataApiName = event.target.value;
        await getMetadataRecord({ metadataName : this.metadataApiName})
        .then(result =>{
            if(result){
                let cols = [];
                let colsForNew = [];
                const columnsToHide = ['id', 'developername', 'language', 'namespaceprefix', 'qualifiedapiname', 'masterlabel'];
                var statusCol = {label : 'Status', fieldName : 'Status',initialWidth:100, type : 'button', typeAttributes: {label: { fieldName: 'Status' },title: { fieldName: 'message' },
                variant: 'base',
                class: 'text-button status'/* cellAttributes : {class:{fieldName : 'statusClass'}} */}}
                result.fieldDef.forEach(field =>{
                    if(!columnsToHide.includes(field.fieldName.toLowerCase())){ 
                        console.log('FIELD> ', JSON.stringify(field));
                        cols.push(
                            {
                                label : field.label, 
                                fieldName : field.fieldName, 
                                type : field.type !== 'REFERENCE' ? field.type.toLowerCase() : '', 
                                editable : (field.label !== 'Label' && field.type !== 'REFERENCE')  ? true : false, 
                                sortable : field.type === 'STRING' ? true : (field.type === 'DOUBLE' || field.type === 'NUMBER') ? true : field.type === 'BOOLEAN' ? true : false,
                                hideDefaultActions : true,
                                displayReadOnlyIcon : (field.label === 'Label')
                            }   
                        );
                        colsForNew.push(
                            {
                                label : field.label,
                                type : field.type === 'BOOLEAN' ? 'checkbox' : field.type === 'REFERENCE' ? 'search' : field.type.toLowerCase(),
                                required : field.label === 'Label' ? true : field.type !== 'BOOLEAN' ? field.isRequired : false
                            }
                        )
                    }
                });
                this.columns = [statusCol,...cols];
                this.columnsForNew = [...colsForNew];
                
                this.data = result.records.map(record => {return record});
            }else{
                
            }
        }).catch(error =>{
            console.log('error: ',JSON.stringify(error));
        })
        this.isSpinner = false;
        this.template.querySelector(".newBtn").disabled = false;
    }

    async handleGridRefresh(event){
        if(event.currentTarget.dataset.name){
            await this.handleMetaRecordChange({target:{value:event.currentTarget.dataset.name}});
        }
    }
    checkProperties(object){
        for(let key in object){
            if(object[key] !== null && object[key] !== ''){
                return false;
            }
            return true;
        }
    }
    async handleUpdate(event){
        this.isSpinner = true;
        let st = this.template.querySelector(".status");
        console.log(st);
        try {
            let fieldWithValues = [];
            event.detail.draftValues.slice().map((draftValue) => {
                fieldWithValues.push(draftValue);
            });
            // console.log(JSON.stringify(fieldWithValues));   
            this.draftValues = [];
            let data = [...this.data];
            for(let f of fieldWithValues){
                let item = this.data.find(d => d.Id === f.Id);
                console.log('f> ',item);
                // if(item.type === 'double' || item.type === 'number'){   
                    for(let key in f){
                        console.log(f[key]);
                        if(f[key] === "" || f[key] === ''){
                            f[key] = null;
                        }
                    }
                // }
                console.log('f>> ',f);
                this.refreshCell(data, {...item, Status:'SAVING', statusClass:`${TEXT_DEFAULT} slds-text-title_caps slds-text-heading_large`});
                let jobId = await this.upsertMetadata(item.DeveloperName, item.Label, f);
                var {status, errorMessage} = await this.checkDeployment(jobId);
                status = status.toLowerCase();
                for(let i=1;i<=50;i++){
                    if(status === 'succeeded'){
                        for(let k in f){
                            if(f[k] !== item[k])
                                item[k] = f[k];
                        }
                        item = {...item, Status:'SAVED', statusClass:`${TEXT_SUCCESS} slds-text-title_caps slds-text-heading_large`, message:'Record saved successfully'};
                        await this.refreshCell(data, item);
                        break;
                    }else if(status === 'pending' || status === 'inprogress'){
                        var {status, errorMessage} = await this.checkDeployment(jobId);
                        item = {...item, Status:'SAVING', statusClass:`${TEXT_DEFAULT} slds-text-title_caps slds-text-heading_large`, message:'Please wait...'};
                        await this.refreshCell(data, item);
                    }else if(status === 'failed'){
                        item = {...item, Status:`ERROR`, statusClass:`${TEXT_ERROR} slds-text-title_caps slds-text-heading_large`, message:errorMessage};
                        await this.refreshCell(data, item);
                        break;
                    }
                }
            }
        } catch (error) {
            console.log('SAVE ERROR: ',error.message);
            this.showToast('Save Error', error.message, 'error');
        }
        this.isSpinner = false;
    }

    async refreshCell(data, item){
        data = await data.map(d =>{
            if((d.Id && d.Id === item.Id) || d.isNew)
                return item;
            else
                return d;
        });
        this.data = [...data];
    }

    async upsertMetadata(mdtDevName, mdtLabel, fieldWithValue){
        let d = [fieldWithValue];
        var res;
        await upsertMetadata({fullName : this.metadataApiName, mdtDevName : mdtDevName, label : mdtLabel, fieldWithValues : JSON.stringify(d)})
        .then(result =>{
            res = result;
        }).catch(error =>{
            console.log('error: ',error);
        });
        return res;
    }

    /**
     * @description - For Sorting Data table
     * @param  event 
     * @var - sortBy,sortDirection
     */
    handleSort(event){
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        let data = [...this.data];
        let keyValue = (a) => {
            if(typeof a[this.sortBy] === 'string')
                return a[this.sortBy].toLowerCase();
            else
                return a[this.sortBy];
        }

        let isReverse = this.sortDirection === 'asc' ? 1 : -1;

        data.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });

        this.data =  [...data]
    }

    showToast(type, message, variant){
        this.dispatchEvent(new ShowToastEvent({
            title : type,
            message : message,
            variant : variant,
            mode : 'dismissible'
        }));
    }

    handleNew(){
        this.openModal = true;
    }

    closeModal(){
        this.openModal = false;
    }

    async handleCreate(){   
        try {
            var inputEle = this.template.querySelectorAll("lightning-input");
            let obj = {};
            let label;
            for(let input of inputEle){
                if(input && input.id){
                    if(!input.checkValidity()){
                        input.reportValidity();
                        return;
                    }
                    let eleId = input.id.includes('-') ? input.id.split('-')[0] : input.id;
                    let columns = this.columns;
                    label = eleId === 'Label' ? input.value : label;
                    let d = columns.map(column =>{
                        if(eleId == column.label && eleId !== 'Label'){
                            obj[[column.fieldName]] = column.type !== 'boolean' ? ((column.type === 'percent' || column.type === 'double' || column.type === 'number') && (input.value == "")) ? null : input.value : input.checked;
                            return obj;
                        }   
                    });
                }
            }
            this.closeModal();
            let devName = label.includes(' ') ? label.replaceAll(' ', '_') : label;
            let jobId = await this.upsertMetadata(devName, label, obj);
            obj.Label = label;
            let data = [...this.data, {...obj, isNew:true}];
            await this.refreshCell(data, obj);
            var {status, errorMessage}  = await this.checkDeployment(jobId);
            for(let i=1;i<=50;i++){
                if(status === 'pending' || status === 'inprogress'){
                    var {status, errorMessage} = await this.checkDeployment(jobId);
                    obj = {...obj, Status:'SAVING', statusClass:`${TEXT_DEFAULT} slds-text-title_caps slds-text-heading_large`};
                    await this.refreshCell(data, obj);
                }else if(status === 'failed'){
                    obj = {...obj, Status:`ERROR : ${errorMessage}`, statusClass:`${TEXT_ERROR} slds-text-title_caps slds-text-heading_large`, message:errorMessage};
                    await this.refreshCell(data, obj);
                    break;
                }else if(status === 'succeeded'){
                    obj = {...obj, Status:'SAVED', statusClass:`${TEXT_SUCCESS} slds-text-title_caps slds-text-heading_large`};
                    await this.refreshCell(data, obj);
                    break;
                }
            }
        } catch (error) {
            console.log('ERROR Creating: ', error.message);
        }
    }

    async checkDeployment(jobId){
        var response = {};
        await checkDeploymentStatus({deployRequestId : jobId})
        .then(result =>{
            console.log('result: ', JSON.parse(JSON.stringify(result)));
            result.status = result.status.toLowerCase();
            Object.assign(response, result);
        }).catch(error =>{
            console.log('error: '+ error);
        });
        return response;
    }
}