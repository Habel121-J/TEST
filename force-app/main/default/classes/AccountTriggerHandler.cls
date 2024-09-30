public class AccountTriggerHandler {
    public static void handleDups(List<Account> accList){        
        Set<String> accName = new Set<String>();
        for(Account acc:accList){
            accName.add(acc.Name);
        }
        Set<String> newSet = new Set<String>();
        for(Account acc : [SELECT Id, Name FROM Account WHERE NAME IN :accName]){
            newSet.add(acc.Name);
        }
    
        for(Account newacc: accList){
           if(newSet.contains(newacc.Name)){
                newacc.Name.addError('Account alreadys Exists : '+newacc.Name);
           }
        }
    }

    public static void preventContactDelete(List<SObject> accList){
        Map<Id, List<Contact>> conMap = new Map<Id, List<Contact>>();
        for(Contact con : [SELECT Id, AccountId From Contact WHERE  AccountId IN : accList]){
            if(!conMap.containsKey(con.AccountId)){
                conMap.put(con.AccountId, new List<Contact>());
            }
            conMap.get(con.AccountId).add(con);
            System.debug(conMap);
        }
        
        for(SObject accs : accList){
            System.debug('inside ');
            if(conMap.get(accs.Id).size() > 0){
                System.debug('----->'+accs);
                accs.addError('you cannot delete records');
            }
        }
    }
}
