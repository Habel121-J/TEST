public class SendEmail {
    
    public static void emailCustomer(){
        
        
        Messaging.SingleEmailMessage Msg= new Messaging.SingleEmailMessage();
        
        String body = 'This is email from \n Please acknowled you received email';
        Msg.setSubject('This is Test Email');
        
        
        String[] MsgToSend = new String[]{'habelprasanna5@gmail.com'};
            Msg.setToAddresses(MsgToSend);
        Msg.setHtmlBody(body);
        List<Messaging.SingleEmailMessage> mes = new List<Messaging.SingleEmailMessage>();
        mes.add(Msg);
        
        Messaging.SendEmailResult[] result =  Messaging.sendEmail(mes);
        
        System.debug('result '+result);
        if(result[0].isSuccess()){
            
            System.debug('email sent');
        }
        
    }
}