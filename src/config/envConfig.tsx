const baseURL = () => {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:44375/api"
  );
};

const ApiKey = () => {
  return (
    process.env.NEXT_PUBLIC_API_KEY || "NaturubBD_Project_OneDashboad_2025"
  );
};

export const envConfig = { baseURL, ApiKey };