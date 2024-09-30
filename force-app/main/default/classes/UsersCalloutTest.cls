@isTest
public  class UsersCalloutTest {

    @isTest
    static void testGetCallout() {
        
        Test.startTest();
   
    Test.setMock(HttpCalloutMock.class, new UsersCalloutMock()); 
    	String actualValue = UsersCallout.getUserData(2,4);
      Test.stopTest();
	  String Expected = '{"page":1,"per_page":6,"total":12,"total_pages":2,"data":[{"id":1,"email":"george.bluth@reqres.in","first_name":"George","last_name":"Bluth","avatar":"https://reqres.in/img/faces/1-image.jpg"},{"id":5,"email":"charles.morris@reqres.in","first_name":"Charles","last_name":"Morris","avatar":"https://reqres.in/img/faces/5-image.jpg"}],"support":{"url":"https://reqres.in/#support-heading","text":"To keep ReqRes free, contributions towards server costs are appreciated!"}}';
      System.assertEquals(Expected, actualValue); 
    

    }
}