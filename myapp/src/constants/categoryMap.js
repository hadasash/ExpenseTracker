export const categorySubcategoryMap = (t) => ({
  costOfRevenues: [
    { label: t('categoryDetails.categories.salariesAndRelated'), value: 'salariesAndRelated' },
    { label: t('categoryDetails.categories.commissions'), value: 'commissions' },
    { label: t('categoryDetails.categories.equipmentAndSoftware'), value: 'equipmentAndSoftware' },
    { label: t('categoryDetails.categories.officeExpenses'), value: 'officeExpenses' },
    { label: t('categoryDetails.categories.vehicleMaintenance'), value: 'vehicleMaintenance' },
    { label: t('categoryDetails.categories.depreciation'), value: 'depreciation' },
  ],
  generalExpenses: [
    { label: t('categoryDetails.categories.managementServices'), value: 'managementServices' },
    { label: t('categoryDetails.categories.professionalServices'), value: 'professionalServices' },
    { label: t('categoryDetails.categories.advertising'), value: 'advertising' },
    { label: t('categoryDetails.categories.rentAndMaintenance'), value: 'rentAndMaintenance' },
    { label: t('categoryDetails.categories.postageAndCommunications'), value: 'postageAndCommunications' },
    { label: t('categoryDetails.categories.officeAndOther'), value: 'officeAndOther' },
  ],
  categories: [
    { label: t('categoryDetails.categories.costOfRevenues'), value: 'costOfRevenues' },
    { label: t('categoryDetails.categories.generalExpenses'), value: 'generalExpenses' },
  ],
});