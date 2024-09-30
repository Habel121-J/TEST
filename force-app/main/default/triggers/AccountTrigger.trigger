trigger AccountTrigger on Account (before insert, before delete) {
    if(Trigger.isBefore && Trigger.isInsert){
        
        AccountTriggerHandler.handleDups(Trigger.new);
    }

    if(Trigger.isBefore && Trigger.isDelete){
        System.debug('IS BEFORE DELETE');
        AccountTriggerHandler.preventContactDelete(Trigger.old);
    }

}