const expenseCategoryEnum = {
    COST_OF_REVENUES: 'costOfRevenues',
    GENERAL_EXPENSES: 'generalExpenses'
};

const expenseSubCategoryEnum = {
    // Cost of Revenues subcategories
    SALARIES_AND_RELATED: 'salariesAndRelated',
    COMMISSIONS: 'commissions',
    EQUIPMENT_AND_SOFTWARE: 'equipmentAndSoftware',
    OFFICE_EXPENSES: 'officeExpenses',
    VEHICLE_MAINTENANCE: 'vehicleMaintenance',
    DEPRECIATION: 'depreciation',

    // General Expenses subcategories
    MANAGEMENT_SERVICES: 'managementServices',
    PROFESSIONAL_SERVICES: 'professionalServices',
    ADVERTISING: 'advertising',
    RENT_AND_MAINTENANCE: 'rentAndMaintenance',
    POSTAGE_AND_COMMUNICATIONS: 'postageAndCommunications',
    OFFICE_AND_OTHER: 'officeAndOther'
};
    
module.exports = {
    expenseCategoryEnum,
    expenseSubCategoryEnum,
};
  