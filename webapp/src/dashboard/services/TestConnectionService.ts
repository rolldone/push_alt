import { SuperAgentRequest } from "superagent"
import BaseService from "./BaseService"
import SetUrl from "../components/helper/SetUrl"
import { WorkspacesType } from "./WorkspacesService";

export interface TestConnectionType {
    id?: number
    workspace_id?: number;
    app_key?: string
    channel_name?: string;
    expires_in_seconds?: number;
    created_at?: string
    updated_at?: string

    // Relation
    workspace?: WorkspacesType
}

export default {
    async add(props: TestConnectionType, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.post(BaseService.URL["test_connection.add"]).send(props);
            if (callback != null) {
                callback(request);
            }
            let resData = await request;
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async update(props: TestConnectionType, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.put(SetUrl(BaseService.URL["test_connection.update"], [{ ":id": props.id }])).send(props);
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
            let request = BaseService.superagent.get(SetUrl(BaseService.URL["test_connection.view"], [{ ":id": id }]));
            if (callback != null) {
                callback(request);
            }
            let resData = await request;
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async gets(props: TestConnectionType, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.get(BaseService.URL["test_connection.test_connections"]).query(props);
            if (callback != null) {
                callback(request);
            }
            let resData = await request;
            return resData.body;
        } catch (ex) {
            throw ex;
        }
    },
    async deletes(ids: number[], callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.post(BaseService.URL["test_connection.delete"]).send({
                ids: ids
            });
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
