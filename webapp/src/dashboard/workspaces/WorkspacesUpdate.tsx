import { useMemo } from "react";
import WorkspacesService from "../services/WorkspacesService";
import WorkspacesNew, { PropType, WorkspacesNewClass } from "./WorkspacesNew";

export class WorkspacesUpdateClass extends WorkspacesNewClass {

    // @ts-ignore
    getFormRules() {
        return {
            name: "required",
            status: "required",
        };
    }

    // @ts-ignore
    getFormAttributeNames() {
        return {
            name: "Name",
            status: "Status",
        };
    }

    async submit(): Promise<void> {
        this.setState({
            http_request: "pending"
        })
        let pass = await this.submitValidation();
        if (pass == false) {
            this.setState({
                http_request: "done"
            })
            return
        }
        try {
            let resData = await WorkspacesService.update(this.state.form_data);
            this.props.onCloseListener();
        } catch (error) {
            console.error("submit - err ", error);
        } finally {
            this.setState({
                show: false,
                http_request: "done"
            })
        }

    }
    async getWorkspace() {
        try {
            let resData = await WorkspacesService.getById(this.state.form_data.id || 0)
            return resData
        } catch (error) {
            console.error("getWorkspace - err ", error)
        }
    }
    setWorkspace(props: any) {
        if (props == null) return
        let data = props.data
        this.setState({
            form_data: data
        })
    }
    async show() {
        try {
            this.setState({
                show: true
            })
            this.setWorkspace(await this.getWorkspace())
            this.mounted()
        } catch (error) {
            console.error("show - err ", error)
        }
    }
}

export default function WorkspacesUpdate(props: PropType) {
    let methods = useMemo(() => new WorkspacesUpdateClass(), []);
    // @ts-ignore
    return <WorkspacesNew {...props} extend={methods}></WorkspacesNew>
}