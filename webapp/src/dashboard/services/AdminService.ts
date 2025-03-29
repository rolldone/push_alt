import SetUrl from "../components/helper/SetUrl"
import BaseService from "./BaseService"

export type AuthType = {
    id?: number
    email?: string
    password?: string
    readmin_me?: boolean
}

export type AdminType = AuthType & {
    password_confirmation?: string
    name?: string
    last_name?: string
    status?: "active" | "inactive"
    address?: string
    no_telp?: string
    province?: string
    city?: string
    country?: string
    at_group_id?: string

    agree_to_terms?: boolean
    created_at?: string
    updated_at?: string
    deleted_at?: string

    is_change_password?: boolean
    new_password?: string
    new_password_confirmation?: string
}


export type AdminSearchType = AdminType & {
    search?: string
    page?: number
    take?: number
    data_position?: string
}


export default {
    async getAdmins(props: AdminSearchType) {
        try {
            let resData = await BaseService.superagent.get(BaseService.URL["admin.admins"]).query(props);
            return resData.body;
        } catch (error) {
            throw error;
        }
    },
    async postGetAdmins(props: AdminSearchType) {
        try {
            let resData = await BaseService.superagent.post(BaseService.URL["admin.admins"]).send(props);
            return resData.body;
        } catch (error) {
            throw error;
        }
    },
    async getAdmin(id: number) {
        try {
            let resData = await BaseService.superagent.get(SetUrl(BaseService.URL["admin.view"], [{ "{id}": id }])).query({});
            return resData.body;
        } catch (error) {
            throw error;
        }
    },
    async add(props: AdminType) {
        try {
            let resData = await BaseService.superagent.post(BaseService.URL["admin.add"]).send(props);
            return resData.body;
        } catch (error) {
            throw error;
        }
    },
    async update(props: AdminType) {
        try {
            let resData = await BaseService.superagent.put(BaseService.URL["admin.update"]).send(props);
            return resData.body;
        } catch (error) {
            throw error;
        }
    },
    async restore(ids: Array<number>) {
        try {
            let resData = await BaseService.superagent.post(BaseService.URL["admin.restore"]).send({
                ids: ids
            });
            return resData.body;
        } catch (error) {
            throw error;
        }
    },
}