import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

const CategoryDetailsPage = () => {
  const { year, month } = useParams(); // Retrieve year and month from URL
  const location = useLocation();
  const categoryName = location.state?.categoryName || 'Unknown Category'; // Get the category name passed in state

  return (
    <div>
      <h2>פירוט הוצאות עבור {categoryName}</h2>
      <p>שנה: {year}</p>
      <p>חודש: {month}</p>
      {/* Here you can add more details about the selected category if needed */}
    </div>
  );
};

export default CategoryDetailsPage;
