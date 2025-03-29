import { useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Offcanvas, Row } from 'react-bootstrap';
import BaseStateClass from '../components/helper/BaseStateClass';
import SmartValidation, { SmartValidationInterface } from '../components/helper/SmartValidation';
import ButtonLoading from '../components/Button/ButtonLoading';
import WorkspacesService, { WorkspacesType } from '../services/WorkspacesService'; // For fetching workspaces
import TestConnectionService from '../services/TestConnectionService';

export interface StateType {
    show: boolean;
    form_data: {
        id?: number
        workspace_id?: number;
        app_key?: string
        channel_name?: string;
        expires_in_seconds?: number;
    };
    form_error: any;
    http_request: 'pending' | 'done' | 'failed';
    workspaces: WorkspacesType[];
}

export interface PropType {
    onInit?: (props: TestConnectionNewClass) => void;
    onCloseListener: () => void;
    extend?: TestConnectionNewClass;
}

export class TestConnectionNewClass extends BaseStateClass<StateType, PropType> {
    getFormRules() {
        return {
            workspace_id: 'required',
            channel_name: 'required',
            expires_in_seconds: 'required|numeric',
            app_key: "required"
        };
    }

    getFormAttributeNames() {
        return {
            workspace_id: 'Workspace',
            channel_name: 'Event Name',
            expires_in_seconds: 'Expiration (Seconds)',
            app_key: "App Key"
        };
    }

    declare smartValidation: SmartValidationInterface;

    async fetchWorkspaces() {
        try {
            const workspaces = await WorkspacesService.gets({}); // Fetch workspaces
            let data = workspaces.data;
            this.setState({
                workspaces: data
            })
        } catch (error) {
            console.error('Failed to fetch workspaces:', error);
        }
    }

    mounted() {
        this.smartValidation = SmartValidation('form-test-connection-new');
        this.smartValidation.inputTextValidation({
            callback: (props, e) => {
                let form_error = this.state.form_error;
                if (props.status === 'error') {
                    form_error = { ...form_error, ...props.error };
                    this.setState({ form_error });
                    return;
                }
                for (const key in props.form_data) {
                    delete form_error[key];
                }
                this.setState({ form_error });
            },
            form_data: this.state.form_data,
            form_rules: this.getFormRules(),
            form_attribute_name: this.getFormAttributeNames(),
            element_target: 'input[type=text],input[type=number],select',
        });
    }

    submitValidation() {
        return new Promise((resolve) => {
            this.smartValidation.submitValidation({
                callback: (props) => {
                    let form_error = this.state.form_error;
                    if (props.status === 'error') {
                        form_error = { ...form_error, ...props.error };
                        this.setState({ form_error });
                        return resolve(false);
                    }
                    for (const key in props.form_data) {
                        delete form_error[key];
                    }
                    this.setState({ form_error });
                    resolve(true);
                },
                form_data: this.state.form_data,
                form_rules: this.getFormRules(),
                form_attribute_name: this.getFormAttributeNames(),
            });
        });
    }

    handleChange(action: string, props?: any, e?: any) {
        if (action === 'FORM_DATA') {
            let form_data = this.state.form_data;
            form_data = { ...form_data, [e.target.name]: e.target.value };
            this.setState({ form_data });
        }
        if (action === 'CLOSE') {
            this.close();
        }
    }

    handleClick(action: string, props?: any, e?: any) {
        if (action === 'CLOSE') {
            this.close();
        }
        if (action === 'SUBMIT') {
            this.submit();
        }
    }

    async submit() {
        this.setState({ http_request: 'pending' });
        const pass = await this.submitValidation();
        if (!pass) {
            return this.setState({ http_request: 'done' });
        }
        try {
            // Replace with your API call to /api/workspace/:workspaceId/channel
            let resData = await TestConnectionService.add(this.state.form_data)
            console.log('Submitting:', this.state.form_data);
            this.props.onCloseListener();
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            this.setState({ http_request: 'done', show: false });
        }
    }

    close() {
        this.setState({ show: false });
    }

    show() {
        this.setState({
            show: true,
            form_data: {},
            workspaces: [],
        });
        setTimeout(() => {
            this.mounted();
            this.fetchWorkspaces();
        }, 1000);
    }

    render() {
        const { show, form_data, form_error, http_request, workspaces } = this.state;
        return (
            <Offcanvas show={show} onHide={this.handleChange.bind(this, 'CLOSE', {})} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Create New Test Connection</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div id="form-test-connection-new">
                        <Form.Group className="mb-3" controlId="workspace_id">
                            <Form.Label>Workspace</Form.Label>
                            <Form.Select
                                isInvalid={form_error.workspace_id != null}
                                name="workspace_id"
                                value={form_data.workspace_id || ''}
                                onChange={this.handleChange.bind(this, 'FORM_DATA', {})}
                            >
                                <option value="">Select Workspace</option>
                                {workspaces.map((ws) => (
                                    <option key={ws.id} value={ws.id}>
                                        {ws.name}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {form_error.workspace_id}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="channel_name">
                            <Form.Label>App Key</Form.Label>
                            <Form.Control
                                isInvalid={form_error.app_key != null}
                                name="app_key"
                                value={form_data.app_key || ''}
                                onChange={this.handleChange.bind(this, 'FORM_DATA', {})}
                                type="text"
                                placeholder="Enter app key"
                            />
                            <Form.Control.Feedback type="invalid">
                                {form_error.app_key}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="channel_name">
                            <Form.Label>Event Name</Form.Label>
                            <Form.Control
                                isInvalid={form_error.channel_name != null}
                                name="channel_name"
                                value={form_data.channel_name || ''}
                                onChange={this.handleChange.bind(this, 'FORM_DATA', {})}
                                type="text"
                                placeholder="Enter event name"
                            />
                            <Form.Control.Feedback type="invalid">
                                {form_error.channel_name}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="expires_in_seconds">
                            <Form.Label>Expiration (Seconds)</Form.Label>
                            <Form.Control
                                isInvalid={form_error.expires_in_seconds != null}
                                name="expires_in_seconds"
                                value={form_data.expires_in_seconds || ''}
                                onChange={this.handleChange.bind(this, 'FORM_DATA', {})}
                                type="number"
                                placeholder="Enter expiration in seconds"
                            />
                            <Form.Control.Feedback type="invalid">
                                {form_error.expires_in_seconds}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <ButtonLoading
                            http_status={http_request}
                            onClick={this.handleClick.bind(this, 'SUBMIT', {})}
                            text="Create"
                        >
                            Loading...
                        </ButtonLoading>
                        <Button
                            variant="secondary"
                            className="ms-2"
                            onClick={this.handleClick.bind(this, 'CLOSE', {})}
                        >
                            Cancel
                        </Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        );
    }
}

export default function TestConnectionNew(props: PropType) {
    let methods = props.extend || useMemo(() => new TestConnectionNewClass(), []);
    methods.defineState(
        useState<StateType>({
            show: false,
            form_data: {},
            form_error: {},
            http_request: 'done',
            workspaces: [],
        }),
        props
    );
    useEffect(() => {
        if (props.onInit != null) {
            props.onInit(methods);
        }
    }, []);
    return methods.render();
}