public with sharing class GetAccountContactsForGrid {
    @AuraEnabled(cacheable=true)
    public static List<AccountWrapper> GetAccountContacts(){
        List<AccountWrapper> accwrap = new List<AccountWrapper>();
        try {            
            System.debug('ggrid accs details');
            for(Account ac : [SELECT Id, Name, Industry,(SELECT Id,AccountId,FirstName,LastName,Name FROM Contacts WHERE AccountId!= NULL) FROM Account LIMIT 10]){
                AccountWrapper accObj  = new AccountWrapper();                
                System.debug('account---->'+ac);
                if(ac.Contacts.size() > 0){                    
                    accObj.accRecord = ac;
                    //accObj.conList = ac.Contacts;
                    System.debug('conList---->'+ac.Contacts);
                    accwrap.add(accObj);
                }
            } 
           
        }catch (Exception e) {
            System.debug('error---> '+e.getMessage());
        }
        System.debug('warpper list '+accwrap);
        return accwrap;    
        
    }
    public class AccountWrapper{
        @AuraEnabled
        public SObject accRecord;

        
    }
     
}