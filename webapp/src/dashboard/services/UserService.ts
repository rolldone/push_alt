import BaseService from "./BaseService"

export type AuthType = {
    id?: number
    email?: string
    password?: string
}

export type UserType = AuthType & {
    password_confirmation?: string
    name?: string
    created_at?: string
    updated_at?: string
    deleted_at?: string

    // Local
    is_password_change?: boolean
}


export default {

    async profile() {
        try {
            let resData = await BaseService.superagent.get(BaseService.URL["auth.profile"]).query({});
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async refreshToken() {
        try {
            let refresh_token = localStorage.getItem("refresh_token");
            let resData = await BaseService.superagent.post(BaseService.URL["auth.profile.refresh_token"]).send({
                refresh_token
            });
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async updateProfile(props: any) {
        try {
            let resData = await BaseService.superagent.put(BaseService.URL["auth.profile.update"]).send(props);
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    }
}