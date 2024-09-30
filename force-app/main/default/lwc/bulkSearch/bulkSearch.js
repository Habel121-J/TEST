import { LightningElement,api } from 'lwc';
import searchResult from '@salesforce/apex/BulkSearchData.searchResult'

const columns = [{ label: 'Search Term', fieldName: 'searchTerm' },
{ label: 'Name', fieldName: 'linkname', type: 'url', typeAttributes: { label: { fieldName: 'Name' }, value: { fieldName: 'linkname' }, target: '_blank' } },
{ label: 'Description', fieldName: 'Description' },
{ label: 'Phone', fieldName: 'Phone' }];

export default class BulkSearch extends LightningElement {

    @api objectApiName

    searchTerm = [];
    showTable = false;
    data = [];
    columns = columns
    NoRecords = false;
    showSpinner = false;
    tabsToOpen;
    sObjectType;

    connectedCallback(){

        console.log('objectAPI',this.objectApiName);
        this.sObjectType = this.objectApiName;
    }

    async handleSearch(event) {
        this.showSpinner = true;
        try {
            console.log('event target', event.target.label === 'Search and Open');
            let isSearchAndOpen = (event.target.label === 'Search and Open');
            let searchTerms = [...this.searchTerm];
            let data = [];
            console.log(JSON.stringify(searchTerms));
            if (searchTerms.length < 20) {  
                data = await this.fetchData(searchTerms,this.sObjectType);
            }else if (searchTerms.length > 20) {
                console.log('inside > 20 ');
                for (let i = 0; i < searchTerms.length; i += 20) {
                    let s = searchTerms.slice(i, i + 20);
                    let tempData = await this.fetchData(s,this.sObjectType);
                    data = [...data, ...tempData];
                    console.log('tempdata--',data);
                }
            }
            this.showTable = (data !== undefined && data.length > 1);
            this.data = data;
                if (isSearchAndOpen) {
                    let data = this.data
                    let firstFive = data.slice(0,this.tabsToOpen);
                    firstFive.forEach(ele =>{   
                        window.open('/'+ ele.Id,'_blank');
                    
                    })
                }
        } catch (error) {
            console.log(error.message);
        }
        this.showSpinner = false;
    }

    handleTabs() {
        console.log('inside tab');
        let tempSelect = this.template.querySelector('.input');
        this.tabsToOpen = this.template.querySelector('.input').value;
        if (this.tabsToOpen > 5 || this.tabsToOpen < 0) {
            tempSelect.setCustomValidity('Enter less than 5 or greater than 0')
            this.template.querySelector('.input').value = 2;
        } else {
            tempSelect.setCustomValidity('')
        }
        tempSelect.reportValidity();
    }

    async fetchData(searchTerms,sObjectType ) {
        let data = []
        await searchResult({ term: searchTerms, sObjectType : sObjectType })
            .then(result => {
                try {
                    if(result && result.length > 0) {
                        data = result.map(ele => {
                            let obj = { ...ele.record, searchTerm: ele.searchTerm, linkname: ele.record !== undefined ? `/${ele.record.Id}` : 'No record found' };
                            console.log(JSON.stringify(obj));
                            return obj;
                        });
                    }
                } catch (error) {
                    console.log('ERROR: ', error.message);
                }
            }).catch(error => {
                console.log('error---', JSON.stringify(error));
            })
        return data;
    }


    handleChange(event) {
        let tempsearch = event.target.value;
        this.searchTerm = tempsearch.split('\n');
    }

}