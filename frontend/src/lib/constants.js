// AQI colours, from clean to severe
export const categoryColors = {
  Good: "#4DBE8A",
  Satisfactory: "#BBC95A",
  Moderate: "#E9B44C",
  Poor: "#EE8A48",
  "Very Poor": "#E05A55",
  Severe: "#BF4F95",
};

export const getAQICategory = (aqi) => {
  let category = "Severe";
  let description = "Health emergency - everyone affected";

  if (aqi <= 50) {
    category = "Good";
    description = "Air quality is satisfactory";
  } else if (aqi <= 100) {
    category = "Satisfactory";
    description = "Acceptable air quality";
  } else if (aqi <= 200) {
    category = "Moderate";
    description = "May cause breathing discomfort";
  } else if (aqi <= 300) {
    category = "Poor";
    description = "May cause respiratory issues";
  } else if (aqi <= 400) {
    category = "Very Poor";
    description = "May cause serious health effects";
  }

  return { category, color: categoryColors[category], description };
};
