import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material';
import CustomTooltip from './CustomTooltip';
import CustomLegend from './CustomLegend';
import { subCategoryColors } from '../../../constants/subCategoryColors';

const PieChartGraph = ({ data, t, isRTL, activeIndex, setActiveIndex }) => {
  const theme = useTheme();

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={150}
          innerRadius={75}
          fill="#8884d8"
          dataKey="value"
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
          animationDuration={1000}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={subCategoryColors[entry.name] || theme.palette.primary.main}
              stroke={theme.palette.background.paper}
              strokeWidth={2}
              style={{
                filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                cursor: 'pointer',
              }}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          content={<CustomLegend payload={data} isRTL={isRTL} t={t} />}
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={12}
          wrapperStyle={{
            padding: '0 16px',
            textAlign: isRTL ? 'right' : 'left',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartGraph;
