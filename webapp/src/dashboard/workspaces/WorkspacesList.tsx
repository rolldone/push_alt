import { useEffect, useMemo, useState } from "react";
import BaseStateClass from "../components/helper/BaseStateClass";
import WorkspacesService, { WorkspacesType } from "../services/WorkspacesService";
import { SuperAgentRequest } from "superagent";
import { Button, Card, Col, Container, Dropdown, Row } from "react-bootstrap";
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
            <Container fluid>
                <Row className="row justify-content-center">
                    <Col md={12}>
                        <h1 className="my-4" style={{fontWeight: 600, opacity: 0.85}}>Workspaces</h1>
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <div className="d-flex justify-content-start justify-content-md-start mb-3">
                            <button onClick={this.handleClick.bind(this, "NEW", {})} className="btn btn-primary" type="button">
                                <i className="ion-plus-round me-1"></i>
                                Create Workspace
                            </button>
                        </div>
                        <Row className="g-4">
                            {workspace_datas?.map((workspace) => (
                                <Col xs={12} sm={6} md={4}  key={workspace.id}>
                                    <Card className="main-menu no-hover">
                                        <div className="w-100 d-flex justify-content-between align-items-center">
                                            <i className="bi bi-person-workspace"></i>
                                            <Dropdown className="ms-auto">
                                                <Dropdown.Toggle  variant="secondary" id={`dropdown-${workspace.id}`} className="me-0">
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={this.handleClick.bind(this, "ITEM_CLICK", {
                                                            id: workspace.id
                                                    })}>
                                                        Update
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <Card.Body className="p-0 w-100">
                                            <h5>
                                                <br/>
                                                <Card.Title>{workspace.name}</Card.Title>
                                                <Card.Text>{workspace.app_id || "-"}</Card.Text>
                                                <Card.Text>{workspace.description || "No description"}</Card.Text>
                                                <Card.Text>
                                                    <small className={workspace.status === "active" ? "text-success" : "text-muted"}>
                                                        {workspace.status}
                                                    </small>
                                                </Card.Text>
                                            </h5>
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
                    </Col>
                </Row>
            </Container>
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