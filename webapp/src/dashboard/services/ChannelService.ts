import { SuperAgentRequest } from "superagent"
import BaseService from "./BaseService"
import { WorkspacesType } from "./WorkspacesService";
import SetUrl from "../components/helper/SetUrl";

export interface ChannelType {
    id?: number
    workspace_id?: number
    channel_name?: string
    token?: string
    created_at?: string
    expires_at?: string

    // Relation
    workspace?: WorkspacesType
}

export interface ChannelTypeService extends ChannelType {
    page?: number
    take?: number
}

export interface channelAuthType {
    app_id?: string
    app_key?: string
    channel_name?: string
    expires_in_seconds?: number
}

export default {
    async auth(props: channelAuthType, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.post(BaseService.URL["channel.auth"]).send(props);
            if (callback != null) {
                callback(request);
            }
            let resData = await request;
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async gets(props: ChannelTypeService, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.get(BaseService.URL["channel.channels"]).query(props);
            if (callback != null) {
                callback(request);
            }
            let resData = await request;
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async getById(id: number, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.get(SetUrl(BaseService.URL["channel.channel"], [{ ":id": id }]));
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
