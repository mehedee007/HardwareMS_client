export interface UserLoginModel {
  userID?: number;
  empID?: string;
  userName?: string;
  password?: string;
}

export interface LoginResponse extends UserLoginModel {
  token?: string;
}

export interface CompanyModel {
  empID?: number;
  companyID?: number;
  companyCode?: string;
  companyName?: string;
  taxRegNo?: string;
  address?: string;
  phoneNumber?: string;
  faxNumber?: string;
  emailAddress?: string;
  binNo?: string;
}

export interface CustomThemeModel {
  type?: number;
  themeId?: number;
  empID?: number;
  themeName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfileModel {
  empNo?: string;
  empID?: number;
  userName?: string;
  departmentID?: string;
  departmentName?: string;
  sectionID?: string;
  sectionName?: string;
  designationID?: string;
  designationName?: string;
  levelName?: string;
  joiningDate?: string;
  endDate?: string;
  birthDate?: string;
  confirmationDate?: string;
  departmentOfHead?: string;
  sectionOfHead?: string;
  officialEmailAddress?: string;
  numberOfDepartmentEmployees?: number;
  numberOfSectionEmployees?: number;
  kpiRating?: number;
  userImage?: string; // or string if you're returning base64 from API
  active?: string;
  companyInfo?: CompanyModel[];
  customTheme?: CustomThemeModel;
}

export interface KPIModel {
  enteredBy?: number;
  fromDate?: string;
  toDate?: string;
  title?: string;
}

export interface INav {
  id: number;
  name: string;
  path: string;
}