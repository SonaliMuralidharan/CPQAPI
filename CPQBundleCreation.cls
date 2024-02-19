public class CPQBundleCeation implements Queueable, Database.AllowsCallouts { 

    public Id it_pro_packId; 

    public Id laptop_proId; 

    public Id laptop_pro_optionId; 

    public Id quoteId; 

    public Map<String, OptionPropertiesWrapper> laptopDetailsMap = new Map<String, OptionPropertiesWrapper>(); 

     

    public CPQBundleCreation(Id quoteId,  Map<String, OptionPropertiesWrapper> laptopDetailsMap, Id it_pro_packId, Id laptop_proId, Id laptop_pro_optionId){ 

        this.it_pro_packId = it_pro_packId; 

        this.laptop_proId = laptop_proId; 

        this.laptop_pro_optionId = laptop_pro_optionId; 

        this.quoteId = quoteId; 

        this.laptopDetailsMap = laptopDetailsMap; 

    } 

     

    public void execute(QueueableContext qc){ 

        try{ 

        	createCPQBundlesAPI(this.quoteId, this.laptopDetailsMap, this.it_pro_packId, this.laptop_proId, this.laptop_pro_optionId); 

        }catch(Exception e){ 
            //Handle Exception
        } 

    } 

     

    public static void createCPQBundlesAPI(Id quoteId,  Map<String, OptionPropertiesWrapper> laptopDetailsMap, Id it_pro_packId, Id laptop_proId, Id laptop_pro_optionId){ 
         
        List<ProductModel> productModels = new List<ProductModel>(); 

        QuoteReader qReader = new QuoteReader(); 

        QuoteModel quote = qReader.read(quoteId); 

        List<ConfigurationModel> clonedConfigs = new List<ConfigurationModel>(); 

        //Query the Option Id to be created dynamically 

        SBQQ__ProductOption__c laptop = [SELECT Id, SBQQ__AppliedImmediately__c, SBQQ__Bundled__c, SBQQ__ConfiguredSKU__c,  

                                               SBQQ__DiscountedByPackage__c, SBQQ__Feature__c, SBQQ__Number__c, SBQQ__OptionalSKU__c,  

                                               SBQQ__ProductName__c, SBQQ__QuantityEditable__c, SBQQ__Quantity__c, SBQQ__Required__c,  

                                               SBQQ__Selected__c, SBQQ__System__c, SBQQ__Type__c, SBQQ__UpliftedByPackage__c, SBQQ__ProductCode__c, 

                                               Location__c, Unit_Cost_USD__c FROM SBQQ__ProductOption__c WHERE Id = :laptop_pro_optionId]; 

        //loop through Countries from .csv file 

        for(String countryCode: laptopDetailsMap.keySet()){ 

            ConfigLoader loader = new ConfigLoader(); 

            ProductModel parentProduct = loader.load(it_pro_packId, quote, null); 

            parentProduct.configuration.configurationData.Location__c = countryCode; 

            ConfigurationModel laptopConfigModel = new ConfigurationModel(); 

            //loop through the options in the above config model 

            for(ConfigurationModel config: parentProduct.configuration.optionConfigurations){ 

            //first professional will be automattically seclected in the bundle structure 

                if(config.optionData.SBQQ__ProductCode__c == 'LAPTOP13'){ 

                    config.optionData.SBQQ__Quantity__c = laptopDetailsMap.get(countryCode).laptopDetails.get(0).quantity; 

                    config.optionData.Unit_Cost_USD__c = laptopDetailsMap.get(countryCode).laptopDetails.get(0).basePay; 

                    laptopConfigModel = config; 

                    break; 

                } 

            } 

            //loop through all professionals under a country and dynamically create professionals 

            for(Integer i=1; i< laptopDetailsMap.get(countryCode).laptopDetails.size(); i++){ 

                ConfigurationModel clonedConfig = new ConfigurationModel(); 

                clonedConfig.configuredProductId = laptop_proId; 

                clonedConfig.optionId = laptop_pro_optionId; 

                clonedConfig.optionData = new SBQQ__ProductOption__c(); 

                clonedConfig.optionData.SBQQ__Quantity__c = laptopDetailsMap.get(countryCode).laptopDetails.get(i).quantity; 

                clonedConfig.optionData.SBQQ__AppliedImmediately__c=laptop.SBQQ__AppliedImmediately__c;  

                clonedConfig.optionData.SBQQ__QuantityEditable__c=laptop.SBQQ__QuantityEditable__c; 

                clonedConfig.optionData.SBQQ__DiscountedByPackage__c=laptop.SBQQ__DiscountedByPackage__c; 

                clonedConfig.optionData.SBQQ__ConfiguredSKU__c = laptop.SBQQ__ConfiguredSKU__c; 

                clonedConfig.optionData.SBQQ__OptionalSKU__c = laptop.SBQQ__OptionalSKU__c; 

                clonedConfig.optionData.SBQQ__Feature__c = laptop.SBQQ__Feature__c; 

                clonedConfig.optionData.SBQQ__Type__c=laptop.SBQQ__Type__c;  

                clonedConfig.optionData.SBQQ__Required__c=laptop.SBQQ__Required__c;  

                clonedConfig.optionData.SBQQ__Selected__c=laptop.SBQQ__Selected__c;  

                clonedConfig.optionData.SBQQ__UpliftedByPackage__c=laptop.SBQQ__UpliftedByPackage__c; 

                clonedConfig.optionData.SBQQ__Bundled__c=laptop.SBQQ__Bundled__c; 

                clonedConfig.optionData.SBQQ__Number__c=laptop.SBQQ__Number__c + i; 

                clonedConfig.optionData.SBQQ__System__c=laptop.SBQQ__System__c; 

                clonedConfig.optionData.Unit_Cost_USD__c = laptopDetailsMap.get(countryCode).laptopDetails.get(i).basePay; 

                clonedConfig.configurationData = laptopConfigModel.configurationData; 

                clonedConfig.inheritedConfigurationData = laptopConfigModel.inheritedConfigurationData; 

                clonedConfig.optionConfigurations = laptopConfigModel.optionConfigurations; 

                clonedConfig.configured = true; 

                clonedConfig.changedByProductActions = false; 

                clonedConfig.dynamicOptionKey = null; 

                clonedConfig.isUpgrade = false; 

                clonedConfig.isDynamicOption = false; 

                clonedConfig.priceEditable = false; 

                clonedConfig.validationMessages = laptopConfigModel.validationMessages; 

                parentProduct.configuration.optionConfigurations.add(clonedConfig); 

            }        

            //execute the product scoped product rules   

            ConfigValidator validator = new ConfigValidator(); 

            parentProduct.configuration = validator.load(it_pro_packId, quote, parentProduct.configuration, 'Always', null); 

            productModels.add(parentProduct); 

        } 

        //add the configured productmodels to the quote 

        ProductAdder adder = new ProductAdder(); 

        QuoteModel quoteWithProducts = adder.add(quote, productModels, 0); 
        

       QuoteSaver saver = new QuoteSaver(); 

       QuoteModel savedQuote = saver.save(quoteWithProducts); 

    }    

} 

 