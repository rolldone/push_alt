import { useEffect, useMemo, useState } from "react";
import BaseStateClass from "../components/helper/BaseStateClass";
import WorkspacesService, { WorkspacesType } from "../services/WorkspacesService";
import { SuperAgentRequest } from "superagent";
import { Button, Card, Col, Row } from "react-bootstrap";
import WorkspacesNew, { WorkspacesNewClass } from "./WorkspacesNew";
import WorkspacesUpdate, { WorkspacesUpdateClass } from "./WorkspacesUpdate";

interface PropType {

}

interface StateType {
    workspace_datas: WorkspacesType[]
    select_workspace: WorkspacesType | null
    http_request: "pending" | "done"
    section: "new" | "update" | "close"
}

export class WorkspacesListClass extends BaseStateClass<StateType, PropType> {
    async mounted() {
        this.setWorkspaces(await this.getWorkspaces())
    }
    declare workspacesNew: WorkspacesNewClass
    declare workspacesUpdate: WorkspacesUpdateClass
    declare workspacesRequest: SuperAgentRequest
    async getWorkspaces() {
        try {
            let resData = await WorkspacesService.gets({}, (request) => {
                if (this.workspacesRequest != null) {
                    this.workspacesRequest.abort()
                }
                this.workspacesRequest = request
                this.setState({
                    http_request: "pending"
                })
            })
            return resData
        } catch (error) {
            console.error("getWorkspaces - err ", error);
        } finally {
            this.setState({
                http_request: "done"
            })
        }
    }
    setWorkspaces(props: any) {
        if (props == null) return;
        let data = props.data;
        this.setState({
            workspace_datas: data
        })
    }
    handleClick(action: string, props?: any, e?: any) {
        if (action == "ITEM_CLICK") {
            this.workspacesUpdate.setState({
                form_data: {
                    id: props.id
                }
            })
            this.workspacesUpdate.show()
        }
        if (action == "NEW") {
            this.workspacesNew.show()
            return
        }
    }
    handleListener(action: string, props?: any) {
        if (action == "WORKSPACES_NEW_LISTENER" || action == "WORKSPACES_UPDATE_LISTENER") {
            this.mounted()
        }
    }
    render() {
        const { workspace_datas, select_workspace, section } = this.state;

        return (
            <div>
                <Row className="mb-4 align-items-center">
                    <Col>
                        <h2>Workspaces</h2> {/* Page Title */}
                    </Col>
                    <Col className="text-end">
                        <Button variant="primary" onClick={this.handleClick.bind(this, "NEW", {})}>
                            Create Workspace
                        </Button> {/* Top-right button */}
                    </Col>
                </Row>
                <Row xs={1} md={2} lg={3} className="g-4">
                    {workspace_datas?.map((workspace) => (
                        <Col key={workspace.id} onClick={this.handleClick.bind(this, "ITEM_CLICK", {
                            id: workspace.id
                        })}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{workspace.name}</Card.Title>
                                    <Card.Text>{workspace.app_id || "-"}</Card.Text>
                                    <Card.Text>{workspace.description || "No description"}</Card.Text>
                                    <Card.Text>
                                        <small className={workspace.status === "active" ? "text-success" : "text-muted"}>
                                            {workspace.status}
                                        </small>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <WorkspacesNew onCloseListener={this.handleListener.bind(this, "WORKSPACES_NEW_LISTENER")} onInit={(props) => this.workspacesNew = props}></WorkspacesNew>
                <WorkspacesUpdate onCloseListener={this.handleListener.bind(this, "WORKSPACES_UPDATE_LISTENER")} onInit={(props) => {
                    // @ts-ignore
                    this.workspacesUpdate = props
                }}></WorkspacesUpdate>
            </div>
        );
    }
}

export default function WorkspacesList(props: PropType) {
    let methods = useMemo(() => new WorkspacesListClass(), []);
    methods.defineState(useState<StateType>({
        workspace_datas: [],
        http_request: "done",
        select_workspace: null,
        section: "close"
    }), props)
    useEffect(() => {
        methods.mounted()
    }, [])
    return methods.render()
}