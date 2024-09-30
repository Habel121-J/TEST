@isTest
public class CustomMetadata_HelperTest {
    
    @TestSetup
    static void makeData(){
        
    }
	
    @isTest
    static void getMetadataRecordTest(){
        Test.startTest();
        CustomMetadata_Helper.UtilityWrapper wrap = CustomMetadata_Helper.getMetadataRecord('');
        Test.stopTest();
    }
    
    @isTest
    static void getCustomMetadataTypesTest(){
        Test.startTest();
        List<CustomMetadata_Helper.UtilityWrapper> wrap = CustomMetadata_Helper.getCustomMetadataTypes();
        Test.stopTest();
    }
}