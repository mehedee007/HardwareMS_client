

export const constents = {
  AUTH_KEY: "__GrievanceSystem__authkey_2025_kamrul"
};


export const UI_CONFIG = {
  MAX_MESSAGE_LENGTH: 4000,
  SCROLL_BEHAVIOR: "smooth" as ScrollBehavior,
  ANIMATION_DURATION: 300,
  SIDEBAR_WIDTH: 260,
} as const


// utils/checkDesignation.ts
export function hasValidDesignation(loginUser: any) {
  /*
--Admin: 462
--Welfa: 508
--A.Adm: 1639
--CEO  : 555
  */
  const allowedDesignations = ["462", "508", "1639", "555", "525", "1665"];
  return allowedDesignations.some((id) => loginUser?.designationID?.includes(id));
}


export function hasWelfairDesignation(loginUser: any){
   const allowedDesignations = ["508"];
  return allowedDesignations.some((id) => loginUser?.designationID?.includes(id));
}

export function hasAdminValidDesignation(loginUser: any) {
  /*
--Admin: 462
--Welfa: 508
--A.Adm: 1639
--CEO  : 555
  */
  const allowedDesignations = ["462", "1639", "555"];
  return allowedDesignations.some((id) => loginUser?.designationID?.includes(id));
}



