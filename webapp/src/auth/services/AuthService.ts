import { SuperAgentRequest } from "superagent"
import BaseService from "./BaseService"

export type AuthType = {
  id?: number
  email?: string
  password?: string
}

export type UserType = AuthType & {
  password_confirmation?: string
  first_name?: string
  last_name?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string
}

export default {
  async login(props: AuthType, callback?: { (request: SuperAgentRequest): void }) {
    try {
      let request = BaseService.superagent.post(BaseService.URL["auth.login"]).send(props);
      if (callback != null) {
        callback(request);
      }
      let resData = await request;
      return resData.body;
    } catch (ex) {
      throw ex;
    }
  },
  // async register(props: UserType) {
  //   try {
  //     let resData = await BaseService.superagent.post(BaseService.URL["auth.register"]).send(props);
  //     return resData.body;
  //   } catch (ex) {
  //     throw ex;
  //   }
  // },
  // async forgotPassword(email: string) {
  //   try {
  //     let resData = await BaseService.superagent.post(BaseService.URL["auth.forgot_password"]).send({
  //       email
  //     });
  //     return resData.body;
  //   } catch (ex) {
  //     throw ex;
  //   }
  // },
  // async profile() {
  //   try {
  //     let resData = await BaseService.superagent.get(BaseService.URL["auth.profile"]).query({});
  //     return resData.body;
  //   } catch (ex) {
  //     throw ex;
  //   }
  // },
  // async updateProfile(props: any) {
  //   try {
  //     let resData = await BaseService.superagent.post(BaseService.URL["auth.profile.update"]).send(props);
  //     return resData;
  //   } catch (ex) {
  //     throw ex;
  //   }
  // },
  async logout() {
    try {
      let refresh_token = window.localStorage.getItem("refresh_token")
      let resData = await BaseService.superagent.post(BaseService.URL["auth.logout"]).send({
        refresh_token: refresh_token
      });
      localStorage.removeItem("token")
      localStorage.removeItem("refresh_token")
      return resData.body;
    } catch (ex) {
      throw ex;
    }
  },
}