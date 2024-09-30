import { LightningElement, wire } from 'lwc';
import GetAccountContacts from '@salesforce/apex/GetAccountContactsForGrid.GetAccountContacts'

const columns = [{
    type: 'url',
    fieldName: 'recId',
    label: 'Name',
    sortable : true,
    typeAttributes: {label: { fieldName: 'Name'}, target : "_blank"},
},   
{    type: 'text',
    fieldName: 'Industry',
    label: 'Industry',
    sortable: true,
},
{    type: 'text',
    fieldName: 'FirstName',
    label: 'FirstName',
},
{
    type: 'text',
    fieldName: 'LastName',
    label: 'LastName',
    
}]

export default class GridAccountContactTable extends LightningElement {
    gridColumns = columns;
    gridData = [];
    tempData = [];

    @wire(GetAccountContacts)
      getAccsContatc(result){
        if(result.data){  
            let tableData = [];  
            let tempData = result.data;
            console.log('data----',JSON.stringify(tempData));
            tempData.forEach(async ele => {             
            let childCons = await this.modifyCons(ele.accRecord.Contacts);   
            let tempObj  =  {...ele.accRecord,'recId': '/'+ele.accRecord.Id,'_children': childCons}
            tableData.push(tempObj);
            });
            this.gridData = tableData;  
            console.log('griddata----> ',tableData);  

        }
        if(result.error){
            console.log('error----',error);
        }
    }

    async modifyCons(Obj){
        console.log('test inside');
        let listObjs = [];
        //console.log('---->',Obj,'type ', typeof Obj);
        let tempObj = {}
        for(let k in Obj){
            if(Obj[k]!==null & Obj[k]!==undefined){  
                tempObj = {...Obj[k], recId : '/'+Obj[k].Id};
                //console.log('inside loop',JSON.stringify(tempObj));
                listObjs.push(tempObj)
            }
        } 
        console.log('temp OBj--- return',JSON.stringify(listObjs));
        return listObjs;       
    }

}