@isTest
public class CustomMetadata_ServiceTest {
    
    @testSetup
    static void makeData(){
        
    }
    
    @isTest
    static void handleUpsertTest(){
        CustomMetadata_Service.handleUpsert('test fullName', 'test devName', 'test fullName', '[{"label":"test fullName"}]');
	}
}