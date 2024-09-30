public class OlderAccountsUtility {
    public static void updateOlderAccounts(){
        List<Account> oldAccounts= Database.query('SELECT Id, Name,description, createddate FROM Account ORDER BY createddate limit 5');
        System.debug('old record'+oldAccounts);
        for(Integer i = 0;i<oldAccounts.size();i++){
            oldAccounts[i].description = 'Heritage Account';
        }
        update oldAccounts;
        
    } 


}