user    register    new                             
                        read otp
                        register
        login                                       
        pass_reset  gen otp                         
                        confirm otp
                        set pass
        profile     get                             
        profile     update                          

store   register    new                             
                        read otp
                        approve
        view                                        
        list                                        
        staff       req                             
                        acc/deny
                        revoke
                        relieve
        staff       list                                        10
                
product add                                         
        list                                        
        view                                        
        modify                                      
        delete                                      

cart    insert                                      
        list                                        
        modify                                      
        remove                                      

address add                                                     20                  
        list                                        
        view                                        
        modify                                      
        delete                                      

journal create                                      
        list                                        
        view                                        

transit user    cancel                              
        store   reject / accept / despatch          
        agent   reject / ignore / accept / complete             30
        admin   accept / assign / terminate        



Limits:

Max Address Count       : 16
Max Product Count       : 64                    // Catch it from user app itself
