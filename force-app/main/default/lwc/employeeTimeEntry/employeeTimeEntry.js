import { LightningElement, wire } from 'lwc';
import Id from '@salesforce/user/Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getUser from '@salesforce/apex/EmployeeSheetHelper.getUser'
import QueryTaskMetaData from '@salesforce/apex/EmployeeSheetHelper.QueryTaskMetaData'
import QueryProjectMetaData from '@salesforce/apex/EmployeeSheetHelper.QueryProjectMetaData'
import checkProject from '@salesforce/apex/EmployeeSheetHelper.checkProject';
import createTimeSheets from '@salesforce/apex/EmployeeSheetHelper.createTimeSheets';

const columns = [{ title: 'Delete', label: 'Delete' },
{ title: 'Project', label: 'Project' },
{ title: 'Task', label: 'Task' },
{ title: 'Monday', label: 'Monday' },
{ title: 'Tuesday', label: 'Tuesday' },
{ title: 'Wednesday', label: 'Wednesday' },
{ title: 'Thursday', label: 'Thursday' },
{ title: 'Friday', label: 'Friday' }]

export default class EmployeeTimeEntry extends LightningElement {

    IterateMonday;
    userId = Id;
    tableColumns = columns;
    iterateRows = []
    currentUserName = ''
    count = 0
    tableInput = []
    projectValues = [];
    taskValues = [];
    weekDays = [];
    orgArray = []
    totalDays = []
    showSpinner = false
    weekValue;

    // @wire(getExtTimeSheets,({weekValues : '$weekValue'}))
    // loadTableRecords({data, error}){
    //     if(data){
           
    //         let dayToHour = new Map();
    //         data.forEach(d =>{
    //             dayToHour.set(d.Day__c.toLowerCase(), d.Hour__c);
    //         })
    //         this.tableInput = this.tableInput.map(element =>{
    //             if(!['Delete', 'Project', 'Task'].includes(element.label)){
    //                 element.value = dayToHour.get(element.label.toLowerCase()) !== null ? dayToHour.get(element.label) : null;
    //                 element.isDisabled = element.value !== null
    //             }
    //             return element;
    //         })
    //     }else if(error){
    //         this.showToast('Error Loading', error.message, 'error')
    //     }
    // }


    async connectedCallback() {
        //await this.fetchTaskProjectValues();
        //this.orgArray = await this.handleDateValidation()
        this.tableColumns.forEach(ele => {
            if (ele.label !== 'Delete' && ele.label !== 'Project' && ele.label !== 'Task' && ele.label !== '')
                this.tableInput.push({ type: 'number', label: ele.label, isEdit: false });
        });
        
        const currentDate = new Date();
        const currentDay = currentDate.getDay();
        var difference = (currentDay + 6) % 7;
        var mondayDate = new Date(currentDate);
        mondayDate.setDate(currentDate.getDate() - difference);
        let dates = await this.getDaysOfWeek(mondayDate);
        let i = 0;
        this.tableInput = this.tableInput.map(ele => {
            let obj = { ...ele, 'dates': dates[i] }
            i++
            return obj
        })
        let c = 0;
        this.IterateMonday = currentDate
        this.tableColumns = this.tableColumns.map(ele => {
            let obj = { ...ele }
            if (obj.label && !['Delete', 'Project', 'Task', ''].includes(obj.label)) {
                obj['date'] = `(${this.weekDays[c]})`;
                c++
            }
            return obj;
        });
        this.iterateRows = [{ count: this.count, columns: this.tableColumns, tableInput: this.tableInput }]

    }

    handleChange(event) {
        console.log('inside handle change');
        if (event.target.label === 'Monday') {
            console.log('inside monday-----', event.currentTarget.dataset.date);
        }

    }

    @wire(QueryProjectMetaData)
    projectData(result) {
        if (result.data) {
            this.projectValues = result.data.split(',').map(ele => {
                return { label: ele, value: ele }
            })
        }
        else if (result.error) {
            this.projectValues = undefined
        }
    }

    @wire(QueryTaskMetaData)
    TaskMetadata(result) {
        console.log('result ', JSON.stringify(result));
        if (result.data) {
            this.taskValues = result.data.split(',').map(task => {
                return { label: task, value: task };
            });
        }
        else if (result.error) {
            this.taskValues = undefined
        }
    }

    @wire(getUser, { userId: '$userId' })
    userInfo(result) {
        if (result.data) {
            this.currentUserName = result.data.Name
        }
        else if (result.error) {
        }
    }

    columnCals(inputEle) {
        let temptotal = 0;
        inputEle.forEach(ele => {

            if (ele.value !== '') {
                temptotal = parseInt(temptotal) + parseInt(ele.value)

            }
        })
        return temptotal;

    }

    rowCals(rowFields) {

        rowFields.forEach(ele => {
            if (ele.label == "Monday") {

                this.monTotal = this.monTotal - ele.value
            }
            if (ele.label == "Tuesday") {
                this.tueTotal = this.tueTotal - ele.value

            }
            if (ele.label == "Wednesday") {
                this.wedTotal = this.wedTotal - ele.value
            }
            if (ele.label == "Thursday") {
                this.thuTotal = this.thuTotal - ele.value
            }
            if (ele.label == "Friday") {
                this.friTotal = this.friTotal - ele.value

            }

        })

    }

    async handleAddRow() {
        this.count++
        const nextMonday = await this.getNextMonday(this.IterateMonday);
        this.IterateMonday = nextMonday
        let nextWeekDays = await this.getDaysOfWeek(nextMonday.toDateString())
        console.log('nextWeekDays ' + JSON.stringify(nextWeekDays));
        let c = 0;
        let nextWeekColumns = this.tableColumns.map(column => {
            let obj = { ...column };
            if (obj.label && !['Delete', 'Project', 'Task', ''].includes(obj.label)) {
                obj['date'] = `(${nextWeekDays[c]})`;
                c++
            }
            return obj;
        })
        let i = 0;
        let nextWeek = this.tableInput.map(ele => {
            let obj = { ...ele, 'dates': nextWeekDays[i] }
            i++
            return obj
        })
        this.iterateRows = [...this.iterateRows, { count: this.count, columns: nextWeekColumns, tableInput: nextWeek }];

    }

    async getNextMonday(currentDate) {
        const dayOfWeek = currentDate.getDay();
        const daysUntilMonday = (dayOfWeek === 0) ? 1 : (8 - dayOfWeek);
        const nextMonday = new Date(currentDate);
        nextMonday.setDate(currentDate.getDate() + daysUntilMonday);
        return nextMonday;
    }

    handleRowDelete(event) {
        //this.template.querySelector(`lightning-button-icon[data-id="${currentIndex}"]`).disabled = true;
        //var rowFields = this.template.querySelectorAll(`[data-id="${currentIndex}"]`);
        // this.rowCals(rowFields)
        let currentIndex = event.currentTarget.dataset.id;
        if(this.iterateRows.length > 0){
            let tempArry = this.iterateRows.filter(ele => (ele.count != currentIndex))
            this.iterateRows = tempArry;
            let getLastMonday = this.iterateRows[this.iterateRows.length - 1];     
            
            getLastMonday.columns.forEach(ele => {
                if (ele.title && ele.title == "Monday") {
                    this.IterateMonday = new Date(ele.date.replace(/[()]/g, ''))
                } else {
                    this.IterateMonday = this.IterateMonday
                }
            })
        }else{           
          
         
           
        }
        
        

    }
    async handleDateChange(event) {
        let selectedDate = new Date(event.target.value)
        const currentDate = new Date();
        const currentDay = currentDate.getDay();
        var difference = (currentDay + 6) % 7;
        var mondayDate = new Date(currentDate);
        mondayDate.setDate(currentDate.getDate() - difference);
        let tempSelect = this.template.querySelector('.calendar');
        if (selectedDate.getDay() !== 1) {
            tempSelect.setCustomValidity('Please Select Any Monday')
        } else {
            tempSelect.setCustomValidity('')
            let c = 0;
            let newDates = await this.getDaysOfWeek(event.target.value)
            this.tableColumns = this.tableColumns.map(ele => {
                let obj = { ...ele }
                if (obj.label && !['Delete', 'Project', 'Task', ''].includes(obj.label)) {
                    obj['date'] = `(${newDates[c]})`;
                    c++
                }
                return obj;
            });
            let i = 0;
            let nextWeek = this.tableInput.map(ele => {
                let obj = { ...ele, 'dates': newDates[i] }
                i++
                return obj
            })
            this.IterateMonday = selectedDate
            this.iterateRows = [{ count: this.count, columns: this.tableColumns, tableInput: nextWeek }]
        }
        tempSelect.reportValidity();
        // if (selectedDate.getDate() > lastDay.getDate() && selectedDate.getDay() == 1 || selectedDate.getMonth() > lastDay.getMonth()) {
        //     let newArry = this.tableInput.map(ele => {                
        //         return {...ele, 'isEdit' : true}

        //     })
        //     this.tableInput = newArry;
        //     lo
        // } if(selectedDate.getDate() < currentDate.getDate() && selectedDate.getMonth() == currentDate.getMonth()) {
        //     let oldArry = this.tableInput.map(ele => {
        //         return {...ele, 'isEdit' : false}
        //         var obj = { ...ele }
        //         obj.isEdit = false;
        //         return obj;
        //     })

        //     this.tableInput = oldArry;
        // } if (selectedDate.getDate() == mondayDate.getDate()) {

        //     this.tableInput = this.orgArray;
        // }
    }
    //return dates from Mon to Fri with param as Mondaydate
    async getDaysOfWeek(startDay) {
        console.log('startDay from handle row' + startDay);
        let dates = [];
        const selecteddate = new Date(startDay);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        for (let i = 0; i < 5; i++) {
            dates.push(new Date((selecteddate).toDateString()).toLocaleString(undefined, options));
            selecteddate.setDate(selecteddate.getDate() + 1);
        }
        console.log('dates', JSON.stringify(dates));
        this.weekDays = dates
        return dates;
    }

    async handleSubmit() {
        console.log('inside submit');
        let i = 0;
        let empRecords = []
        try {
            this.showSpinner = true
            let fields = this.template.querySelectorAll('.input,lightning-combobox');
            if (fields) {
                let projectName;
                let task;
                let continueProcess = false;
                let timeSheet = {};
                let projectValue;
                timeSheet = { 'SObjectType': 'Employee_TimeSheet__c' };
                for (let key of fields) {
                    if (key.label === 'Projectvalues' || key.label === 'taskValues') {
                        if (key.value == '' || key.value == null || key.value === undefined) {
                            key.reportValidity();
                            continueProcess = false;
                            return;
                        } else {
                            projectName = key.label === 'Projectvalues' ? key.value : projectName;
                            task = key.label === 'taskValues' ? key.value : task;
                            continueProcess = true;
                            projectValue = await this.checkName(projectName)
                            console.log('project Value', projectValue);
                            timeSheet = { ...timeSheet, 'Project__c': projectValue }
                            console.log('timesheet', JSON.stringify(timeSheet));
                        }
                    }
                    if (key.type && key.type.toLowerCase() === 'number') {
                        if (key.value && key.value !== "") {
                            timeSheet = { ...timeSheet, 'Task__c': task, 'Project__c': projectValue, 'Employee_Name__c': this.userId, 'Day__c': key.label, 'Hour__c': key.value, 'Date__c': key.dataset.date };
                            empRecords.push(timeSheet);
                        }
                        i++;
                    }
                    i = i > 4 ? 0 : i;
                    console.log('empSheets', JSON.stringify(empRecords));

                }
                await createTimeSheets({ timeSheets: empRecords })
                    .then(result => {
                        console.log('result: ', result);
                        this.showToast('Records added !', 'TimeSheet Added successfully', 'success');
                        this.showSpinner = false
                        this.disableSavedRecords()
                    }).catch(error => {
                        console.log('ERROR CT: ', JSON.parse(JSON.stringify(error)));
                    })

            }
        } catch (error) {
            console.log('ERROR: ', error.message);
        }
    }

    async checkName(projectName) {
        let name = await checkProject({ projectName: projectName })
            .then(result => {
                if (result != null && result != undefined && result != '') {
                    console.log('result', JSON.stringify(result));
                    return result;
                }
            }).catch(error => {
                console.log('eror--', error);
            })
        return name
    }

    async disableSavedRecords() {
        console.log('inside disable recs');
        let fields = this.template.querySelectorAll('.input, lightning-combobox');
        fields.forEach(ele => {
            if (ele.type && ele.type == 'number' && ele.value !== '' || ele.label == 'Projectvalues' || ele.label == 'taskValues') {
                ele.disabled = true

            }
        })


    }


    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.input, lightning-combobox');
        inputFields.forEach(inputField => {
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }

        });
        return isValid;
    }

    handleCancel() {
        let fields = this.template.querySelectorAll('lightning-input,lightning-combobox')
        fields.forEach(ele => {
            ele.value = ''

        })

    }
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'

        }));
    }


    //Disable future Days for input boxes
    // async handleDateValidation() {
    //     var d = new Date()
    //     let currentDay = d.getDay()
    //     let map = new Map();
    //     let c = 1;
    //     this.tableInput.forEach(d => {
    //         if (d.type == 'number') {
    //             map.set(c, d.label);
    //             c++;
    //         }
    //     })
    //     let isDisabled = false;
    //     let tempArry = this.tableInput.map(ele => {
    //         var modObj = { ...ele };
    //         if (ele.type == 'number') {
    //             console.log('Day ', ele.label, ' isDisabled ', isDisabled);
    //             modObj.isEdit = isDisabled;
    //             isDisabled = !isDisabled ? ele.label == map.get(currentDay) : isDisabled;

    //         }
    //         return modObj

    //     })
    //     this.tableInput = tempArry
    //     return tempArry;
    // }

}