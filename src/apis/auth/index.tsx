import axiosInstance from "@/lib/axiosInstance";

const loginUserMutation = (user: {
  Username: string;
  Password: string;
}) => axiosInstance.post("Auth/login", user).then((res) => res.data);

const profileData = async () => await axiosInstance.get("Auth/profile").then((res) => res.data);

// const profileData = () => axiosInstanceApiKey.get("Auth/profile").then((res) => res.data);




export const authApis = {
  loginUserMutation,
  profileData
};