trigger ContactTrigger on Contact (after insert,after delete, before insert, before update,after update) {

    ContactTriggerHandler handler = new ContactTriggerHandler();
    
     


    if(trigger.isBefore){
        if(trigger.isInsert  && CheckRecursion.isRunOnce){
            CheckRecursion.isRunOnce = false;
        }
        else if(trigger.isUpdate){
    
        }
    }
    
    if(Trigger.isAfter){
        if(Trigger.isInsert){
            handler.afterInsert(Trigger.new);
        }
        else if(Trigger.isUpdate){
            handler.afterUpdate(Trigger.new, Trigger.oldMap);
        }
        else if(Trigger.isDelete){
            handler.afterDelete(Trigger.old);
        }
    }
}