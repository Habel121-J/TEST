trigger OpportunityTrigger on Opportunity (after insert) {

    if(Trigger.isAfter){
       
        if(Trigger.isInsert){
            
            OpportunityTriggerHandler.createOppor(Trigger.New);
            
        }
    }
    
}