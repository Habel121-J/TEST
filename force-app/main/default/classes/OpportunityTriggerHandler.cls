public class OpportunityTriggerHandler {

    public static void createOppor(List<Opportunity> oppList){
        
        List<Account> accList = new List<Account>();
        
        for(Opportunity opps: oppList){
            
            Account acc = new Account();
            acc.Name = opps.Name;
            accList.add(acc);
            
        }
        insert accList;
        
    }
    
}