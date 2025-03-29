import { SuperAgentRequest } from "superagent"
import BaseService from "./BaseService"

export interface SetupInterface {
    app_name?: string
    timezone?: string
    name?: string
    email?: string
    password?: string
    password_confirm?: string

    [key:string]: any
}

export default {
    async submit(props: SetupInterface, callback?: { (props: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.post(BaseService.URL["setup.submit"]).send(props);
            if (callback != null) {
                callback(request);
            }
            let resData = await request
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    }
}