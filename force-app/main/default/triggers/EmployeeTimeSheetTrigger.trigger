trigger EmployeeTimeSheetTrigger on Employee_TimeSheet__c (before insert,after insert) {
    if(CheckRecursion.isRunOnce){

        CheckRecursion.isRunOnce = false;

        if(Trigger.isBefore && Trigger.isInsert){

            EmployeeTimeSheetTriggerHandler.checkDuplicates(Trigger.new);
        }
    }

}