public class RelatedListInfo{

@AuraEnabled(cacheable=true)
public static List<objWrapper> getRelatedListsInfo(String parentObjectApiName,String searchTerm){
    List<objWrapper> wrapObj = new List<objWrapper>();
        try{
            if(String.isBlank(searchTerm)){
                List<Schema.Childrelationship> relatedObjectsList = Schema.getGlobalDescribe().get(parentObjectApiName).getDescribe().getChildRelationships();
                for(Schema.Childrelationship cr : relatedObjectsList){
                    System.debug('Child Objects--->'+cr);
                    Schema.DescribeSObjectResult result = cr.getChildSObject().getDescribe();
                    if(result.isMruEnabled() && result.isAccessible() && result.isCreateable()){
                        // objWrapper objWrap = new objWrapper();     
                        // objWrap.label = result.getLabel();
                        // System.debug('label--->'+result.getName()+'prefix-->'+result.getKeyPrefix());
                        // objWrap.ApiName =  result.getName();    
                        // wrapObj.add(objWrap);
                    }

                    
                }
            }else{
            }
        }catch(Exception e) {
            
            System.debug('Error'+e.getMessage());
        }
    System.debug('wrapdata'+wrapObj);   
    return wrapObj;
} 

@AuraEnabled
public static String[] getLabels(String objectName){
    String Label;
    System.debug('objectname'+objectName);
    String[] Labels = Name__mdt.getInstance(objectName).FieldNames__c.split(',');
    for(String str :Labels){
        Label = Label +','+str;
    } 
    return Labels;
}   

@AuraEnabled
public static List<SObject> getExistingRecords(String keyTerm, String objectName){
    List<SObject> recordList = new List<SObject>(); 
    String[] FieldNames = RelatedListInfo.getLabels(objectName);
    if(String.isNotBlank(objectName) && String.isBlank(keyTerm)){
        String whereClause =   String.join(FieldNames,'<>null && ');
        String query = 'SELECT ' + String.join(FieldNames, ',') + ' FROM ' + objectName +' WHERE '+ whereClause+ ' LIMIT 20';
        System.debug('querynot null----'+ query);
        recordList = Database.query(query);
        
    }else{
        String likeFilter = '\'%'+keyTerm+'%\'';
        String query = 'SELECT ' + String.join(FieldNames, ',') + ' FROM ' + objectName + ' WHERE ' +FieldNames[0]+ ' LIKE'+likeFilter +' LIMIT 20';
        System.debug('LiKE soql'+query);
        recordList = Database.query(query);
        System.debug('recordList'+ recordList);
    }
    return recordList;
}

@AuraEnabled
public static List<FieldWrapper> createFormFields(String objName){
    List<FieldWrapper> fldWrapper = new List<FieldWrapper>();
    System.debug('---objname '+objName);
    Schema.SObjectType s = Schema.getGlobalDescribe().get(objName); 
    Schema.DescribeSObjectResult result = s.getDescribe() ;
    Map<String,Schema.SObjectField> fields = result.fields.getMap() ;

    for(String strfields : fields.keyset()) {
        Schema.DescribeFieldResult desribeResult = fields.get(strfields).getDescribe();
        if(desribeResult.isCreateable() && !desribeResult.isNillable() && !desribeResult.isDefaultedOnCreate())
        {
            FieldWrapper fldData = new FieldWrapper();
            fldData.Label = desribeResult.getLabel();
            fldData.Type = String.valueOf(desribeResult.getType());
            fldWrapper.add(fldData);
            //These are required fields
            system.debug('****Required Fields--');
        }
    }     
    return fldWrapper;
}

@AuraEnabled
public static void updateSObjectRecords(List<SObject> recList){
    try{
       update recList;
        
    }catch (Exception e) {
        System.debug('errrorrrr----->'+e.getMessage());
        throw new AuraHandledException(e.getMessage());
    }
}


public class fieldWrapper{
    @AuraEnabled public String Label;
    @AuraEnabled public String Type;

}


public class objWrapper{
    @AuraEnabled public String label;
    @AuraEnabled public String ApiName;
    
}
}


