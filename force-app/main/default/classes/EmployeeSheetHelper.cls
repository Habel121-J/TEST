public  class EmployeeSheetHelper {

    @AuraEnabled(cacheable=true)
    public static User getUser(Id userId){

        System.debug('user'+[SELECT Id, Username, Name FROM User WHERE Id=:userId]);
        return [SELECT Id, Username, Name FROM User WHERE Id=:userId];
    }
    
    @AuraEnabled 
    public static void getTimeSheets(Datetime weekStart, Datetime weekEnd){

    }

    @AuraEnabled(cacheable=true)
    public static String QueryTaskMetaData(){
        System.debug('Task'+ [SELECT Id, Task__c FROM Task__mdt LIMIT 1]);
        return [SELECT Id, Task__c FROM Task__mdt LIMIT 1].Task__c;
   
    }
    @AuraEnabled(cacheable=true)
    public static String QueryProjectMetaData(){  
        return [SELECT Id, Project__c FROM Project__mdt LIMIT 1].Project__c;
    }
    
    
    @AuraEnabled
    public static String checkProject(String projectName){
        if(String.isNotBlank(projectName)){
            List<Projects__c> project = [SELECT Id FROM Projects__c WHERE Name =: projectName];
            if(project.isEmpty()){
                Projects__c newProject = new Projects__c(Name = projectName);
                insert newProject;
                project.add(newProject);
            }
            return project[0].Id;
        }else{
            return '';
        }
    }

    @AuraEnabled
    public static void createTimeSheets(List<Employee_TimeSheet__c> timeSheets){
        try {
            System.debug('timeSheets: '+timeSheets);
            List<Database.SaveResult> res = Database.insert(timeSheets,false);
            System.debug('res '+res);
        } catch (Exception ex) {
            System.debug(ex.getMessage());
        }
    }
}