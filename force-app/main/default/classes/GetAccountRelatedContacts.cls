public  class  GetAccountRelatedContacts {
    
    @AuraEnabled(cacheable=true)
    public static List<SObject>  getAccCons(List<String> fields, String objName, String recordId){
        
        return getRecords(fields, objName, recordId);
    }

    @AuraEnabled
    public static SObject handleUnassignAndCreate(Contact cont, Id recordId, Contact[] conList) {
        System.debug('insdie handle add'+conList);
        Set<Id> conIds = new Set<Id>();
        if(!conList.isEmpty()){
            System.debug('inside add');
            for(Contact c: conList){
                conIds.add(c.Id);
            c.AccountId  = recordId;
            System.debug('conlist'+conList);
            update conList;
            return [SELECT Id,FirstName,LastName,Email, Title,IsCheck__c FROM Contact WHERE Id IN :conIds];
        }
        }else{
            cont.AccountId = recordId <> null && String.isNotBlank(recordId) ? recordId : null;
            System.debug('inside else'+cont);
            upsert cont;
            System.debug('contact id'+cont.Id);
        }
        return [SELECT Id,FirstName,LastName,Email, Title,IsCheck__c FROM Contact WHERE Id =: cont.Id];
    }

    @AuraEnabled
        public static List<Contact> searchCons(String searchterm, String Id){
        String term = searchterm+'%';
        String partialSearch = '%'+ searchterm + '%';
        List<Contact> listCons = [SELECT Name,FirstName,LastName,Email,Title,AccountId,IsCheck__c FROM Contact WHERE Name LIKE: term  AND AccountId !=: Id LIMIT 5];
        Set<Id> conIds = new Set<Id>();
        for(Contact c : ListCons){
            conIds.add(c.Id);
        }      
        if(ListCons.size()<5){
            Integer limiter = 5 - ListCons.size();
            for(Contact con: [SELECT Name,FirstName,LastName,Email, Title,AccountId FROM Contact WHERE NAME LIKE :partialSearch AND Id NOT IN: conIds AND  AccountId !=: Id LIMIT: limiter]){
            ListCons.add(con);
        }
        }
        return ListCons;
    }

    @AuraEnabled
    public static List<ColumnWrapper> dynamicFields(String fields,String objName){

        List<ColumnWrapper> WrapperCols = new List<ColumnWrapper>();

        if(!String.isBlank(fields) && !String.isBlank(objName)){
            System.debug('insdie --dynamic fields');
            Set<String> fieldAPI = new Set<String>();
            if(fields.contains(',')){
                for(String str : fields.split(',')){
                    str = str.trim();
                    fieldAPI.add(str);
                }
            }else{
                fieldAPI.add(fields);
            }
            System.debug('insdie --dynamic'+fieldAPI);
            System.debug('objname'+objName);
            
            Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objName).getDescribe().fields.getMap();
            List<String> fieldnames = new List<String>();
            for(String s :fieldAPI ){
                if(fieldMap.containsKey(s)){
                    Schema.DescribeFieldResult fieldsDes = fieldMap.get(s).getDescribe();
                    ColumnWrapper colWrap = new ColumnWrapper();
                    colWrap.label =  fieldsDes.getLabel();
                    colWrap.fieldName = fieldsDes.getName();
                    colWrap.type =  String.valueOf(fieldsDes.getType());
                    WrapperCols.add(colWrap);
                } 
            } 
        }
        return WrapperCols;
    }

    @AuraEnabled
    public static List<SObject> getRecords(List<String> fields, String objName, String recordId){
        String whereClause = (recordId <> null && String.isNotBlank(recordId)) ? ' WHERE AccountId=:recordId' : '';
        String query = '';
        if(!fields.isEmpty())
            query = 'SELECT ' + String.join(fields, ',') + ' FROM ' + objName + (String.isNotBlank(whereClause) ? whereClause :  '');
        else
            query = 'SELECT Id FROM ' + objName + (String.isNotBlank(whereClause) ? whereClause :  '');

        return Database.query(query);
    }


    public class ColumnWrapper{

    @AuraEnabled
    public String label;

    @AuraEnabled
    public String type;

    @AuraEnabled
    public String fieldname;

    }


}