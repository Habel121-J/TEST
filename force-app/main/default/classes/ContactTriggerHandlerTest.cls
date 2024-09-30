@isTest
public class ContactTriggerHandlerTest {
    

    @TestSetup
    static void createData(){
        
        List<Account> accList = new List<Account>{
            new Account(Name = 'Test Account 001'),
            new Account(Name = 'Test Account 002')
        };
        insert accList;

        List<Contact> conList = new List<Contact>{
            new Contact(LastName = 'Test Con 001', AccountId = accList[0].Id),
            new Contact(LastName = 'Test Con 001a', AccountId = accList[0].Id),
            new Contact(LastName = 'Test Con 002', AccountId = accList[1].Id),
            new Contact(LastName = 'Test Con 002a', AccountId = accList[1].Id),
            new Contact(LastName = 'Test Con 003')
        };
        insert conList;
    }

    @isTest
    static void insertContactTest(){

    }
    
    @isTest
    static void updateContactTest(){
        Account acc = [SELECT Id FROM Account WHERE Name = 'Test Account 002'];
        Contact con = [SELECT Id, AccountId FROM Contact WHERE LastName = 'Test Con 001'];
        Test.startTest();
        con.AccountId = acc.Id;
        update con;
        Test.stopTest();
        System.assertEquals(3, [SELECT Id,TotalContacts__c FROM Account WHERE Name = 'Test Account 002'].TotalContacts__c);
    }
    
    @isTest
    static void deleteCOntactTest(){
        Contact con = [SELECT Id, AccountId FROM Contact WHERE LastName = 'Test Con 001'];
        Test.startTest();
        delete con;
        Test.stopTest();
        System.assertEquals(1, [SELECT Id, TotalContacts__c FROM Account WHERE Name = 'Test Account 001'].TotalContacts__c);
    }
}