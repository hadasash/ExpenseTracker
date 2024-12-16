import { useTranslation } from 'react-i18next';

const CustomTooltip = ({ active, payload }) => {
    const { t } = useTranslation();  // Use useTranslation here
  
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {t(`categoryDetails.categories.${data.name}`)}
          </Typography>
          <Typography variant="body2">{t('tooltip.amount')}: ₪{data.value.toLocaleString()}</Typography>
          <Typography variant="body2">{t('tooltip.percentage')}: {data.percentage}%</Typography>
        </Paper>
      );
    }
    return null;
  };
  export default CustomTooltip;