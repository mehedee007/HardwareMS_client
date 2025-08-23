import { UserProfileModel } from "@/lib/userTypes"
import { create } from "zustand"
import Cookies from "js-cookie";
import { constents } from "@/constents";


type BearState = {
  loginUser: UserProfileModel | null
  setLoginUser: (user: UserProfileModel) => void
  updateLoginUser: (partial: Partial<UserProfileModel>) => void
  clearLoginUser: () => void
}

const useStore = create<BearState>((set) => ({
  loginUser: null,

  // set full user data
  setLoginUser: (user) => set(() => ({ loginUser: user })),

  // merge/patch existing user data
  updateLoginUser: (partial) =>
    set((state) => ({
      loginUser: state.loginUser ? { ...state.loginUser, ...partial } : null,
    })),

  // clear user data (logout)
  clearLoginUser: () => {
    set({ loginUser: null }); 
    Cookies.remove(constents.AUTH_KEY);
    window.location.href = "/";
    return;
  },
}))

export default useStore
