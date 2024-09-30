import { LightningElement,wire } from 'lwc';
import getUserData from '@salesforce/apex/UsersCallout.getUserData'
            



export default class GetUser extends LightningElement {

    userData = [];
    loadTable = false;
    page = 1;
    per_page = 4;
    disableNext =false;
    showButtons = false;
    disablePrevious = true;

       f= function getData(page, per_page){
        console.log('inside function');
        getUserData({one:this.page,two:this.per_page})   
        .then(result =>{
            let response = JSON.parse(result);
            this.userData = response.data;
            this.loadTable = true;
            
        }).catch(error =>{
            console.log('error',error);
        })
        
            
        }

    
    handleClick(){     
        
        getUserData({one:this.page, two:this.per_page})   
        .then(result =>{
            let response = JSON.parse(result);
            this.userData = response.data;
            this.loadTable = true;
            this.showButtons = true;
                      
        }).catch(error =>{
            console.log('error',error);
        })
        
            
    }

    hanldeNext(){
        this.page++;
        this.disablePrevious = false;

        this.getData(this.page,this.per_page);

        if(this.page==3){
            
            this.disableNext = true;

        }
        
       getUserData({one:this.page,two:this.per_page})   
        .then(result =>{
            let response = JSON.parse(result);
            this.userData = response.data;
            this.loadTable = true;
            
        }).catch(error =>{
            console.log('error',error);
        })
        
    }

    hanldePrevious(){
        
        this.page--;
        if(this.page==1){
            this.disablePrevious = true;
            this.disableNext = false;
            
        }
        
        getUserData({one:this.page,two:this.per_page})   
        .then(result =>{
            let response = JSON.parse(result);
            this.userData = response.data;
            this.loadTable = true;
           
        }).catch(error =>{
            console.log('error',error);
        })

    }
    


}