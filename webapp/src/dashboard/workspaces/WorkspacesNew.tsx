import { Button, Col, Form, Offcanvas, Row } from "react-bootstrap";
import BaseStateClass from "../components/helper/BaseStateClass";
import { useEffect, useMemo, useState } from "react";
import WorkspacesService, { WorkspacesType } from "../services/WorkspacesService";
import SmartValidation, { SmartValidationInterface } from "../components/helper/SmartValidation";
import ButtonLoading from "../components/Button/ButtonLoading";

export interface StateType {
    show: boolean
    form_data: WorkspacesType
    form_error: any
    http_request: "pending" | "done" | "failed"
}

export interface PropType {
    onInit?: { (props: WorkspacesNewClass): void }
    onCloseListener: { (): void }
    extend?: WorkspacesNewClass
}

export class WorkspacesNewClass extends BaseStateClass<StateType, PropType> {
    getFormRules() {
        return {
            name: "required",
            status: "required",
            app_key: "required", // Make it required
            app_id: "required", // Make it required
        };
    }

    getFormAttributeNames() {
        return {
            name: "Name",
            status: "Status",
            app_key: "App Key",
            app_id: "App Id"
        };
    }

    generateAppKey() {
        const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); // Simple random string
        let appKey = document.getElementById("app_key");
        this.setState({
            form_data: {
                ...this.state.form_data,
                app_key: key
            }
        })
        setTimeout(() => {
            appKey?.focus();
        }, 100);
    }

    generateAppID() {
        const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); // Simple random string
        let app_D = document.getElementById("app_id");
        this.setState({
            form_data: {
                ...this.state.form_data,
                app_id: id
            }
        })
        setTimeout(() => {
            app_D?.focus();
        }, 100);
    }

    declare smartValidation: SmartValidationInterface
    mounted() {
        this.smartValidation = SmartValidation("form-workspaces-new")
        this.smartValidation.inputTextValidation({
            callback: (props, e) => {
                console.log(props, e);
                let form_error = this.state.form_error
                if (props.status == "error") {
                    form_error = {
                        ...form_error,
                        ...props.error
                    }
                    this.setState({
                        form_error
                    })
                    return
                }
                for (var key in props.form_data) {
                    delete form_error[key]
                }
                this.setState({
                    form_error
                })
            },
            form_data: this.state.form_data,
            form_rules: this.getFormRules(),
            form_attribute_name: this.getFormAttributeNames(),
            element_target: "input[type=text],select"
        })
    }

    submitValidation() {
        return new Promise((resolve) => {

            this.smartValidation.submitValidation({
                callback: (props) => {
                    console.log(props);
                    let form_error = this.state.form_error
                    if (props.status == "error") {
                        form_error = {
                            ...form_error,
                            ...props.error
                        }
                        this.setState({
                            form_error
                        })
                        return resolve(false)
                    }
                    for (var key in props.form_data) {
                        delete form_error[key]
                    }
                    this.setState({
                        form_error
                    })
                    resolve(true)
                },
                form_data: this.state.form_data,
                form_rules: this.getFormRules(),
                form_attribute_name: this.getFormAttributeNames(),
            })
        })
    }

    handleChange(action: string, props?: any, e?: any) {
        if (action == "FORM_DATA") {
            let form_data = this.state.form_data;
            switch (e.target.name) {
                default:
                    form_data = {
                        ...form_data,
                        [e.target.name]: e.target.value
                    }
                    break;
            }
            this.setState({
                form_data
            })
        }
        if (action == "CLOSE") {
            this.close()
        }
    }

    handleClick(action: string, props?: any, e?: any) {
        if (action == "CLOSE") {
            this.close()
        }
        if (action == "SUBMIT") {
            this.submit()
        }
    }
    async submit() {
        this.setState({
            http_request: "pending"
        })
        let pass = await this.submitValidation();
        if (pass == false) {
            return this.setState({
                http_request: "done"
            })
        }
        try {
            let resData = await WorkspacesService.add(this.state.form_data)
            this.props.onCloseListener();
        } catch (error) {
            console.error("submit - err ", error)
        } finally {
            this.setState({
                http_request: "done",
                show: false
            })
        }
    }

    close() {
        this.setState({
            show: false
        })
    }

    show() {
        this.setState({
            show: true,
            form_data: {}
        })
        setTimeout(() => {
            this.mounted()
        }, 1000);
    }

    render() {
        let {
            show,
            form_data,
            form_error,
            http_request
        } = this.state
        return <Offcanvas show={show} onHide={this.handleChange.bind(this, "CLOSE", {})} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Create New Workspace</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div id="form-workspaces-new">
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            isInvalid={form_error.name != null}
                            name="name"
                            onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                            value={form_data.name || ""}
                            type="text"
                            placeholder="Enter workspace name" required />
                        <Form.Control.Feedback type="invalid">
                            {form_error.name}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            name="description"
                            value={form_data.description || ""}
                            onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                            as="textarea" rows={3} placeholder="Enter description" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="status">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                            isInvalid={form_error.status != null}
                            value={form_data.status}
                            onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                            name="status"
                            defaultValue="active">
                            <option value="active">Active</option>
                            <option value="deactivated">Deactivated</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {form_error.status}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="app_id">
                        <Form.Label>App Key</Form.Label>
                        <Row>
                            <Col>
                                <Form.Control
                                    isInvalid={form_error.app_id != null}
                                    name="app_id"
                                    value={form_data.app_id || ""}
                                    type="text"
                                    onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                                    placeholder="Enter or generate app id"
                                    required
                                    readOnly
                                />
                                <Form.Control.Feedback type="invalid">{form_error.app_key}</Form.Control.Feedback>
                            </Col>
                            <Col xs="auto">
                                <Button variant="outline-secondary" onClick={this.generateAppID.bind(this)}>
                                    Generate
                                </Button>
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="app_key">
                        <Form.Label>App Key</Form.Label>
                        <Row>
                            <Col>
                                <Form.Control
                                    isInvalid={form_error.app_key != null}
                                    name="app_key"
                                    value={form_data.app_key || ""}
                                    type="text"
                                    onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                                    placeholder="Enter or generate app key"
                                    required
                                    readOnly
                                />
                                <Form.Control.Feedback type="invalid">{form_error.app_key}</Form.Control.Feedback>
                            </Col>
                            <Col xs="auto">
                                <Button variant="outline-secondary" onClick={this.generateAppKey.bind(this)}>
                                    Generate
                                </Button>
                            </Col>
                        </Row>
                    </Form.Group>
                    <ButtonLoading http_status={http_request} onClick={this.handleClick.bind(this, "SUBMIT", {})} text="Create">
                        Loading...
                    </ButtonLoading>
                    <Button variant="secondary" className="ms-2" onClick={this.handleClick.bind(this, "CLOSE", {})}>
                        Cancel
                    </Button>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    }
}

export default function WorkspacesNew(props: PropType) {
    let methods = props.extend || useMemo(() => new WorkspacesNewClass(), []);
    methods.defineState(useState<StateType>({
        show: false,
        form_data: {},
        form_error: {},
        http_request: "done"
    }), props);
    useEffect(() => {
        if (props.onInit != null) {
            props.onInit(methods);
        }
    }, [])
    return methods.render();
}