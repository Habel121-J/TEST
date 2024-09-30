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

        getData(page, per_page){
            console.log('page-- '+page,'per page '+per_page);
            getUserData({one: page,two: per_page})   
            .then(result =>{
                let response = JSON.parse(result);
                this.userData = response.data;
                this.loadTable = true;            
            }).catch(error =>{
                console.log('error',error);
            })
        }
    
    handleClick(){  
        console.log('inside user info');     
        this.showButtons = true; 
        this.getData(this.page, this.per_page);        
    }

    hanldeNext(){
        this.page++;
        this.disablePrevious = false;
        this.getData(this.page,this.per_page);
        if(this.page==3){
            this.disableNext = true;

        }
    }

    hanldePrevious(){        
        this.page--;
        if(this.page==1){
            this.disablePrevious = true;
            this.disableNext = false;
        }
        this.getData(this.page,this.per_page);

    }

}