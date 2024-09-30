public class ContactTriggerHandler {

    public void beforeInsert(List<Contact> newList){

    }

    public void beforeUpdate(List<Contact> newList){

    }

    public void afterInsert(List<Contact> newList){
        updateContactCount(newList, new Map<Id, Contact>());
    }


    public void afterDelete(List<Contact> oldList){
        updateContactCount(oldList, new Map<Id, Contact>());
    }

    public void afterUpdate(List<Contact> newList, Map<Id, Contact> oldMap ){
        updateOldNewValues(newList, oldMap);
    }

    public static void updateContactCount(List<Contact> conList , Map<Id, Contact> oldMap){
        Map<Id,Integer> mapAcc = new Map<Id,Integer>();
        Map<Id, Integer> accToConMap = new Map<Id, Integer>();
        Set<Id> conIds = new Set<Id>();
        for(Contact cons: conList){
            if(cons.AccountId != NULL && String.isNotBlank(cons.AccountId)){

                if(!mapAcc.containsKey(cons.AccountId)){
                    mapAcc.put(cons.AccountId, 1);
                } else{
                    mapAcc.put(cons.AccountId,mapAcc.get(cons.AccountId) + 1);
                }
            }
            conIds.add(cons.Id);
        }
        for(Contact contact : [SELECT Id, AccountId FROM Contact WHERE AccountId IN: mapAcc.keySet() AND Id NOT IN : conIds]){
            if(accToConMap.containsKey(contact.AccountId))
                accToConMap.put(contact.AccountId, accToConMap.get(contact.AccountId) + 1);
            else
                accToConMap.put(contact.AccountId, 1);
        }
        
        List<Account> accData = [SELECT Id, TotalContacts__c FROM Account WHERE ID IN :mapAcc.keySet()];
        for(Account acc: accData){
            
            if(Trigger.isInsert || Trigger.isUpdate){
                System.debug('inside insert  '+  mapAcc.get(acc.Id));
                
                acc.TotalContacts__c = accToConMap.get(acc.Id) <> null ?   accToConMap.get(acc.Id) + mapAcc.get(acc.Id) : mapAcc.get(acc.Id) ;    
                //acc.TotalContacts__c = acc.TotalContacts__c!= null ? acc.TotalContacts__c + mapAcc.get(acc.Id)  ;
                
            }
            else if(Trigger.isDelete){
                acc.TotalContacts__c = accToConMap.get(acc.Id);
            }
        }

        System.debug('map of old records----'+oldMap);
        update accData;
    }

    public static void updateOldNewValues(List<Contact> conList , Map<Id, Contact> oldMap){
        
    Set<Id> newAcc = new Set<Id>();
    Set<Id> oldAcc = new Set<Id>();

    for(Contact cons:conList ){

        if(cons.AccountId!=oldMap.get(cons.Id).AccountId){
            if(cons.AccountId!=null){
                newAcc.add(cons.AccountId);
            }
            if (oldMap.get(cons.Id).AccountId <> null) {
                oldAcc.add(oldMap.get(cons.Id).AccountId);
            }
        }
    }


        Map<Id,Integer> newMaps = new Map<Id, Integer>();
        Map<Id,Integer> oldAccMap = new Map<Id,Integer>();
    

    for(Contact cons : [SELECT Id, AccountId FROM Contact WHERE AccountId IN :newAcc]){
        System.debug('cons----'+cons);
        if(!newMaps.containsKey(cons.AccountId)){
            newMaps.put(cons.AccountId, 1);
        }
        else{

            newMaps.put(cons.AccountId, newMaps.get(cons.AccountId) + 1);
        }
    }
    
    //check if the list is empty then assign 0;

    List<Contact> litscom = [SELECT Id, AccountId FROM Contact WHERE AccountId IN :oldAcc];
        for(Contact cons : litscom){
        System.debug('olddcons----'+cons);
        if(!oldAccMap.containsKey(cons.AccountId) ){
            oldAccMap.put(cons.AccountId, 1);
        }
        else{

            oldAccMap.put(cons.AccountId, oldAccMap.get(cons.AccountId) + 1);
        }
    }
    
    List<Account> newListToUpdate = new List<Account>();
    
    for(Account acc: [SELECT Id,TotalContacts__c FROM Account WHERE ID IN :newMaps.keySet()]){

        acc.TotalContacts__c =  newMaps.get(acc.Id);

        newListToUpdate.add(acc);
    }

    for(Account oldAcc1: [SELECT Id,TotalContacts__c FROM Account WHERE ID IN :oldAcc]){

        oldAcc1.TotalContacts__c =  oldAccMap.get(oldAcc1.Id)<>null ? oldAccMap.get(oldAcc1.Id) : 0;
        newListToUpdate.add(oldAcc1);  
    }
        
    update newListToUpdate;
}
}