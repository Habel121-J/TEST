@isTest
public class CustomMetadata_ServiceCallbackTest {
    
    @TestSetup
    static void makeData(){
        
    }

    @isTest
    static void handleResultTest(){

        Metadata.DeployCallback callback = new CustomMetadata_ServiceCallback();
        Metadata.DeployResult result = new Metadata.DeployResult();
        result.status = Metadata.DeployStatus.SUCCEEDED;
        Metadata.DeployCallbackContext context = new Metadata.DeployCallbackContext();
        callback.handleResult(result, context);
    }
}