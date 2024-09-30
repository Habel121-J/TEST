public with sharing class BulkSearchData {
 
    @AuraEnabled
    public static List<UtilWrapper> searchResult(List<String> term, String sObjectType){
        List<UtilWrapper> wrapper = new List<UtilWrapper>();
        System.debug('data----'+term);
        Set<String> UniqueStr = new Set<String>();
        List<Account> accList = new List<Account>();

        for(String  str: term){
            str = str.trim();
            UniqueStr.add(str);   
        }

        try{
            for(String s :UniqueStr){
                UtilWrapper wrap = new UtilWrapper();
                String query = 'FIND {'+ s +'} IN ALL FIELDS RETURNING '+sObjectType+'(Name,Phone,Description)';
                System.debug('s----'+s+'sobjectype'+SobjectType);
                List<List<Sobject>> searchData =  search.query(query);
                System.debug('searchdata--'+searchData);
                if(searchData.size() > 0 && searchData[0].size() > 0){
                    wrap.searchTerm = s;
                    wrap.record = (SObject) searchData[0][0];
                }else  {
                    wrap.searchTerm = s;
                }
                wrapper.add(wrap);
            }
        }
        catch(Exception e){
            System.debug('errro---'+e);
        }
        System.debug('accList---'+wrapper);
        return wrapper;
    }

    public class UtilWrapper{
        @AuraEnabled
        public String searchTerm = '';

        @AuraEnabled 
        public SObject record;
    }
}