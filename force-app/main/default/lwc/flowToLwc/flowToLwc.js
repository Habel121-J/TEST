import { LightningElement,api } from 'lwc';

const columns =[{label : 'Name', fieldName: 'conlink',type : 'url', typeAttributes : { label : {fieldName : 'Name'}, target: '_blank', value : {fieldName : 'conlink'} }},
                {label : 'Title', fieldName: 'Title',type : 'text'},
                {label : 'Email', fieldName : 'Email', type: 'email'}];

export default class FlowToLwc extends LightningElement {

    @api ConList;
    columns = columns;
    tableData = []

    generateLink(tempData){
        console.log('tempdata',JSON.stringify(tempData));
        let tempArry = []
         tempArry = tempData.map(ele => {
           let obj = {...ele, conlink : '/'+ ele.Id}
           return obj;
        });
        console.log('tempArry',JSON.stringify(tempArry));
        this.tableData = tempArry
        
    }

    connectedCallback(){
       console.log('test from flowdata table',JSON.stringify(this.ConList));
       this.generateLink(this.ConList)
        //console.log('datalwctoflow---',JSON.stringify(this.ConList));
    }
    

}