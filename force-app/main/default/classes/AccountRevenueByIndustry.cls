public class AccountRevenueByIndustry {   
    public static void  revnueByIndustry(){       
        try{        
            Map<String,Decimal> mapRevenue = new Map<String,Decimal>();
            for(Account accs: [SELECT Id, Name, Industry,AnnualRevenue FROM Account
                               WHERE Industry <> null AND AnnualRevenue <> null])
            {
                        
                                    
                    
            }
            System.debug('revuemaap'+mapRevenue);
        }catch(Exception ex){
            System.debug('Errror '+ex.getMessage());
        }
            
        }
}