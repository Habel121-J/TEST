import { LightningElement,api } from 'lwc';

export default class ChildComponent extends LightningElement {
    @api messageFromParent
    Alpha =false
    Beta =false
    Bravo = false

    renderedCallback(){
        if(this.messageFromParent =='Alpha'){
            console.log('inside conditional alpha');
            this.Alpha = true;
            this.Beta = false;
            this.Bravo = false;
        }else if(this.messageFromParent=='Beta'){
            console.log('inside conditional beta');
            this.Beta = true;
            this.Alpha = false;
             this.Bravo = false;
    
        }else if(this.messageFromParent=='Bravo'){
            console.log('inside conditional bravo');
            this.Bravo = true;
            this.Alpha = false;
            this.Beta = false
    
        }
    }
    
    connectedCallback(){
       console.log('Test from Child');
      
    }
    
  



}