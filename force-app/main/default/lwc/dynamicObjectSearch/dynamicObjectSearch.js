import { LightningElement, api, wire } from 'lwc';
import getRelatedListsInfo from '@salesforce/apex/RelatedListInfo.getRelatedListsInfo'
import createFormFields from '@salesforce/apex/RelatedListInfo.createFormFields'
import getExistingRecords from '@salesforce/apex/RelatedListInfo.getExistingRecords'
import getLabels from '@salesforce/apex/RelatedListInfo.getLabels'
import updateSObjectRecords from '@salesforce/apex/RelatedListInfo.updateSObjectRecords'

export default class DynamicObjectSearch extends LightningElement {

    @api objectApiName;
    @api recordId;
    dropdownList = []
    tempArry = []
    Modal = false;
    InputFields = []
    objName;
    tableHeader = [];
    tableData = [];
    showTable = true;
    isSelected = false;
    IdsToUpdate = []

    
    

    handleChange(event) {
        let seachKey = event.target.value.toLowerCase();
        console.log('----', event.target.value);
        if (seachKey.length >= 3) {
            let m = this.tempArry.map(ele => {
                if(ele.label.toLowerCase().startsWith(seachKey)) {
                    console.log('inside if ');
                    return { label: ele.label, ApiName: ele.ApiName }
                } else {
                    // console.log('inside else',JSON.stringify(ele));
                }
            })
            m = m.filter(ele => ele != null)
            //console.log('---->', JSON.stringify(m));
            this.dropdownList = m.length > 0 ? m : [{ label: 'No Object Found', ApiName: ''}]
        }

    }
    handleButtonClick(event) {
        console.log('objectname----', event.currentTarget.dataset.label);
    }
    handleFocus(){
        this.template.querySelector('.dropdown').classList.add('slds-is-open');
    }
    async handleMouseClick(event) {
        try {
            this.objName = event.currentTarget.dataset.label
            console.log('inside handle mouse click--', event.currentTarget.dataset.label);
            this.template.querySelector('.dropdown').classList.remove('slds-is-open');
            this.InputFields = await createFormFields({ objName: this.objName });
            this.Modal = true;
            console.log('input fileds---', JSON.stringify(this.InputFields));
            getLabels({objectName: this.objName})
                .then((result) => {
                  this.tableHeader=result;
                })
                .catch((error) => {
                    console.log('error----', error);
                })
        } catch (err){
            console.log('error---->', err);
        }

    }

    relatedList;
    @wire(getRelatedListsInfo, {parentObjectApiName: "$objectApiName", searchTerm: null})
    relatedData({ data, error}) {
        try {
            if(data){
                console.log('data---', data);
                this.dropdownList = data;
                this.tempArry = JSON.parse(JSON.stringify(data))
            } else if (error) {
                console.log('error---', JSON.stringify(error));
            }
        } catch(error) {
            console.log('errorcatch---', error);

        }

    }

     onTabClick(){
        console.log('____on Tab Clcik', 'object name--->',this.objName);                
              getExistingRecords({keyTerm :null,objectName: this.objName})
                .then((result) => {
                    console.log('---', JSON.stringify(result));
                    this.buildTableData(result);
                })
                .catch((error) => {
                    console.log('error----', error);
                })

    }

    async buildTableData(result){
        console.log('buildTableData inside =======',result)
        let tempData = result;
        let Data = tempData.map(ele=> {
            let obj = {};
           obj['Id'] = ele.Id;
           delete ele.Id;
           obj['values'] = Object.values(ele);
           return obj;
           
        })
        console.log('MODRARY ___',JSON.stringify(Data));
        this.tableData = Data;
        this.tableData.size() == 0 ? !this.showTable : this.showTable;
    }
    
    handleButton(event){
        let id = event.target.dataset.id;
        let button = this.template.querySelector(`lightning-button-stateful[data-id="${id}"]`)
        button.selected = !button.selected;
        if(button.selected && !this.IdsToUpdate.includes(id)){
            this.IdsToUpdate = [...this.IdsToUpdate, id]
            console.log('From IF---',JSON.stringify(this.IdsToUpdate))

        }else{
            console.log('inside else');
            this.IdsToUpdate = this.IdsToUpdate.filter(ele => ele!== id)
            console.log('Ids From Else---',JSON.stringify(this.IdsToUpdate))    
        }
        
    }
    isOnce =  false;    
    submitDetails(){    
        if(!this.isOnce){
            console.log('insideee----submit');
            this.isOnce = !this.isOnce
            let recordListToUpdate = [];
            recordListToUpdate = this.IdsToUpdate.map(ele => {
                console.log('ele---',ele);
                return {'Id' : ele, 'AccountId' : `${this.recordId}`};
                
            })
            console.log('inside handle submit', JSON.stringify(recordListToUpdate));
            updateSObjectRecords({recList: recordListToUpdate})
        }
    }

    
    closeModal() {
        this.Modal = !this.Modal;
        this.IdsToUpdate = [];
        this.isOnce = !this.isOnce;        

    }

    //method to fetch exisiting records
    recordSearch(event){
        let recordSearch = event.target.value.toLowerCase();
        console.log('----', event.target.value);
        if(recordSearch.length >= 3) {
            getExistingRecords({keyTerm: recordSearch, objectName: this.objName})
                .then((result) => {
                 console.log('recordSearch records__',result);
                 this.buildTableData(result);
                })
                .catch((error) => {
                    console.log('errorrecordSearch----',error);
                })


        }
    }
}