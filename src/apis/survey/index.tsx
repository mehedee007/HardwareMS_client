

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
const dashboardInfo = async (data: { title?: string; deg_id: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/survey-dashboard", data);
  return res.data;
};
const surveyHeaderInfo = async (id: number | string) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/survey-headerInfo", id);
  return res.data;
};
const deleteSurvey = async (id: number | string) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/survey-delete", id);
  return res.data;
};
const searchEmployee = async ({ Search, formId }: { Search: string, formId?: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/search-employee", { Search, formId });
  return res.data;
};
const getFormFields = async ({ id }: { id: number }) => {
  const res: AxiosResponse = await axiosInstance.get(`EmployeeVoice/form-fields?form_id=${id}`);
  return res.data;
};
const sendResponse = async (data: any) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/save-response", data);
  return res.data;
};


const getUserResponse = async ({ formId }: { formId: number }) => {
  const res: AxiosResponse = await axiosInstance.get(`EmployeeVoice/getuser-response?id=${formId}`);
  return res.data;
};


const formApprove = async (data: { formId: number; state: number; remark: string; approvalId: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/approve-form", data);
  return res.data;
}


const tagForm = async (data: ItagUser) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/form-tag", data);
  return res.data;
}


const questionTagList = async (data: { form_id: number; question_id: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/questions-taglist", data);
  return res.data;
}


const tagApproval = async (data: { form_id: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/form-taglist", data);
  return res.data;
}


const removeTag = async (data: { id: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/remove-tag", data);
  return res.data;
}


const approveTags = async (data: { id: number, hrRemarks: string }[]) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/approval-tags", data);
  return res.data;
}


const getResponsible = async (data: { empId: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/responsible-gettags", data);
  return res.data;
}


const responsibleRemarks = async (data: { id: number; tagPersonRemark: string; tagWith: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/responsible-remarks", data);
  return res.data;
}


const tagState = async (data: { question_id: number; form_id: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/tags-state", data);
  return res.data;
}

const alreadyTag = async (data: { question_id: number; form_id: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/tags-alreadyadded", data);
  return res.data;
}


interface INewFormResponses {
  answer: string;
  formId: number;
  questionId: number;
  questionTypeTitle: string;
  empId: number;
  adminId: number;
}
const userResponses = async (data: INewFormResponses[]) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/user-responses", data);
  return res.data;
}


interface IFormResponse {
  formId: number;
  UserDeptName?: string | null;
  fromDate?: string | null;
  toDate?: string | null
}
const formResponses = async (data: IFormResponse) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/user-formResponse", data);
  return res.data;
}



interface IQuestionDetails {
  questionId: number;
  UserDeptName?: string | null;
  fromDate?: string | null;
  toDate?: string | null
}
const questionDetails = async (data: IQuestionDetails) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/questionwise-details", data);
  return res.data;
}


const tagQuestion = async (data: { addedBy: number; addedWith: number; questionId: number }[]) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/teg-question", data);
  return res.data;
}


const tagedPersons = async (data: { questionId: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/added-tagpersons", data);
  return res.data;
}



const tagedApproval = async (data: { questionId: number; type: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/approve-tagpersons", data);
  return res.data;
}


const surveyRemarks = async (data: { questionId: number; empID: number; remarks: string; state: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/survey-remarks", data);
  return res.data;
}



const surveyState = async (data: { id: number; type: number; state: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/survey-statechange", data);
  return res.data;
}


const getSurveyRemarks = async (data: { questionId: number; state: number }) => {
  const res: AxiosResponse = await axiosInstance.post("EmployeeVoice/get-surveyremarks", data);
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
  removeTag,
  approveTags,
  getResponsible,
  responsibleRemarks,
  tagState,
  alreadyTag,
  userResponses,
  formResponses,
  questionDetails,
  tagQuestion,
  tagedPersons,
  tagedApproval,
  surveyRemarks,
  surveyState,
  getSurveyRemarks
};
