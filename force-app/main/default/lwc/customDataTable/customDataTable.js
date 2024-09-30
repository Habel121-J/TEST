import { LightningElement,api,wire } from 'lwc';
import fetchContactRecords from '@salesforce/apex/FetchContacts.fetchContactRecords'
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';

const columns = [{ type: 'url', label: 'Name', fieldName: 'Name'},
{ type: 'email', label: 'Email', fieldName: 'Email',typeAttribute : { icon : 'Utility:email'}},
{ type: 'number', label: 'Phone', fieldName: 'Phone'},
{ type: 'text', label: 'Status', fieldName: 'Status__c' }]
const k =1;
let a = () =>{

}

export default class CustomDataTable extends LightningElement {

   @api channelName = '/event/ContactEvent__e';   
   tableHeader = columns;
   tableData = [];

   async connectedCallback(){
      try{    
         this.handleSubscribe();         
         this.fetchApexData()
         this.registerErrorListener();
         
      }catch(error){
         console.log('ERROR LOADING:',error);
         
      }      
   }

   runOnce = false;
   renderedCallback(){
      console.log('rendered');
      if(!this.runOnce){
         this.handleSubscribe(); 
         this.runOnce = !this.runOnce;
      }
   }
    fetchApexData(){      
      console.log('asdf');
      fetchContactRecords()
            .then(async result => {
               let tableData = [...result];
               console.log('inside result');
               this.tableData = await this.buildDynamicData(tableData)                                   
            })
            .catch(error => {
               console.log('ERROR--->',error);
            })
   }  

    messageCallback =  (response) => {
      try {
         //const self = this;
         console.log('New message received:', JSON.stringify(response));
         this.fetchApexData();         
      }catch (error) {
         console.log(error.message);
      }
   };

   handleSubscribe(){
      // Callback invoked whenever a new event message is received     
      // Invoke subscribe method of empApi. Pass reference to messageCallback 
      subscribe(this.channelName, -1, this.messageCallback).then((response) => {
          // Response contains the subscription information on subscribe call
          console.log(
              'Subscription request sent to: ',
              JSON.stringify(response.channel)
          );   
          //this.subscription = response;          
      });
   }

      registerErrorListener() {
         // Invoke onError empApi method
         onError((error) => {
            console.log('Received error from server: ', JSON.stringify(error));
            // Error contains the server-side error
         });
      }

   //TO modify data in req format to fit in table
   async buildDynamicData(tableData) {
      let columns = this.tableHeader.map(e => e.fieldName)
      try {            
            let modArry =  tableData.map(ele => {
            //console.log('eachobj--', ele);
            let modObj = {...ele }
            delete modObj.Id;
            
            for(let i in columns) {
               //console.log('keys-', columns[i]);
               if(!Object.hasOwn(ele, columns[i])) {
                  //console.log('missing key---', columns[i]);
                  modObj[columns[i]] = ""; //modObj.colums[i] didn't work
               }
            }
               return {Id: ele.Id, arryOfData: Object.values(modObj)}
            })
           return modArry;
           
      } catch(error) {
         console.log('ERROR LOADING: ', error.message);  
      }
      
   }
}