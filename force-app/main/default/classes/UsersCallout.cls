public  class UsersCallout {
    
    @AuraEnabled
    public static String getUserData(Integer one ,Integer two){
        System.debug('one---'+two);
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        String url = 'https://reqres.in/api/users?page='+one+'&per_page='+two;
        request.setEndpoint(url);
        request.setMethod('GET');
        HttpResponse response = http.send(request);
        System.debug('callout-------'+response.getBody());

            String callOutData = response.getBody();

            return callOutData;
    }
}