import { SuperAgentRequest } from "superagent"
import BaseService from "./BaseService"
import SetUrl from "../components/helper/SetUrl"

export interface WorkspacesType {
    id?: number
    name?: string
    status?: string
    description?: string
    app_id?: string
    app_key?: string
    created_at?: string
    updated_at?: string
}

export default {
    async add(props: WorkspacesType, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.post(BaseService.URL["workspaces.add"]).send(props);
            if (callback != null) {
                callback(request);
            }
            let resData = await request;
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async update(props: WorkspacesType, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.put(SetUrl(BaseService.URL["workspaces.update"], [{ ":id": props.id }])).send(props);
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
            let request = BaseService.superagent.get(SetUrl(BaseService.URL["workspaces.view"], [{ ":id": id }]));
            if (callback != null) {
                callback(request);
            }
            let resData = await request;
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async gets(props: WorkspacesType, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.get(BaseService.URL["workspaces.workspaces"]).query(props);
            if (callback != null) {
                callback(request);
            }
            let resData = await request;
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async deletes(props: WorkspacesType, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.delete(BaseService.URL["workspaces.delete"]).send(props);
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
