import SetUrl from "../components/helper/SetUrl"
import BaseService from "./BaseService"

export interface SettingInterface {
    id?: number | null
    app_name?: string
    timezone?: string
    installed_at?: string
    // Relation
}

export type SettingArrType = {
    name?: string
    value?: string
}

export interface SettingServiceInterface extends SettingInterface {
    search?: string
    page?: number
    take?: number
    return?: "basic" | "paginate"
}

export default {
    async getByName(name: string) {
        try {
            let resData = await BaseService.superagent.get(SetUrl(BaseService.URL["setting.view"], [{ "{name}": name }]));
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async gets() {
        try {
            let resData = await BaseService.superagent.get(BaseService.URL["setting.settings"]).query({});
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async getsFormSetting() {
        try {
            let resData = await BaseService.superagent.get(BaseService.URL["setting.gets_form_setting"]).query({});
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async addOrUpdateFormData(props: any) {
        try {
            let formData = new FormData();
            for (let key in props) {
                if (props[key] == null) continue;
                formData.append(key, props[key]);
            }
            let resData = await BaseService.superagent.post(BaseService.URL["setting.update_form_setting"]).send(formData);
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async addOrUpdate(props: SettingServiceInterface) {
        try {
            let resData = await BaseService.superagent.get(BaseService.URL["setting.add_or_update"]).query(props);
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    }
}