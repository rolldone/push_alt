import React, { useEffect, useMemo, useState } from "react"
import { Button, Form, Modal } from "react-bootstrap"
import { toast } from "react-toastify";
import BaseStateClass from "../../components/helper/BaseStateClass"
import AdminService, { AdminType } from "../../services/AdminService";
import SmartValidation, { SmartValidationInterface } from "../../components/helper/SmartValidation";

export type PropType = {
    show: boolean
    onListener: {
        (props: {
            action: string
            return: any
        }): void
    }
    extendAdminNewModalClass?: AdminNewModalClass
}

export type StateType = {
    form_data: AdminType
    form_error: any
    error_mesage: string
    // group_datas: Array<GroupType>
    is_loading: boolean
}

export class AdminNewModalClass extends BaseStateClass<StateType, PropType> {

    declare smartValidation: SmartValidationInterface

    getFormRules() {
        return {
            "name": "required",
            "email": "required|email",
            "status": "required"
        }
    }

    getFormAttributeNames() {
        return {
            "name": "Name",
            "email": "Email",
            "status": "Status"
        }
    }

    getPasswordFormRules() {
        return {
            "password": "required|min:8",
            "password_confirmation": "required|same:password"
        }
    }

    getPasswordFormAttributeNames() {
        return {
            "password": "Password",
            "password_confirmation": "Password Confirmation"
        }
    }

    mounted() {
        this.smartValidation = SmartValidation("form-manage-admin")
        this.smartValidation.inputTextValidation({
            callback: (props, e) => {
                let error = props.error;
                let form_error = this.state.form_error;
                let form_data = props.form_data
                if (props.status == "error") {
                    form_error = {
                        ...form_error,
                        ...error,
                    }
                    return this.setState({
                        form_error
                    })
                }
                for (let key in form_data) {
                    delete form_error[key]
                }
                return this.setState({
                    form_error
                })
            },
            form_data: this.state.form_data,
            element_target: "input[type=text],input[type=email]",
            form_attribute_name: this.getFormAttributeNames(),
            form_rules: this.getFormRules()
        })
    }

    handleChange(action: string, props?: any, e?: any) {
        let form_data = this.state.form_data
        switch (action) {
            case 'FORM_DATA':
                switch (e.target.name) {
                    case 'is_change_password':
                        form_data = {
                            ...form_data,
                            [e.target.name]: e.target.checked
                        }
                        break;
                    default:
                        form_data = {
                            ...form_data,
                            [e.target.name]: e.target.value
                        }
                        break;
                }
                this.setState({
                    error_mesage: "",
                    form_data
                })
                break;
        }
    }

    handleClick(action: string, props?: any, e?: any) {
        switch (action) {
            case 'CLOSE':
                this.props.onListener({
                    action: "CLOSE",
                    return: null
                })
                break;
            case 'SUBMIT':
                this.setState({
                    is_loading: true
                })
                this.submitData()
                break;
        }
    }

    async submitData() {
        try {
            let form_data = this.state.form_data
            let resData = await AdminService.add(form_data)
            this.props.onListener({
                action: "SUBMIT",
                return: resData.return,
            })
            this.setState({
                error_mesage: "",
                is_loading: false
            })

            toast.success('User created!');
        } catch (error: any) {
            this.setState({
                error_mesage: error.response.body.message
            })
        }
    }

    // async getGroups() {
    //     try {
    //         let resData = await GroupService.gets({});
    //         let _return = resData.return;
    //         this.setState({
    //             group_datas: _return
    //         })
    //     } catch (error) {
    //         console.error(error)
    //     }
    // }

    render() {
        let {
            show,
            extendAdminNewModalClass
        } = this.props

        let {
            form_data,
            error_mesage,
            form_error,
            // group_datas
        } = this.state

        console.log("extendAdminNewModalClass :: ", extendAdminNewModalClass)

        return <>
            <Modal
                show={show}
                onHide={this.handleClick.bind(this, 'CLOSE', {})}
                backdrop="static"
                size="lg"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Form Admin</Modal.Title>
                </Modal.Header>
                <Modal.Body id="form-manage-admin">
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            isInvalid={form_error.name != null}
                            name="name"
                            value={form_data.name || ''}
                            onChange={this.handleChange.bind(this, 'FORM_DATA', {})}
                            type="text"
                            placeholder="Enter full name"
                        />
                        <Form.Control.Feedback type="invalid">
                            {form_error.name}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* <div className="mb-3">
                        <label className="form-label">Last Name</label>
                        <input
                            type="text"
                            onChange={this.handleChange.bind(this, 'FORM_DATA', {})}
                            value={form_data.last_name || ""}
                            className="form-control"
                            name="last_name"
                            placeholder=""
                        />
                    </div> */}
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            isInvalid={form_error.email != null}
                            name="email"
                            value={form_data.email || ''}
                            onChange={this.handleChange.bind(this, 'FORM_DATA', {})}
                            type="text"
                            placeholder="Enter email"
                        />
                        <Form.Control.Feedback type="invalid">
                            {form_error.email}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="status" className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                            name="status"
                            value={form_data.status}
                            onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                            isInvalid={form_error.status != null}>
                            <option value="">--</option>
                            <option value={"active"}>Active</option>
                            <option value={"inactive"}>Inactive</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {form_error.status}
                        </Form.Control.Feedback>
                    </Form.Group>
                    {/* <div className="mb-3">
                        <div className="form-label">Select Group</div>
                        <select className="form-select" name="at_group_id" onChange={this.handleChange.bind(this, 'FORM_DATA', {})} value={form_data?.at_group_id || ''}>
                            <option value="">--</option>
                            {group_datas.map((val, i) => {
                                return <option value={val.id} key={val.created_at}>{val.name} {val.is_active_at != null ? "" : "- (Deactivated)"}</option>
                            })}
                        </select>
                    </div> */}
                    {extendAdminNewModalClass == null ? <SetPassword methods={this}></SetPassword> : <>
                        <Form.Group className="mb-3" controlId="updatePassword">
                            <Form.Check
                                type="checkbox"
                                label="Update Password"
                                name="is_change_password"
                                checked={form_data.is_change_password == true}
                                onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                            />
                        </Form.Group>
                        {form_data.is_change_password == true ? <SetPassword methods={this}></SetPassword> : null}
                    </>}

                    {error_mesage != "" ? <>
                        <div className="card">
                            <div className="card-status-top bg-danger" />
                            <div className="card-body">
                                <h3 className="card-title">Server Response</h3>
                                <p className="text-secondary">{error_mesage}
                                </p>
                            </div>
                        </div>
                    </> : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleClick.bind(this, 'CLOSE', {})} disabled={this.state.is_loading}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={this.handleClick.bind(this, 'SUBMIT', {})} disabled={this.state.is_loading}>
                        {this.state.is_loading ? <span className="spinner-border spinner-border-sm me-2" role="status"></span> : null}
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    }
}

export const SetPassword = (props: {
    methods: AdminNewModalClass
}) => {
    let methods = props.methods;
    let { form_data, form_error } = methods.state
    useEffect(() => {
        methods.smartValidation.inputTextValidation({
            callback: (props, e) => {
                let error = props.error;
                let form_error = methods.state.form_error;
                let form_data = props.form_data
                if (props.status == "error") {
                    form_error = {
                        ...form_error,
                        ...error,
                    }
                    return methods.setState({
                        form_error
                    })
                }
                for (let key in form_data) {
                    delete form_error[key]
                }
                return methods.setState({
                    form_error
                })
            },
            form_data: methods.state.form_data,
            element_target: "input[type=password]",
            form_attribute_name: methods.getPasswordFormAttributeNames(),
            form_rules: methods.getPasswordFormRules()
        })
    }, [])
    return <>
        <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
                isInvalid={form_error.password != null}
                name="password"
                value={form_data.password || ''}
                onChange={methods.handleChange.bind(methods, 'FORM_DATA', {})}
                type="password"
                placeholder="Enter password"
            />
            <Form.Control.Feedback type="invalid">
                {form_error.password}
            </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password Confirmation</Form.Label>
            <Form.Control
                isInvalid={form_error.password_confirmation != null}
                name="password_confirmation"
                value={form_data.password_confirmation || ''}
                onChange={methods.handleChange.bind(methods, 'FORM_DATA', {})}
                type="password"
                placeholder="Enter password confirmation"
            />
            <Form.Control.Feedback type="invalid">
                {form_error.password_confirmation}
            </Form.Control.Feedback>
        </Form.Group>
    </>
}

export default function AdminNewNewModal(props: PropType) {

    let methods = props.extendAdminNewModalClass || useMemo(() => new AdminNewModalClass(), [])

    if (props.extendAdminNewModalClass == null) {
        if (methods == null) return
        methods.defineState(useState<StateType>({
            form_data: {},
            form_error: {},
            error_mesage: "",
            // group_datas: [],
            is_loading: false,
        }), props)
        useEffect(() => {
            if (props.show == false) return
            // this.getGroups();
            methods.setState({
                form_data: {}
            })
        }, [props.show])
    }

    useEffect(() => {
        methods.mounted()
    }, [])

    return methods.render()
}