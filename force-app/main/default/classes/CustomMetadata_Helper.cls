/**
 * Description : Helper class for customMetadata_Editor lwc component.
                 Used to fetch custom metadata fields and records.
 * Author : Prakash Avula
 * Created Date : Nov 11 2022
*/

public class CustomMetadata_Helper {
    
    /**
     * Description : main method to get custom metadata fields and related records
     * @param : String (label of custom metadata type)
     * @return : UtilityWrapperr (custom metadata fields Definition [fields] and related records [records])
    */
    @AuraEnabled
    public static UtilityWrapper getMetadataRecord(String metadataName){
        UtilityWrapper wrapper = new UtilityWrapper();
        String soql = 'SELECT ';
        if(String.isNotBlank(metadataName)){
            SObjectType metadataType = Schema.getGlobalDescribe().get(metadataName);
            Map<String,Schema.SObjectField> metadataFields = metadataType.getDescribe().fields.getMap();
            List<String> fieldNames = new List<String>();
            for(Schema.SObjectField sf : metadataFields.values()){
                System.debug(sf.getDescribe().getLabel() +' isReq: '+sf.getDescribe().isNillable());
                FieldWrapper fwrap = new FieldWrapper();
                fwrap.label = sf.getDescribe().getLabel();
                fwrap.fieldName = sf.getDescribe().getName();
                fwrap.type = String.valueOf(sf.getDescribe().getType());
                fwrap.isRequired = !sf.getDescribe().isNillable(); 
                wrapper.fieldDef.add(fwrap);
                fieldNames.add(fwrap.fieldName);
            }
            soql += String.join(fieldNames, ',') + ' FROM ' + metadataName + ' ORDER BY label ASC';  

            wrapper.records = Database.query(soql);
        }
        
        return wrapper;
    }

    public class UtilityWrapper{

        @AuraEnabled
        public List<String> fields = new List<String>();

        @AuraEnabled
        public List<SObject> records = new List<SObject>(); 
        
        @AuraEnabled
        public String label;
        
        @AuraEnabled
        public String fieldApiName;

        @AuraEnabled 
        public List<FieldWrapper> fieldDef = new List<FieldWrapper>();
    }
    
    public class FieldWrapper{
        
        @AuraEnabled 
        public String label;

        @AuraEnabled 
        public String fieldName;

        @AuraEnabled 
        public String type;

        @AuraEnabled 
        public Boolean isRequired;
    }
    /**
     * Description : Used to get all custom metadata types.
     * @return : List-UtilityWrapper (Returns custom metadata type label and api name)
    */
    @AuraEnabled(cacheable=true)
    public static List<UtilityWrapper> getCustomMetadataTypes(){
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe(); 
		List<UtilityWrapper> customMetadataTypes = new List<UtilityWrapper>();
        Map<String, Schema.DescribeSObjectResult> dsr = new Map<String, Schema.DescribeSObjectResult>();
        for(Schema.SObjectType d : gd.values()){
            Schema.DescribeSObjectResult ds = d.getDescribe();
            if(ds.getName().endsWithIgnoreCase('__mdt'))
                dsr.put(ds.getLabel(), ds);
        }
        if(dsr.size() > 0){
            List<String> mdtLabels = new List<String>(dsr.keySet());
            mdtLabels.sort();
            for(String s : mdtLabels){
                UtilityWrapper wrap = new UtilityWrapper();
                wrap.label = s;
                wrap.fieldApiName = dsr.containsKey(s) ? dsr.get(s).getName() : '';
                customMetadataTypes.add(wrap);
            }
            return customMetadataTypes;
        }else{
            return new List<UtilityWrapper>();
        }
    }
}