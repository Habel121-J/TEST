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
    
}