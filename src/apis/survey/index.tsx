

import axiosInstance from "@/lib/axiosInstance";
import { PublishedForm } from "@/lib/surveyTypes";
import { ItagUser } from "@/lib/userTypes";
import { AxiosResponse } from "axios";




const publishForm = async (formData: PublishedForm) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/form-publishe", formData);
  return res.data;
};
const quickState = async () => {
  const res: AxiosResponse = await axiosInstance.get("EmployeeVoice/quick-state");
  return res.data;
};
const dashboardInfo = async () => {
  const res: AxiosResponse = await axiosInstance.get("EmployeeVoice/survey-dashboard");
  return res.data;
};
const surveyHeaderInfo = async (id: number|string) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/survey-headerInfo", id);
  return res.data;
};
const deleteSurvey = async (id: number|string) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/survey-delete", id);
  return res.data;
};
const searchEmployee = async ({Search, formId}:{Search: string, formId?: number}) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/search-employee", {Search, formId});
  return res.data;
};
const getFormFields = async ({id}:{id: number}) => {
  const res: AxiosResponse = await axiosInstance.get(`EmployeeVoice/form-fields?form_id=${id}`);
  return res.data;
};
const sendResponse = async (data:any) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/save-response", data);
  return res.data;
};


const getUserResponse = async ({formId}:{formId:number}) => {
  const res: AxiosResponse = await axiosInstance.get(`EmployeeVoice/getuser-response?id=${formId}`);
  return res.data;
};


const formApprove = async (data:{formId: number; state: number; remark: string; approvalId: number})=> {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/approve-form", data);
  return res.data;
}


const tagForm = async (data:ItagUser)=> {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/form-tag", data);
  return res.data;
}


const questionTagList = async (data:{form_id: number; question_id: number})=> {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/questions-taglist", data);
  return res.data;
}


const tagApproval = async (data:{form_id: number})=> {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/form-taglist", data);
  return res.data;
}


const removeTag = async (data:{id: number})=> {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/remove-tag", data);
  return res.data;
}




export const surveyApi = {
   publishForm,
    quickState, 
    dashboardInfo, 
    surveyHeaderInfo,
     deleteSurvey, 
     searchEmployee,
     getFormFields,
     sendResponse,
     getUserResponse,
     formApprove,
     tagForm,
     questionTagList,
     tagApproval,
     removeTag
    };
