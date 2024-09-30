@isTest
public class GetAccountRelatedContactsTest {

    @TestSetup
    static void makeData(){
        Account acc = new Account(Name='Test Account',Phone = '9877654321');
        insert acc;
        
        List<Contact> conList = new List<Contact>{new Contact(LastName='Habel',Title='CEO',Email='habel@bt.com',AccountId=acc.Id),
                                                  new Contact(LastName = 'Dattu',Title = 'IT',Email='dattu@bt.com',AccountId=acc.Id)};
        insert conList;

        List<Contact> conList1 = new List<Contact>{new Contact(LastName='Prasanna',Title='CEO',Email='prasanna@bt.com'),
                                                  new Contact(LastName = 'Jyothi',Title = 'IT',Email='jyothi@bt.com')};
        insert  conList1;                                                 

        //Contact con3 = new Contact(LastName='Sunil',Title='Staffing',AccountId);
    }

    @isTest
    public static void getAccRelatedConsTest(){
            Account acc = [SELECT Id,Name FROM Account WHERE Name='Test Account'];
            Test.startTest();
            List<Contact> conList = GetAccountRelatedContacts.getAccCons(acc.Id);
            Test.stopTest();
            System.assertEquals(2, conList.size());
    }

    @isTest
    public static void unassignTest(){
            Contact con = [SELECT Id,LastName,AccountId FROM Contact WHERE LastName='Habel'];
            Test.startTest();
            GetAccountRelatedContacts.unassignContact(con);
            Test.stopTest();

            List<Contact> conList = [SELECT Id,LastName,AccountId FROM Contact WHERE Name='Test Account'];

            System.assertEquals(true, con.AccountId!=null);
    }

    @isTest
    public static void createAccountRealatedContactTest(){
 
        Account acc = [SELECT Id,Name FROM Account LIMIT 1];
        Contact con1 = new Contact(LastName='Dwayne Johnson');
        Test.startTest();
        Contact con2 =  GetAccountRelatedContacts.createContact(con1,acc.Id);
        Test.stopTest();
        Contact con =  [SELECT Id,AccountId FROM Contact WHERE LastName='Dwayne Johnson'];         
        System.assertEquals(true,con1.AccountId<>null);
        
    }

    @isTest
    public static void updateConsTest(){

        List<Contact> conList1 = [SELECT Id,AccountId FROM Contact];
        Account acc = [SELECT Id,Name FROM Account LIMIT 1];

        Test.startTest();
        GetAccountRelatedContacts.updateContact(acc.Id,conList1);
        Test.stopTest();

        Contact con = [SELECT Id,Name,AccountId FROM Contact WHERE LastName='Jyothi'];

        
        System.assertEquals(true, con.AccountId<>null);
        
    }

    @isTest 
    static void createContactTest() {
        Contact c = new Contact(LastName = 'Test contact');
        Account a =[SELECT Id FROM Account WHERE Name = 'Test Account' LIMIT 1];
        Test.startTest();
        Contact con = GetAccountRelatedContacts.createContact(c, a.Id);
        Test.stopTest();
        System.assertEquals(true, con.Id <> null);
    }

    
    @isTest 
    static void querySearchTest() {
        
        Account acc = [SELECT Id,Name FROM Account LIMIT 1];
        Test.startTest();
        List<Contact> conList = GetAccountRelatedContacts.searchCons('Prasanna', acc.Id);
        Test.stopTest();
      //  System.assertEquals();
    }

}