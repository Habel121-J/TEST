public class EmployeeTimeSheetTriggerHandler {

    public static void checkDuplicates(List<Employee_TimeSheet__c> empSheets) {

        System.debug('inside handler class--'+empSheets.size());
    }
}