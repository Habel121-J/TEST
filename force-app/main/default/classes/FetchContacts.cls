public class FetchContacts {
    
    @AuraEnabled
    public static List<Contact> fetchContactRecords(){   
        return [SELECT Id, Name, Email,Phone, Status__c FROM Contact LIMIT 50]; 
    } 

}   