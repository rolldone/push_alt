import { SuperAgentRequest } from "superagent"
import BaseService from "./BaseService"
import SetUrl from "../components/helper/SetUrl"
import { WorkspacesType } from "./WorkspacesService";

export interface MessagePostType {
    app_id?: string
    channel_name?: string
    body?: string
}


export default {
    async emit(props: MessagePostType, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.post(BaseService.URL["message.emit"]).send(props);
            if (callback != null) {
                callback(request);
            }
            let resData = await request;
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
}
