import { SuperAgentRequest } from "superagent"
import BaseService from "./BaseService"
import SetUrl from "../components/helper/SetUrl";

export interface CorsType {
    url?: string;
    id?: string;
}


export default {
    async Add(props: CorsType, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.post(BaseService.URL['cors.add']).send(props);
            if (callback != null) {
                callback(request);
            }
            let resData = await request;
            if (resData.body.success) {
                return resData.body.data;
            } else {
                throw new Error(resData.body.message || "Failed to add CORS entry");
            }
        } catch (ex) {
            throw ex;
        }
    },
    async Remove(id: string | number, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.delete(SetUrl(BaseService.URL['cors.remove'], [{ ":id": id }]));
            if (callback != null) {
                callback(request);
            }
            let resData = await request;
            if (resData.body.success) {
                return resData.body.message;
            } else {
                throw new Error(resData.body.message || "Failed to remove CORS entry");
            }
        } catch (ex) {
            throw ex;
        }
    },
    async List(callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.get(BaseService.URL['cors.list']);
            if (callback != null) {
                callback(request);
            }
            let resData = await request;
            if (resData.body.success) {
                return resData.body.data;
            } else {
                throw new Error(resData.body.message || "Failed to fetch CORS list");
            }
        } catch (ex) {
            throw ex;
        }
    },
    async Edit(id: string | number, props: CorsType, callback?: { (request: SuperAgentRequest): void }) {
        try {
            let request = BaseService.superagent.put(SetUrl(BaseService.URL['cors.edit'], [{ ":id": id }])).send(props);
            if (callback != null) {
                callback(request);
            }
            let resData = await request;
            if (resData.body.success) {
                return resData.body.message;
            } else {
                throw new Error(resData.body.message || "Failed to edit CORS entry");
            }
        } catch (ex) {
            throw ex;
        }
    },
};
