/**
 Description : Service class to update custom metadata records
 Author : Prakash Avula
 Created date : Nov 11 2022
*/

public with sharing class CustomMetadata_Service {

    /**
     * Description : Main method to update or insert custom metadata
     * @param : String (api name of custom metadata type)
     * @param : String (custom metadata record developer name)
     * @param : String (custom metadata record label)
     * @param : String (updated values of custom metadata records)
    */
    @Auraenabled
    public static String handleUpsert(String fullName, String mdtDevName, String label, string fieldWithValues){
        //Deserialize all fields information and create JSON object
        List<Object> results = (List<Object>) JSON.deserializeUntyped(fieldWithValues);
        Map<String, Object> fieldWithValuesMap = new Map<String, Object>();
        for (Object obj: results) {
            fieldWithValuesMap.putAll((Map<String, Object>)obj);
        }
        
        Metadata.CustomMetadata customMetadata = new Metadata.CustomMetadata();        
        customMetadata.fullName = fullName+'.'+mdtDevName;        
        customMetadata.label = label;        
        for (String key: fieldWithValuesMap.keySet()) {            
            Metadata.CustomMetadataValue customField = new Metadata.CustomMetadataValue();       
            if(key != 'id' && key != 'Id'){
                customField.field = key;            
                customField.value = fieldWithValuesMap.get(key);            
                customMetadata.values.add(customField);         
            }     
        }
       	Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();        
        mdContainer.addMetadata(customMetadata);        
        CustomMetadata_ServiceCallback callback = new CustomMetadata_ServiceCallback();   
        Id jobId = Test.isRunningTest() ? 'a0cM00000043ST4' : Metadata.Operations.enqueueDeployment(mdContainer, callback);
        return jobId;
    }

    @AuraEnabled
    public static Response checkDeploymentStatus(String deployRequestId){
        Response response = new Response();
        try {
            if(String.isNotBlank(deployRequestId)){
                HttpRequest req = new HttpRequest();
                req.setMethod('GET');
                req.setEndpoint('callout:MDAPI/services/data/v49.0/metadata/deployRequest/' + deployRequestId + '?includeDetails=true');
                Http http = new Http();
                HttpResponse resp = http.send(req);
                DeployResultJson resultJson = (DeployResultJson) JSON.deserialize(resp.getBody(), DeployResultJson.class);
                System.debug('response>> '+resultJson.deployResult);
                System.debug('response>>> '+resultJson.deployResult.details.componentFailures);
                response.status = String.valueOf(resultJson.deployResult.status);
                if(String.valueOf(resultJson.deployResult.status).equalsIgnoreCase('failed') && !resultJson.deployResult.details.componentFailures.isEmpty())
                    response.errorMessage = resultJson.deployResult.details.componentFailures[0].problem;
            }
        } catch (Exception exp)  {
            System.debug('checkDeploymentStatus Exception: '+exp.getMessage());
            response.errorMessage = exp.getMessage();
        }
        return response;
        
    }

    public class DeployResultJson {   
        public Metadata.DeployResult deployResult;
    }

    public class Response{

        @AuraEnabled 
        public String status;

        @AuraEnabled 
        public String errorMessage;
    }
}