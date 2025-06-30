/**
 * This method is called by the calculator before calculation begins, but after formula fields have been evaluated.
 * @param {QuoteModel} quoteModel JS representation of the quote being evaluated
 * @param {QuoteLineModel[]} quoteLineModels An array containing JS representations of all lines in the quote
 * @returns {Promise}
 *
 * @author Ramiro Torres rtorres@g-p.com
 *
 * @version 1.0 CPQ REVAMP
 *
 *
 *
 */

// SET TO FALSE IN PRODUCTION
const DEBUG = true;
let initialModel = '';
var globalCurrencyTransactionFee = 0;

function debug(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

function rollupCountryNamesCPQ2(quote, quoteLines) {
    console.log('CPQ2 countryRollup');
    logRecords(quoteLines);
    var countryNames = new Set();
    quoteLines.forEach(line => {
        if (line.ProductCode__c === 'EOR_SERVICES') {
            countryNames.add(line.record.GP_Country__r.Name);
        }
    })
    if (countryNames.size > 0) {
        var countriesStr = [...countryNames];
        quote.record.Country_Names__c = countriesStr.toString();
    }
}

function rollupCountryNamesCPQ1(quote, quoteLines) {
    var countryNames = new Set();
    quoteLines.forEach(line => {
        if (line.record.Country_Product__c) {
            countryNames.add(line.record.Product_Name_Text__c);
        }
    })
    if (countryNames.size > 0) {
        var countriesStr = [...countryNames];
        quote.record.Country_Names__c = countriesStr.toString();
    }
}

function recruitingProductQuoteUpdateCPQ1(quote, quoteLines) {
    for (let ql of quoteLines) {
        if (ql.record.Product_Name_Text__c === 'Recruiting') {
            if (quote.record.Recruiting_Fee__c === undefined || quote.record.Recruiting_Fee__c === null || quote.record.Recruiting_Fee__c !== ql.record.Adjusted_Discount__c) {
                quote.record.Recruiting_Fee__c = ql.record.Adjusted_Discount__c;
            }
            break;
        }
    }
}

function taxCalculationCPQ1(Lines) {
    var taxFee = {};
    var CountryVsQlCountMap = {};
    if (Lines.length > 0) {
        console.log('CPQ 1.0 lines length' + Lines.length);
        Lines.forEach(function (line) {
            console.log('Value in first if condition ' + line.record.SBQQ__RequiredBy__c);
            //loop through each line components to get the sum of subs. total within the bundle 
            if (line.record.SBQQ__RequiredBy__c != null && line.record.SBQQ__RequiredBy__c != undefined) {
                console.log('Product Code for each Line ' + line.record.SBQQ__ProductCode__c);
                if (line.record.SBQQ__ProductCode__c === 'ANNUAL_TAX_FILING_FEE') {
                    taxFee[line.record.SBQQ__RequiredBy__c + 'Ann_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'Ann_Net'] = line.record.SBQQ__NetTotal__c;
                } else if (line.record.SBQQ__ProductCode__c === 'WIRING_FEE') {
                    taxFee[line.record.SBQQ__RequiredBy__c + 'Wire_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'Wire_Net'] = line.record.SBQQ__NetTotal__c;
                } else if (line.record.SBQQ__ProductCode__c === 'ONE_TIME_TRANSITION_ADMIN_FEE') {
                    console.log('Iin one time transition admin fee  list total ' + line.record.SBQQ__ListTotal__c);
                    console.log('Iin one time transition admin fee  net total ' + line.record.SBQQ__NetTotal__c);
                    taxFee[line.record.SBQQ__RequiredBy__c + 'Tran_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'Tran_Net'] = line.record.SBQQ__NetTotal__c;
                } else if (line.record.SBQQ__ProductCode__c === 'BUSINESS_TRAVEL_INSURANCE') {
                    taxFee[line.record.SBQQ__RequiredBy__c + 'Travel_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'Travel_Net'] = line.record.SBQQ__NetTotal__c;
                } else if (line.record.SBQQ__ProductCode__c === 'VISA_NEW_HIRE') {
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_NewHire_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_NewHire_Net'] = line.record.SBQQ__NetTotal__c;
                } else if (line.record.SBQQ__ProductCode__c === 'VISA_RENEWAL') {
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_Renewal_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_Renewal_Net'] = line.record.SBQQ__NetTotal__c;
                } else if (line.record.SBQQ__ProductCode__c === 'VISA_DEPENDENT') {
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_Dependent_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_Dependent_Net'] = line.record.SBQQ__NetTotal__c;
                } else if (line.record.SBQQ__ProductCode__c === 'VISA_DEPENDENT_RENEWAL') {
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_DependentRenewal_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_DependentRenewal_Net'] = line.record.SBQQ__NetTotal__c;
                } else if (line.record.SBQQ__ProductCode__c === 'VISA_COST_NEW_HIRE_AND_RENEWAL') {
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_NewHireRenewal_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_NewHireRenewal_Net'] = line.record.SBQQ__NetTotal__c;
                } else if (line.record.SBQQ__ProductCode__c === 'VISA_COST_OTHER_EU_EEA_SWISS_NATIONAL_RESIDENCE_REGISTRATION') {
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_OtherEU/EEA/SwissNational_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_OtherEU/EEA/SwissNational_Net'] = line.record.SBQQ__NetTotal__c;
                } else if (line.record.SBQQ__ProductCode__c === 'VISA_COST_OTHER_EU_EEA_SWISS_RESIDENCE_REGISTRATION') {
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_OtherEU/EEA/SwissResidence_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_OtherEU/EEA/SwissResidence_Net'] = line.record.SBQQ__NetTotal__c;
                } else if (line.record.SBQQ__ProductCode__c === 'VISA_COST_OTHER_RESIDENT_RENEWAL') {
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_OtherResidentRenewal_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_OtherResidentRenewal_Net'] = line.record.SBQQ__NetTotal__c;
                } else if (line.record.SBQQ__ProductCode__c === 'VISA_COST_NEW_HIRE_YEAR1') {
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_New_Hire_1_year_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_New_Hire_1_year_Net'] = line.record.SBQQ__NetTotal__c;
                } else if (line.record.SBQQ__ProductCode__c === 'VISA_COST_NEW_HIRE_YEAR2') {
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_New_Hire_2_year_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'VC_New_Hire_2_year_Net'] = line.record.SBQQ__NetTotal__c;
                }
                else if (line.record.SBQQ__ProductCode__c === 'PROFESSIONAL COSTS') {
                    //taxFee[line.record.SBQQ__RequiredBy__c + 'GRWI_List'] = line.record.SBQQ__ListTotal__c;
                    taxFee[line.record.SBQQ__RequiredBy__c + 'GRWI_Net'] = line.record.Min_Monthly_Service_Fee_Final__c;
                }
            }
            //console.log('Tax fee ' , taxFee);
            console.log('Country Product-->' + line.record.Country_Product__c);
            console.log('Country Product Name-->' + line.record.SBQQ__ProductName__c);
            if (line.record.Country_Product__c && line.record.SBQQ__ProductName__c != undefined && line.record.SBQQ__ProductName__c != null) {
                console.log('Inside 2nd If');
                if (CountryVsQlCountMap[line.record.SBQQ__ProductName__c] != undefined) {
                    CountryVsQlCountMap[line.record.SBQQ__ProductName__c] = CountryVsQlCountMap[line.record.SBQQ__ProductName__c] + 1;
                    line.record['Primary_Product__c'] = false;
                } else {
                    CountryVsQlCountMap[line.record.SBQQ__ProductName__c] = 1;
                    line.record['Primary_Product__c'] = true;
                    console.log(line.record['Primary_Product__c'] + 'Inside Else assignment');
                }
            }
        });
    }//End of if 
    if (taxFee != undefined) {
        console.log('value in the tax fee ' + taxFee);
        Lines.forEach(function (line) {
            if (taxFee[line.record.Id + 'Ann_List'] != undefined) {
                line.record['Ann_Tax_Filling_Fee_List_Price_Child__c'] = taxFee[line.record.Id + 'Ann_List'];
            }
            if (taxFee[line.record.Id + 'Ann_Net'] != undefined) {
                line.record['Ann_Tax_Filling_Fee_Net_Price_Child__c'] = taxFee[line.record.Id + 'Ann_Net'];
            }
            if (taxFee[line.record.Id + 'Wire_List'] != undefined) {
                line.record['Wiring_Fee_List_Price_Child__c'] = taxFee[line.record.Id + 'Wire_List'];
            }
            if (taxFee[line.record.Id + 'Wire_Net'] != undefined) {
                line.record['Wiring_Fee_Net_Price_Child__c'] = taxFee[line.record.Id + 'Wire_Net'];
            }
            if (taxFee[line.record.Id + 'Tran_List'] != undefined) {
                console.log('value in the assignment ')
                line.record['Tran_Admin_Fee_List_Price_Child__c'] = taxFee[line.record.Id + 'Tran_List'];
            }
            if (taxFee[line.record.Id + 'Tran_Net'] != undefined) {
                line.record['Tran_Admin_Fee_Net_Price_Child__c'] = taxFee[line.record.Id + 'Tran_Net'];
            }
            if (taxFee[line.record.Id + 'Travel_List'] != undefined) {
                line.record['Travel_Fee_List_Price_Child__c'] = taxFee[line.record.Id + 'Travel_List'];
            }
            if (taxFee[line.record.Id + 'Travel_Net'] != undefined) {
                line.record['Travel_Fee_Net_Price_Child__c'] = taxFee[line.record.Id + 'Travel_Net'];
            }

            if (taxFee[line.record.Id + 'VC_NewHire_List'] != undefined) {
                line.record['Visa_Cost_New_Hire_LP__c'] = taxFee[line.record.Id + 'VC_NewHire_List'];
            }
            if (taxFee[line.record.Id + 'VC_Renewal_List'] != undefined) {
                line.record['Visa_Cost_Renewal_LP__c'] = taxFee[line.record.Id + 'VC_Renewal_List'];
            }
            if (taxFee[line.record.Id + 'VC_Dependent_List'] != undefined) {
                line.record['Visa_Cost_Dependent_LP__c'] = taxFee[line.record.Id + 'VC_Dependent_List'];
            }
            if (taxFee[line.record.Id + 'VC_DependentRenewal_List'] != undefined) {
                line.record['Visa_Cost_Dependent_Renewal_LP__c'] = taxFee[line.record.Id + 'VC_DependentRenewal_List'];
            }
            if (taxFee[line.record.Id + 'VC_NewHireRenewal_List'] != undefined) {
                line.record['Visa_Cost_New_Hire_and_Renewal__c'] = taxFee[line.record.Id + 'VC_NewHireRenewal_List'];
            }
            if (taxFee[line.record.Id + 'VC_OtherEU/EEA/SwissNational_List'] != undefined) {
                line.record['Visa_Cost_Other_EU_EEA_Swiss_Natio_LP__c'] = taxFee[line.record.Id + 'VC_OtherEU/EEA/SwissNational_List'];
            }
            if (taxFee[line.record.Id + 'VC_OtherEU/EEA/SwissResidence_List'] != undefined) {
                line.record['Visa_Cost_Other_EU_EEA_Swiss_LP__c'] = taxFee[line.record.Id + 'VC_OtherEU/EEA/SwissResidence_List'];
            }
            if (taxFee[line.record.Id + 'VC_OtherResidentRenewal_List'] != undefined) {
                line.record['Visa_Cost_Other_Resident_Renewal_LP__c'] = taxFee[line.record.Id + 'VC_OtherResidentRenewal_List'];
            }
            if (taxFee[line.record.Id + 'VC_New_Hire_1_year_List'] != undefined) {
                line.record['Visa_Cost_New_Hire_1_year_LP__c'] = taxFee[line.record.Id + 'VC_New_Hire_1_year_List'];
            }
            if (taxFee[line.record.Id + 'VC_New_Hire_2_year_List'] != undefined) {
                line.record['Visa_Cost_New_Hire_2_year_LP__c'] = taxFee[line.record.Id + 'VC_New_Hire_2_year_List'];
            }
            if (taxFee[line.record.Id + 'GRWI_Net'] != undefined) {
                line.record['Global_Remote_Work__c'] = taxFee[line.record.Id + 'GRWI_Net'];
            }
        });
    }
}


function calculateProfessionalCount(quoteLineModels) {
    let professionalCountMap = new Map();

    //looping through QLs to find the count of Professionals under each EOR Service
    quoteLineModels.forEach(line => {
        let countOfProfessionals = 0;
        if (line.ProductCode__c === 'EOR_SERVICES') {
            //looping through the children of EOR Services
            line.components.forEach(eorChild => {
                //count the number of Professional in each EOR Service
                if (eorChild.ProductCode__c === 'PROFESSIONAL') {
                    countOfProfessionals += eorChild.Quantity__c;
                }

                professionalCountMap.set(line.Number__c, countOfProfessionals);
            });
        }
    });

    //looping through QLs to update the Quantity of EOR children
    quoteLineModels.forEach(line => {
        if (line.ProductCode__c === 'EOR_SERVICES') {
            //updating the Qty of EOR Services lines
            line.Quantity__c = (professionalCountMap.get(line.Number__c)) ? professionalCountMap.get(line.Number__c) : line.Quantity__c;

            //looping through the children of EOR Services
            line.components.forEach(eorChild => {
                //assign the count of Professionals to EOR Services' children having Optional = FALSE
                if (eorChild.ProductCode__c !== 'PROFESSIONAL' && !eorChild.Optional__c) {
                    eorChild.Quantity__c = professionalCountMap.get(line.Number__c);
                }
            });
        }
    });
}

function calculateMgmtFees(quoteLineModels) {
    quoteLineModels.forEach(function (line) {
        let productCode = line.record.SBQQ__ProductCode__c;
        if (productCode === 'PROFESSIONAL') {
            console.log('Professional Found ' + productCode);
            //Getting All Lines under the professional bundle
            var variableFeeLine = line.components.find(qline => qline.record.SBQQ__ProductCode__c === 'SERVICE_FEE_VARIABLE'); //Getting Variable Service Fee Line
            var baseFeeLine = line.components.find(qline => qline.record.SBQQ__ProductCode__c === 'SERVICE_FEE_BASE'); // Getting Service Fee Line
            var professionalQuantity = line.record.SBQQ__Quantity__c; //Getting Professional Quantity from Professional Line
            let sumOfBaseAmount = 0; // Variable to save the sum of formula  Amount_Charged_on_Base__c
            let sumOfVariableAmount = 0; // Variable to save the sum of forumla Amount_Charged_on_Variable__c
            if (baseFeeLine && variableFeeLine) {
                let maximumMonthlyServiceFee = baseFeeLine.record.SBQQ__MaximumPrice__c; // Base Maximum Monthly Service Fee
                let minimumMonthlyServiceFee = baseFeeLine.record.SBQQ__OriginalPrice__c; //Minimum Montlhy Service Fee
                let maximumMonthlyServiceFeeVariable = variableFeeLine.record.SBQQ__MaximumPrice__c; // Variable Maximum Montly Service Fee

                debug(line.components);
                debug(variableFeeLine.record.SBQQ__ProductCode__c);
                debug(baseFeeLine.record.SBQQ__ProductCode__c);

                //Sum all child lines under professional bundle to calculate both service fees, Platform Access and Cost of Compliant Employment
                line.components.forEach(function (professionalLines) {
                    if (professionalLines.record.Amount_Charged_on_Variable__c > 0) {
                        sumOfVariableAmount += professionalLines.record.Amount_Charged_on_Variable__c;
                    }
                    if (professionalLines.record.Amount_Charged_on_Base__c > 0) {
                        sumOfBaseAmount += professionalLines.record.Amount_Charged_on_Base__c;
                    }
                });

                //Calculate Variable Service Fee
                let variableCalculation = professionalQuantity * sumOfVariableAmount * (variableFeeLine.record.GP_Percentage_Price__c / 100);
                //Verify if  Variable Service Fee > Maximum
                /*if (variableCalculation > maximumMonthlyServiceFeeVariable) {
                    variableCalculation = maximumMonthlyServiceFeeVariable;
                }*/

                // Calculate Base Service Fee
                let baseCalculation = professionalQuantity * sumOfBaseAmount * (baseFeeLine.record.GP_Percentage_Price__c / 100);
                //Verify if Base + Variable Fees < Minimum Fee
                if (baseCalculation + variableCalculation < minimumMonthlyServiceFee) {
                    baseCalculation = minimumMonthlyServiceFee;
                    variableCalculation = 0;
                }
                //Assign Base and Variable Calculations to List Price
                baseFeeLine.record.SBQQ__ListPrice__c = baseCalculation;
                variableFeeLine.record.SBQQ__ListPrice__c = variableCalculation;

                debug('Mgmt Fee Base: ' + baseFeeLine.record.SBQQ__ListPrice__c);
                debug('Mgmt Fee Variable: ' + variableFeeLine.record.SBQQ__ListPrice__c);
            }


        }
    });
}

function calculateTotals(quoteLineModels) {
    debug('Cost Calculation');
    var eorLine = quoteLineModels.find(qline => qline.record.SBQQ__ProductCode__c === 'EOR_SERVICES'); //Find EOR Line
    var globalLine = quoteLineModels.find(qline => qline.record.SBQQ__ProductCode__c === 'GLOBAL'); //Find GLOBAL line
    var sumOfPlatofmCostEOR = 0; //Variable used to count the EOR Products with Platform Cost values
    var sumOfPlatformCostGLOBAL = 0; //Variable used to count the GLOBAL Products with Platform Cost values
    var sumOfCompliantCostEOR = 0;//Variable used to count EOR Products with Compliant Employment values
    var sumOfCompliantCostGlobal = 0; //Variable used to count GLOBAL Products with Compliant Employment values
    var sumOfContRevenueEOR = 0;  //Vairable used to count EOR Products with Revenue values
    var sumOfContRevenueGLOBAL = 0;  //Vairable used to count GLOBAL Products with Revenue values
    var sumOfAdditionalPayrollCostsEOR = 0; // Variable used to Sum of Additional Payroll Costs for EOR Products
    var sumOfAdditionalPayrollCostsGLOBAL = 0; // Variable used to Sum of Additional Payroll Costs for GLOBAL Products

    //Sum all GLOBAL Products with values on the formulas
    if (globalLine != null || globalLine != undefined) {
        debug(globalLine);
        globalLine.components.forEach(function (line) {
            if (line.record.GP_Platform_Access_Costs__c > 0) {
                sumOfPlatformCostGLOBAL += line.record.GP_Platform_Access_Costs__c;
            }
            if (line.record.GP_Cost_of_Compliant_Employment__c > 0) {
                sumOfCompliantCostGlobal += line.record.GP_Cost_of_Compliant_Employment__c;
            }
            if (line.record.GP_Contribution_to_Revenue__c > 0) {
                sumOfContRevenueGLOBAL += line.record.GP_Contribution_to_Revenue__c;
            }
            if (line.record.GP_Additional_Payroll_Costs__c > 0) {
                sumOfAdditionalPayrollCostsGLOBAL += line.record.GP_Additional_Payroll_Costs__c;
            }
        });
    }

    //Sum all EOR Products with values on the formulas
    if (eorLine != null || eorLine != undefined) {
        debug(eorLine);
        eorLine.components.forEach(function (line) {
            if (line.record.GP_Platform_Access_Costs__c > 0) {
                sumOfPlatofmCostEOR += line.record.GP_Platform_Access_Costs__c;
            }
            if (line.record.GP_Cost_of_Compliant_Employment__c > 0) {
                sumOfCompliantCostEOR += line.record.GP_Cost_of_Compliant_Employment__c;
            }
            if (line.record.GP_Contribution_to_Revenue__c > 0) {
                sumOfContRevenueEOR += line.record.GP_Contribution_to_Revenue__c;
            }
            if (line.record.GP_Additional_Payroll_Costs__c > 0) {
                sumOfAdditionalPayrollCostsEOR += line.record.GP_Additional_Payroll_Costs__c;
            }
        });
    }

    //Calculating Totals at Professional Bundle
    quoteLineModels.forEach(function (line) {
        var profesionalPlatformAccessCost = 0;
        var professionalConpliantEmploymentCost = 0;
        var professionalRevenue = 0;
        var professionaladditionalPayrollCosts = 0;//Variable to save the additional payroll costs value
        //Find Professional Bundle
        if (line.record.SBQQ__ProductCode__c === 'PROFESSIONAL') {
            debug('Professional Inside Cost Calculation');
            //Iterate over Professional child lines to sum all totals
            line.components.forEach(function (professionalLine) {
                if (professionalLine.record.GP_Platform_Access_Costs__c > 0) {
                    profesionalPlatformAccessCost += professionalLine.record.GP_Platform_Access_Costs__c;
                }
                if (professionalLine.record.GP_Cost_of_Compliant_Employment__c > 0) {
                    professionalConpliantEmploymentCost += professionalLine.record.GP_Cost_of_Compliant_Employment__c;
                }
                if (professionalLine.record.GP_Contribution_to_Revenue__c > 0) {
                    professionalRevenue += professionalLine.record.GP_Contribution_to_Revenue__c;
                }
                if (professionalLine.record.GP_Additional_Payroll_Costs__c > 0) {
                    professionaladditionalPayrollCosts += professionalLine.record.GP_Additional_Payroll_Costs__c;
                }
            });

            // //Multiply Totals by Quantity on professional bundle
            // profesionalPlatformAccessCost = profesionalPlatformAccessCost * line.record.SBQQ__Quantity__c;
            // professionalConpliantEmploymentCost = professionalConpliantEmploymentCost * line.record.SBQQ__Quantity__c;
            // professionalRevenue = professionalRevenue * line.record.SBQQ__Quantity__c;
            // professionaladditionalPayrollCosts = professionaladditionalPayrollCosts * line.record.SBQQ__Quantity__c;

            debug('Professional Platform  Cost: ' + profesionalPlatformAccessCost);
            debug('Professional Compliant Cost: ' + professionalConpliantEmploymentCost);
            debug('Professional Revenue: ' + professionalRevenue);
            debug('Additional Payroll Costs Target : ' + professionaladditionalPayrollCosts);

            //Assigning Totals to all lines under professional bundle
            line.components.forEach(function (professionalLine) {
                //Calculate Platform Access Cost
                professionalLine.record.GP_Platform_Access_Costs_Target__c =
                    sumOfPlatformCostGLOBAL + sumOfPlatofmCostEOR + profesionalPlatformAccessCost;
                //Calculate Compliant Employment Cost
                professionalLine.record.GP_Cost_of_Compliant_Employment_Target__c =
                    sumOfCompliantCostGlobal + sumOfCompliantCostEOR + professionalConpliantEmploymentCost;
                //Calculate Revenue
                professionalLine.record.GP_Professional_Total_Revenue__c =
                    sumOfContRevenueGLOBAL + sumOfContRevenueEOR + professionalRevenue;
                //Calculate Additional Payroll Costs Target
                professionalLine.record.GP_Additional_Payroll_Costs_Target__c =
                    sumOfAdditionalPayrollCostsGLOBAL + sumOfAdditionalPayrollCostsEOR + professionaladditionalPayrollCosts;

                debug('Platform Target: ' + professionalLine.record.GP_Platform_Access_Costs_Target__c);
                debug('Compliant Target: ' + professionalLine.record.GP_Cost_of_Compliant_Employment_Target__c);
                debug('Total Revenue: ' + professionalLine.record.GP_Professional_Total_Revenue__c);
                debug('Additional Payroll Costs Target :' + professionalLine.record.GP_Additional_Payroll_Costs__c);
            });

            line.record.GP_Platform_Access_Costs_Target__c = sumOfPlatformCostGLOBAL + sumOfPlatofmCostEOR + profesionalPlatformAccessCost;
            line.record.GP_Cost_of_Compliant_Employment_Target__c = sumOfCompliantCostGlobal + sumOfCompliantCostEOR + professionalConpliantEmploymentCost;
            line.record.GP_Professional_Total_Revenue__c = sumOfContRevenueGLOBAL + sumOfContRevenueEOR + professionalRevenue;
            line.record.GP_Additional_Payroll_Costs_Target__c = sumOfAdditionalPayrollCostsGLOBAL + sumOfAdditionalPayrollCostsEOR + professionaladditionalPayrollCosts;
        }
    });
}
/*EIA-2069 - Update QCP to calculate the totals on Global Products */
function calculateGlobalTotals(quoteLineModels) {
    debug('Cost Calculation');
    var globalLine = quoteLineModels.find(qline => qline.record.SBQQ__ProductCode__c === 'GLOBAL'); //Find Global Line
    var sumOfPlatormCostGlobal = 0; //Variable used to count the global Products with Platform Cost values
    var sumOfCompliantCostGlobal = 0;//Variable used to count global Products with Compliant Employment values
    var sumOfContRevenueGlobal = 0;  //Vairable used to count Global Products with Revenue values
    var sumOfAdditionalPayrollCostsGlobal = 0; // Variable used to Sum of Additional Payroll Costs for Global Products 

    //Sum all Global Products with values on the formulas
    if (globalLine != null || globalLine != undefined) {
        debug(globalLine);
        globalLine.components.forEach(function (line) {
            if (line.record.GP_Platform_Access_Costs__c > 0) {
                sumOfPlatormCostGlobal += line.record.GP_Platform_Access_Costs__c;
            }
            if (line.record.GP_Cost_of_Compliant_Employment__c > 0) {
                sumOfCompliantCostGlobal += line.record.GP_Cost_of_Compliant_Employment__c;
            }
            if (line.record.GP_Contribution_to_Revenue__c > 0) {
                sumOfContRevenueGlobal += line.record.GP_Contribution_to_Revenue__c;

            }
            if (line.record.GP_Additional_Payroll_Costs__c > 0) {
                sumOfAdditionalPayrollCostsGlobal += line.record.GP_Additional_Payroll_Costs__c;
            }
        });
    }
    debug('Sum of Global Platform  Cost: ' + sumOfPlatormCostGlobal);
    debug('Sum of Global Compliant Cost: ' + sumOfCompliantCostGlobal);
    debug('Sum of Global Revenue Contribution :' + sumOfContRevenueGlobal);
    debug('Sum of Global AdditonalPayrollCosts : ' + sumOfAdditionalPayrollCostsGlobal);

    //Calculating Totals at Global Bundle
    quoteLineModels.forEach(function (line) {
        var globalPlatformAccessCost = 0;
        var globalConpliantEmploymentCost = 0;
        var globalRevenue = 0;
        var globaladditionalPayrollCosts = 0;//Variable to save the additional payroll costs value
        //Find Global Bundle
        if (line.ProductCode__c === 'GLOBAL') {
            //Iterate over Global child lines to sum all totals
            line.components.forEach(function (globalLine) {
                if (globalLine.record.GP_Platform_Access_Costs__c > 0) {
                    globalPlatformAccessCost += globalLine.record.GP_Platform_Access_Costs__c;
                }
                if (globalLine.record.GP_Cost_of_Compliant_Employment__c > 0) {
                    globalConpliantEmploymentCost += globalLine.record.GP_Cost_of_Compliant_Employment__c;
                }
                if (globalLine.record.GP_Contribution_to_Revenue__c > 0) {
                    globalRevenue += globalLine.record.GP_Contribution_to_Revenue__c;
                }
                if (globalLine.record.GP_Additional_Payroll_Costs__c > 0) {
                    globaladditionalPayrollCosts += globalLine.record.GP_Additional_Payroll_Costs__c;
                }
            });

            //Multiply Totals by Quantity on global bundle
            globalPlatformAccessCost = globalPlatformAccessCost * line.record.SBQQ__Quantity__c;
            globalConpliantEmploymentCost = globalConpliantEmploymentCost * line.record.SBQQ__Quantity__c;
            globalRevenue = globalRevenue * line.record.SBQQ__Quantity__c;
            globaladditionalPayrollCosts = globaladditionalPayrollCosts * line.record.SBQQ__Quantity__c;

            debug('Global Platform  Cost: ' + globalPlatformAccessCost);
            debug('Global Compliant Cost: ' + globalConpliantEmploymentCost);
            debug('Global Revenue: ' + globalRevenue);
            debug('Global Additional Payroll Costs  : ' + globaladditionalPayrollCosts);

            //Assigning Totals to all lines under global bundle
            line.components.forEach(function (globalLine) {
                //Calculate Platform Access Cost
                globalLine.record.GP_Platform_Access_Costs_Target__c =
                    sumOfPlatormCostGlobal * globalLine.record.SBQQ__Quantity__c + globalPlatformAccessCost;
                //Calculate Compliant Employment Cost
                globalLine.record.GP_Cost_of_Compliant_Employment_Target__c =
                    sumOfCompliantCostGlobal * globalLine.record.SBQQ__Quantity__c + globalConpliantEmploymentCost;
                //Calculate Revenue
                globalLine.record.GP_Professional_Total_Revenue__c =
                    sumOfContRevenueGlobal * globalLine.record.SBQQ__Quantity__c + globalRevenue;
                //Calculate Additional Payroll Costs Target
                globalLine.record.GP_Additional_Payroll_Costs_Target__c =
                    sumOfAdditionalPayrollCostsGlobal * globalLine.record.SBQQ__Quantity__c + globaladditionalPayrollCosts;

                debug('Global Platform Target: ' + globalLine.record.GP_Platform_Access_Costs_Target__c);
                debug('Global Compliant Target: ' + globalLine.record.GP_Cost_of_Compliant_Employment_Target__c);
                debug('Global Total Revenue: ' + globalLine.record.GP_Professional_Total_Revenue__c);
                debug('Global Additional Payroll Costs Target :' + globalLine.record.GP_Additional_Payroll_Costs_Target__c);
            });
            line.record.GP_Platform_Access_Costs_Target__c = sumOfPlatormCostGlobal * line.record.SBQQ__Quantity__c + globalPlatformAccessCost;
            line.record.GP_Cost_of_Compliant_Employment_Target__c = sumOfCompliantCostGlobal * line.record.SBQQ__Quantity__c + globalConpliantEmploymentCost;
            line.record.GP_Professional_Total_Revenue__c = sumOfContRevenueGlobal * line.record.SBQQ__Quantity__c + globalRevenue;
            line.record.GP_Additional_Payroll_Costs_Target__c = sumOfAdditionalPayrollCostsGlobal * line.record.SBQQ__Quantity__c + globaladditionalPayrollCosts;
        }
    });
}

/*[EIA-1922] - Make sure the ListPrice, PercentagePrice and Discount are same on all Service Fee Base lines under each Country*/
function validateLocalProducts(quoteModel, quoteLineModels) {
    let obj = {};
    let errorFlag = false;
    let service_fee_Base = quoteLineModels.filter(line => line.ProductCode__c === 'SERVICE_FEE_BASE');
    for (let line of service_fee_Base) {
        let key = line.record.GP_Country__c + ' ' + line.ProductCode__c;
        //if the key is already in the object
        if (key in obj) {
            //For Service_Fee_Base make sure the List Price, Discount and Percentage Price are all the same
            if (line.ListPrice__c !== obj[key].ListPrice ||
                line.record.GP_Percentage_Price__c !== obj[key].PercentagePrice ||
                line.AdditionalDiscountAmount__c !== obj[key].AdditionalDiscountAmount ||
                line.GP_Expiry_Date__c !== obj[key].ExpiryDate) {
                errorFlag = true;
                //break the inner loop when the first mismatch is found to avoid further looping
                break;
            }
        }
        //create a new attribute of the object with the key
        else {
            obj[key] = {
                'ListPrice': line.ListPrice__c,
                'PercentagePrice': line.record.GP_Percentage_Price__c,
                'AdditionalDiscountAmount': line.AdditionalDiscountAmount__c,
                'ExpiryDate': line.GP_Expiry_Date__c
            };
        }
    }
    //set the field on the quote that is used in the Error Condition of Product Validation Rule
    if (errorFlag) {
        quoteModel.record.Legacy_Lines_Do_Not_Match__c = true;
    }
    else {
        quoteModel.record.Legacy_Lines_Do_Not_Match__c = false;
    }
}


/*EIA-5930: Fields to capture Grace Period, Term Lenght In Month & PoP on QL & Quote - 1.5*
For some reason default value for Term_Length_in_months__c in not being fetched from feilds metadate in quote line editor so i have to explicitily add it througth the script. Don't ask me why its happening.
*/
function setDefaultValueForTermLenghtInMonths(quoteModel, quoteLineModels) {
    if (quoteModel.record.Pricing_Model_Subtype__c === 'Term Commitment') {
        quoteLineModels.forEach(line => {
            if (line.ProductCode__c === 'MERIDIAN_CORE' || line.ProductCode__c === 'MERIDIAN_PRIME') {
                if (!line.record.Term_Length_in_months__c) {
                    line.record.Term_Length_in_months__c = 12;
                }
            }
        });
    }
}

/*[EIA-1922] - Make sure no two EOR Services have the same Country*/
function validateEORServicesCountPerCountry(quoteModel, quoteLineModels) {
    let allEorCountries = quoteLineModels.reduce((all, line) => {
        if (line.ProductCode__c === 'EOR_SERVICES') {
            all.push(line.record.GP_Country_Attribute__c);
        }
        return all;
    }, []);
    let uniqueEorCountries = new Set(allEorCountries);
    if (allEorCountries.length !== uniqueEorCountries.size) {
        quoteModel.record.Duplicate_Countries_Found__c = true;
    }
    else {
        quoteModel.record.Duplicate_Countries_Found__c = false;
    }
}
/*[EIA-1922] - Update the Number of Global Product to -1 */
function updateNumberonGlobal(quoteLineModels) {
    for (let line of quoteLineModels) {
        if (line.ProductCode__c === 'GLOBAL') {
            line.Number__c = -1;
            break;
        }
    }
}
/*[EIA-1922] - Enforce Reconfiguration when Pricing Model changes*/
function ensureReconfiguration(quoteModel, quoteLineModels) {
    for (let line of quoteLineModels) {
        if (line.ProductCode__c === 'EOR_SERVICES') {
            console.log('INIT ' + initialModel);
            console.log('CURR ' + line.record.ProductPriceModel__c);
            //if Std/Ent -> Meridian
            if (initialModel && !initialModel.includes('Meridian') && line.record.ProductPriceModel__c.includes('Meridian')) {
                quoteModel.record.Reconfiguration_Required__c = true;
                console.log('if Std/Ent -> Meridian');
            }
            //else if Meridian Prime -> Meridian Core or vice versa
            else if (initialModel && initialModel.includes('Meridian') && line.record.ProductPriceModel__c.includes('Meridian')) {
                quoteModel.record.Reconfiguration_Required__c = false;
                console.log('else if Meridian Prime -> Meridian Core or vice versa');
            }
            //else if Enterprise -> Std or vice versa
            else if (initialModel && initialModel !== line.record.ProductPriceModel__c) {
                quoteModel.record.Reconfiguration_Required__c = true;
                console.log('else if Enterprise -> Std or vice versa');
            }
            else {
                quoteModel.record.Reconfiguration_Required__c = false;
                console.log('else');
            }
            break;
        }
    }
}

/*[EIA-4553] - Enforce Reconfiguration when Partners are assigned*/
function ensureReconfigurationAdvisory(quoteModel, quoteLineModels) {
    for (let line of quoteLineModels) {
        if (line.record.Just_Configured__c === true ) {
        line.RequiredBy__r.Needs_to_be_reconfigured__c = false;
        line.record.Just_Configured__c = false;
    }
    }
}

/*EIA-2071 Update the Monthly Currency Fee */
function updateMonthlyCurrencyFee(quoteLineModels, quoteModel) {
    if (quoteLineModels.length > 0) {
        var monthlyCurrencyFee;
        /*EIA-2071 to update the Monthly currency transaction fee with global currency transaction fee*/
        quoteLineModels.forEach(line => {
            if (line.ProductCode__c === 'EOR_SERVICES') {
                //looping through the children of EOR Services
                line.components.forEach(eorChild => {
                    //loop through each Professional EOR Service
                    if (eorChild.ProductCode__c === 'PROFESSIONAL') {
                        eorChild.components.forEach(professionalChild => {
                            if (professionalChild.ProductCode__c === 'MONTHLY_CURRENCY_FEE') {
                                console.log('local curr ' + professionalChild.record.GP_Country_s_Local_Currency__c + ' currencyiso ' + quoteModel.CurrencyIsoCode);
                                if (professionalChild.record.GP_Country_s_Local_Currency__c != quoteModel.CurrencyIsoCode) {
                                    monthlyCurrencyFee = globalCurrencyTransactionFee;
                                    console.log('Monthly Currency Fee under Professional' + monthlyCurrencyFee);
                                }
                                else if (professionalChild.record.GP_Country_s_Local_Currency__c == quoteModel.CurrencyIsoCode) {
                                    monthlyCurrencyFee = 0;
                                    console.log('Local Currency Matched and monthly currency fee ' + monthlyCurrencyFee);
                                }
                                professionalChild.record.GP_Percentage_Price__c = monthlyCurrencyFee;
                            }
                        });
                    }


                });
            }
        });
    }
}
/*EIA-1977 to updateGeneratedContractedPrice */
function updateGenerateContractedPrice(quoteLineModels) {
    let linesToBeUpdated = [];
    let countryPlusProductCodes = [];
    quoteLineModels.forEach(line => {
        if (line.record.Create_Contracted_Price__c &&
            !(line.ProductCode__c.includes('MERIDIAN_PRIME')) && !(line.ProductCode__c.includes('MERIDIAN_CORE'))) {
            if (linesToBeUpdated && linesToBeUpdated.indexOf(line.ProductCode__c) !== -1) {
                if (countryPlusProductCodes && countryPlusProductCodes.indexOf(line.record.Country_plus_Product__c) === -1) {
                    line.record.SBQQ__GenerateContractedPrice__c = 'Do Not Generate';
                    countryPlusProductCodes.push(line.record.Country_plus_Product__c);
                }
            }
            else {
                line.record.SBQQ__GenerateContractedPrice__c = (line.DiscountSchedule__c) ? 'Discount Schedule' : 'Price';
                linesToBeUpdated.push(line.ProductCode__c);
                countryPlusProductCodes.push(line.record.Country_plus_Product__c);
            }
        }
        else if (line.ProductCode__c.includes('MERIDIAN_PRIME')) {
            if (line.record.ProductPriceModel__c === 'Meridian Prime') {
                line.record.SBQQ__GenerateContractedPrice__c = (line.DiscountSchedule__c) ? 'Discount Schedule' : 'Price';
            }
            else {
                line.record.SBQQ__GenerateContractedPrice__c = '';
            }
        }
        else if (line.ProductCode__c.includes('MERIDIAN_CORE')) {
            if (line.record.ProductPriceModel__c === 'Meridian Core') {
                line.record.SBQQ__GenerateContractedPrice__c = (line.DiscountSchedule__c) ? 'Discount Schedule' : 'Price';
            }
            else {
                line.record.SBQQ__GenerateContractedPrice__c = '';
            }
        }
        else {
            line.record.SBQQ__GenerateContractedPrice__c = '';
        }
    })
}

export function onAfterPriceRules(quoteModel, quoteLineModels) {
    return new Promise((resolve, reject) => {
        let enterprisePricingModel = 'Enterprise';
        let standardPricingModel = 'Standard';
        /* [EIA-1980] - Quote Sub Types (forking CPQ 1 / CPQ 2)*/
        if (quoteModel.record.EditLinesFieldSetName__c === 'SBQQ__LineEditor') {
            if (quoteLineModels.length > 0) {
                //Method to update MonthlyCurrencyFee
                updateMonthlyCurrencyFee(quoteLineModels, quoteModel);

                if (quoteModel.record.Pricing_Model__c === enterprisePricingModel || quoteModel.record.Pricing_Model__c === standardPricingModel) {
                    //Calculate Management Fees
                    calculateMgmtFees(quoteLineModels);
                    /*[EIA-1922] - Make sure the ListPrice, PercentagePrice and Discount are same on all Service Fee Base lines under each Country*/
                    validateLocalProducts(quoteModel, quoteLineModels);
                }
                //Calculate Totals for Global Products
                //calculateGlobalTotals(quoteLineModels);
            }
        }
        resolve();
    });
}

/**
 * This method is called by the calculator after price rules are evaluated.
 * @param {QuoteModel} quoteModel JS representation of the quote being evaluated
 * @param {QuoteLineModel[]} quoteLineModels An array containing JS representations of all lines in the quote
 * @returns {Promise}
 */
export function onAfterCalculate(quoteModel, quoteLineModels) {
    return new Promise((resolve, reject) => {
        if (quoteLineModels.length > 0) {
            if (quoteModel.record.EditLinesFieldSetName__c === 'Legacy_Line_Editor') {
                taxCalculationCPQ1(quoteLineModels);
                /* [EIA - 2398] - Performance Testing - Converted Process Builder to QCP*/
                recruitingProductQuoteUpdateCPQ1(quoteModel, quoteLineModels);
                /* [EIA - 2398] - Performance Testing - Converted RHX QL Trigger to QCP*/
                rollupCountryNamesCPQ1(quoteModel, quoteLineModels);
            }
            else {
                updateGenerateContractedPrice(quoteLineModels);
                /* [EIA - 2729] - Update Country Names on CPQ 2*/
                rollupCountryNamesCPQ2(quoteModel, quoteLineModels);
                //Calculate Totals
                calculateTotals(quoteLineModels);
            }
        }
        resolve();
    });
}
export function onBeforePriceRules(quoteModel, quoteLineModels) {
    /* [EIA-1980] - Quote Sub Types (forking CPQ 1 / CPQ 2)*/
    if (quoteModel.record.EditLinesFieldSetName__c === 'SBQQ__LineEditor') {
        if (quoteLineModels.length > 0) {
            //Method to calculate the number of professionals on the quote
            calculateProfessionalCount(quoteLineModels);
            /*EIA-2071 - To assign global currency transaction fee*/
            quoteLineModels.forEach(line => {
                console.log('Line Product Code '+line.ProductCode__c);
                if (line.ProductCode__c === 'GLOBAL') {
                    //looping through the children of EOR Services
                    line.components.forEach(globalChild => {
                        if (globalChild.ProductCode__c === 'GLOBAL_CURRENCY_TRANSACTION_FEE') {
                            globalCurrencyTransactionFee = globalChild.record.GP_Percentage_Price__c;
                            console.log('Global Currency Transaction Fee @@@>' + globalCurrencyTransactionFee);
                        }
                    });
                }
            });
        }
    }
    return Promise.resolve();
}

export function onInit(quoteLineModels) {
    if (quoteLineModels.length > 0) {
        /*[EIA-1922] - Find the Previous Value of Product Pricing Model*/
        for (let line of quoteLineModels) {
            if (line.ProductCode__c === 'EOR_SERVICES') {
                initialModel = line.record.ProductPriceModel__c;
                break;
            }
        }
    }
    return Promise.resolve();
};

export function onBeforeCalculate(quoteModel, quoteLineModels) {
    /* [EIA-1980] - Quote Sub Types (forking CPQ 1 / CPQ 2)*/
    if (quoteModel.record.EditLinesFieldSetName__c === 'SBQQ__LineEditor') {
        if (quoteLineModels.length > 0) {

            setDefaultValueForTermLenghtInMonths(quoteModel, quoteLineModels);
            /*[EIA-1922] - Make sure no two EOR Services have the same Country*/
            validateEORServicesCountPerCountry(quoteModel, quoteLineModels);
            /*[EIA-1922] - Update the Number of Global Product to -1 */
            updateNumberonGlobal(quoteLineModels);
            /*[EIA-1922] - Enforce Reconfiguration when Pricing Model changes*/
            ensureReconfiguration(quoteModel, quoteLineModels);
        }
    }
    else if(quoteModel.record.EditLinesFieldSetName__c === 'Advisor_Fields'){
    /*[EIA-4553] - Enforce Reconfiguration when Partners are assigned*/
        ensureReconfigurationAdvisory(quoteModel, quoteLineModels);
    }
    return Promise.resolve();
}

export function isFieldEditable(fieldName, quoteLineModelRecord) {
    if (quoteLineModelRecord.Negotiated_or_NOT__c == 'NOT') {
        if (fieldName == 'GP_Percentage_Price__c' ||
            fieldName == 'SBQQ__ListPrice__c' ||
            fieldName == 'SBQQ__AdditionalDiscount__c') {
            return false;
        }
    }
    /*[EIA-4850] -  Quantity, Billing Frequency, Category and Pricing Model fields should be pre-populated and not editable in QLE */
    else if (quoteLineModelRecord.ProductPriceModel__c == 'Advisory') {
        if (fieldName == 'SBQQ__BillingFrequency__c' ||
            fieldName == 'Category__c') {
            return false;
        }
    }
    /*[EIA-2238] - Adjust which Quote Lines generate Contracted Prices */
    else if (quoteLineModelRecord.SBQQ__ProductCode__c == 'GLOBAL_CURRENCY_TRANSACTION_FEE') {
        if (fieldName == 'SBQQ__AdditionalDiscount__c') {
            return false;
        }
    }
    /*[EIA-2206] - Major VAT/GST-lock percentage price*/
    else if (quoteLineModelRecord.SBQQ__ProductCode__c == 'VAT_GST') {
        if (fieldName == 'GP_Percentage_Price__c') {
            return false;
        }
    }
    /*[EIA-3446] - Sync issue for Management fee from Contracted Price to GPP Pricing Engine*/
    else if (quoteLineModelRecord.GP_PricingType__c == 'List/Net Price only') {
        if (fieldName == 'GP_Percentage_Price__c') {
            return false;
        }
    }
 /* else {
        if (fieldName == 'GP_Percentage_Price__c' ||
            fieldName == 'SBQQ__ListPrice__c') {
            return true;
        }
    }*/
    /*EIA-5932 If the Quote has ‘Pricing Model Subtype’ of ‘Term Commitment’, then it should not be possible to edit the values in the ‘Expiry Date’ or ‘Price After Expiry Date’ fields on the Meridian Prime and Core Management Fee quote lines.*/
    if(quoteLineModelRecord.SBQQ__Quote__r.Pricing_Model_Subtype__c == 'Term Commitment') {
        if(quoteLineModelRecord.SBQQ__ProductCode__c == 'MERIDIAN_CORE' || quoteLineModelRecord.SBQQ__ProductCode__c == 'MERIDIAN_PRIME'){
            if(fieldName == 'GP_Expiry_Date__c' || fieldName == 'GP_Price_after_Expiry_Date__c'){
                return false;
            }
        }
    }
};

export function isFieldVisible(fieldName, quoteLineModelRecord) {
    if (quoteLineModelRecord.SBQQ__ProductCode__c != 'SERVICE_FEE_BASE' &&
        quoteLineModelRecord.SBQQ__ProductCode__c != 'SERVICE_FEE_VARIABLE') {
        if (fieldName == 'Monthly_Maximum__c') {
            return false;
        }
    }
    //EIA-1964,2238: Phase 4 - Effective & Expiry Dates on Prices
    if (!quoteLineModelRecord.Allow_Expiry__c) {
        if (fieldName == 'GP_Expiry_Date__c' ||
            fieldName == 'GP_Percentage_Price_after_Expiry_Date__c' ||
            fieldName == 'GP_Price_after_Expiry_Date__c') {
            return false;
        }
    }
    //EIA-1964,2238: Phase 4 - Effective & Expiry Dates on Prices
    if (quoteLineModelRecord.SBQQ__ProductCode__c != 'EEB_LOCAL' &&
        quoteLineModelRecord.SBQQ__ProductCode__c != 'EEB_EXPAT') {
        if (fieldName == 'Estimated_Social_Charges_Override__c') {
            return false;
        }
    }
//EIA-2346: WHEN - QCP hiding of notes fields in drawer
    if (quoteLineModelRecord.SBQQ__Quote__r.EditLinesFieldSetName__c === 'Legacy_Line_Editor') {
        if (fieldName == 'GP_Internal_Note__c' || fieldName == 'GP_External_Note__c' ) {
            return false;
        }
    }
    //EIA-5930 Hiding fields in drawer
    if (quoteLineModelRecord.SBQQ__Quote__r.Pricing_Model_Subtype__c == 'Term Commitment' &&
         ( quoteLineModelRecord.SBQQ__ProductCode__c != 'MERIDIAN_CORE' && quoteLineModelRecord.SBQQ__ProductCode__c != 'MERIDIAN_PRIME')){
        
            if(fieldName == 'PoP_Commitment__c' || fieldName == 'Term_Length_in_months__c'){
                return false; 
        

            }

    }
    if(quoteLineModelRecord.SBQQ__Quote__r.Pricing_Model_Subtype__c == 'Month to Month'){
        if(fieldName == 'PoP_Commitment__c' || fieldName == 'Term_Length_in_months__c'){
            return false; 
        }  
    }


    //EIA-5932 Hide the fields if Pricing Model is 'Meridian Prime' or 'Contractor Only'
    if( quoteLineModelRecord.SBQQ__Quote__r.Pricing_Model__c == 'Meridian Prime' || quoteLineModelRecord.SBQQ__Quote__r.Pricing_Model__c == 'Meridian Core' || quoteLineModelRecord.SBQQ__Quote__r.Pricing_Model__c == 'Contractor only'){
        if(fieldName == 'USA_State__c' || fieldName == 'Monthly_Service_Fee__c' || fieldName == 'Monthly_Fee_Variable__c' || fieldName == 'Accruing_statutory_severance__c' || fieldName == 'Monthly_Service_Fee_Discount__c' || fieldName == 'Monthly_Fee_Variable_Discount__c' || fieldName == 'Estimated_Social_Charges__c' || fieldName == 'Markup_on_Expenses_amount__c' || fieldName == 'Minimum_Monthly_Service_Fee__c' || fieldName == 'Markup_on_Expenses__c' || fieldName == 'Min_Monthly_Service_Fee_Discount__c' || fieldName == 'Setup_Fee_per_Additional_Professional__c' || fieldName == 'Additional_Month_Payment__c' || fieldName == 'Monthly_Service_Fee_Calculated__c' || fieldName == 'Total_Monthly_Cost__c' || fieldName == 'VAT_GST__c' || fieldName == 'Minimum_Monthly_Service_Fee_Calculated__c' || fieldName == 'Contractor__c' || fieldName == 'GP_Additional_Payroll_Costs__c'){
            return false;
        }
    }
};

function mapRecords(quoteLineModels) {
    return quoteLineModels.map(model => model.record);
}

function logRecords(quoteOrLineModel) {
    // serializing records removes proxy to make debugging easier,
    // BUT is a performance hit, so make sure to disable logging in production to avoid this without code changes
    if (DEBUG) {
        const models = Array.isArray(quoteOrLineModel) ? quoteOrLineModel : [quoteOrLineModel];
        debug(JSON.parse(JSON.stringify(mapRecords(models))));
    }
}
