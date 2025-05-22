import { Container, Form } from "react-bootstrap";
import BaseStateClass from "./components/helper/BaseStateClass";
import { useEffect, useMemo, useState } from "react";
import AuthService, { AuthType } from "./services/AuthService";
import { SuperAgentRequest } from "superagent";
import SmartValidation, { SmartValidationInterface } from "./components/helper/SmartValidation";
import ButtonLoading from "../setup/components/Button/ButtonLoading";

export interface LoginState {
    form_data: AuthType
    form_error: any
    http_status: "pending" | "done" | "failed"
}

export interface LoginProps {

}

export class LoginCLass extends BaseStateClass<LoginState, LoginProps> {
    declare smartValidation: SmartValidationInterface

    getFormAttributeNames() {
        return {
            "email": "Email",
            "password": "Password"
        }
    }

    getFormRules() {
        return {
            "email": "required|email",
            "password": "required"
        }
    }

    mounted() {
        this.smartValidation = SmartValidation("form-login")
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
                    return;
                }
                for (var key in props.form_data) {
                    delete form_error[key];
                }
                this.setState({
                    form_error
                })
            },
            form_data: this.state.form_data,
            element_target: "input[type=email],input[type=password]",
            form_attribute_name: this.getFormAttributeNames(),
            form_rules: this.getFormRules()
        })
    }

    handleChange(action: string, props?: any, e?: any) {
        if (action == "FORM_DATA") {
            let form_data = this.state.form_data
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
    }

    handleClick(action: string, props?: any, e?: any) {
        if (action == "SUBMIT") {
            this.submit();
            return
        }
    }

    declare submitRequest: SuperAgentRequest
    async submit() {
        this.setState({
            http_status: "pending"
        })
        try {
            let resData = await AuthService.login(this.state.form_data, (request) => {
                if (this.submitRequest != null) {
                    this.submitRequest.abort()
                }
                this.submitRequest = request
            });
            let data = resData.data;
            window.localStorage.setItem("token", data.access_token);
            window.localStorage.setItem("refresh_token", data.refresh_token);
            window.location.href = "/admin/dashboard"
        } catch (error) {
            console.error("submit - err ", error)
        } finally {
            try {
                if ((await this.submitRequest).status != null) {
                    this.setState({
                        http_status: "done"
                    })
                }
            } catch (error) {
                this.setState({
                    http_status: "failed"
                })
            }
        }
    }

    render() {
        const {
            form_data,
            form_error
        } = this.state
        return (
            <Container className="mt-5">
                <h2>Login</h2>
                <div id="form-login">
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <Form.Control
                            isInvalid={form_error.email != null}
                            name="email"
                            type="email"
                            className="form-control"
                            id="email"
                            value={form_data.email || ""}
                            onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                            placeholder="Enter email" />
                        <Form.Control.Feedback type="invalid">
                            {form_error.email}
                        </Form.Control.Feedback>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <Form.Control
                            isInvalid={form_error.password != null}
                            name="password"
                            type="password"
                            className="form-control"
                            id="password"
                            value={form_data.password || ""}
                            onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                            placeholder="Enter password" />
                        <Form.Control.Feedback type="invalid">
                            {form_error.password}
                        </Form.Control.Feedback>
                    </div>
                    <ButtonLoading
                        text="Login"
                        http_status={this.state.http_status}
                        onClick={this.handleClick.bind(this, "SUBMIT", {})}
                    >
                        ...Loading
                    </ButtonLoading>
                </div>
            </Container>
        );
    }
}

// Login Component
export default function Login(props: LoginProps) {
    let methods = useMemo(() => new LoginCLass(), []);
    methods.defineState(useState<LoginState>({
        form_data: {},
        http_status: "done",
        form_error: {}
    }), props);
    useEffect(() => methods.mounted(), [])
    return methods.render()
};
