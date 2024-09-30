public class AnimalLocator {
    
    public static void getAnimalNameById(Integer num){
        
        System.debug('inside http');
        
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://th-apex-http-callout.herokuapp.com/animals/'+num);
        req.setMethod('GET');
        
        HttpResponse response = http.send(req);
        	
        System.debug('response'+response);
        if(response.getStatusCode() == 200){
            System.debug('insdie  if');
           
         Map<String, Object> MapKey = (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
            List<Object> Values = (List<Object>) MapKey.get('animal'); 
            	
            	System.debug(' Values'+Values);
            
        }
    }
}