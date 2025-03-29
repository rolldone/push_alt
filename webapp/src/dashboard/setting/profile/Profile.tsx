import { useEffect, useMemo, useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import BaseStateClass from '../../components/helper/BaseStateClass';
import UserService, { UserType } from '../../services/UserService';
import SmartValidation, { SmartValidationInterface } from '../../components/helper/SmartValidation';

interface PropType { }

interface StateType {
    form_data: UserType
    loading: boolean;
    error?: string;
    form_error: any
    success?: string;
}

export class ProfileClass extends BaseStateClass<StateType, PropType> {

    getFormAttributeName() {
        return {
            name: "Name",
            email: "Email"
        }
    }

    getFormRules() {
        return {
            name: "required",
            email: "required|email"
        }
    }

    getFormPasswordAttributeName() {
        return {
            password: "Password",
            password_confirmation: "Password Confirmation"
        }
    }

    getFormPasswordRules() {
        return {
            password: "required|min:8",
            password_confirmation: "required|same:password"
        }
    }

    declare smartValidation: SmartValidationInterface
    mounted() {
        this.fetchUser();
        this.smartValidation = SmartValidation("form-profile")
        this.smartValidation.inputTextValidation({
            callback: (props, e) => {
                let error = props.error
                let form_data = props.form_data
                let form_error = this.state.form_error
                if (props.status == "error") {
                    form_error = {
                        ...form_error,
                        ...error
                    }
                    this.setState({
                        form_error
                    })
                    return;
                }
                for (let key in form_data) {
                    delete form_error[key]
                }
                this.setState({
                    form_error
                })
            },
            form_data: this.state.form_data,
            element_target: "input[type=text],input[type=email]",
            form_attribute_name: this.getFormAttributeName(),
            form_rules: this.getFormRules()
        })

    }

    async fetchUser() {
        this.setState({ loading: true, error: undefined, success: undefined });
        try {
            const resData = await UserService.profile();
            const { success, data, message } = resData;
            if (!success) throw new Error(message || 'Failed to fetch user');
            this.setState({
                form_data: data,
                loading: false,
            });
        } catch (err: any) {
            this.setState({ error: err.message || 'Error fetching user', loading: false });
        }
    }

    handleChange(action: string, props?: any, e?: any) {
        if (action == "FORM_DATA") {
            let form_data = this.state.form_data;
            switch (e.target.name) {
                case "is_password_change":
                    form_data = {
                        ...form_data,
                        [e.target.name]: e.target.checked
                    }
                    if (e.target.checked == true) {
                        setTimeout(() => {
                            this.validateFormPassword()
                        }, 1000);
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
                form_data
            })
        }
    }

    submitValidation() {
        return new Promise((resolve: Function) => {
            let form_data = this.state.form_data
            let form_rules = this.getFormRules();
            let form_attribute = this.getFormAttributeName();
            if (form_data.is_password_change == true) {
                form_rules = {
                    ...form_rules,
                    ...this.getFormPasswordRules()
                }
                form_attribute = {
                    ...form_attribute,
                    ...this.getFormPasswordAttributeName()
                }
            }
            this.smartValidation.submitValidation({
                callback: (props) => {
                    let error = props.error
                    let form_data = props.form_data
                    let form_error = this.state.form_error
                    if (props.status == "error") {
                        form_error = {
                            ...form_error,
                            ...error
                        }
                        this.setState({
                            form_error
                        })
                        return resolve(false)
                    }
                    for (let key in form_data) {
                        delete form_error[key]
                    }
                    this.setState({
                        form_error
                    })
                    resolve(true);
                },
                form_data: this.state.form_data,
                form_attribute_name: form_attribute,
                form_rules: form_rules
            })
        })
    }

    validateFormPassword() {
        this.smartValidation.inputTextValidation({
            callback: (props, e) => {
                let error = props.error
                let form_data = props.form_data
                let form_error = this.state.form_error
                if (props.status == "error") {
                    form_error = {
                        ...form_error,
                        ...error
                    }
                    this.setState({
                        form_error
                    })
                    return;
                }
                for (let key in form_data) {
                    delete form_error[key]
                }
                this.setState({
                    form_error
                })
            },
            form_data: this.state.form_data,
            element_target: "input[type=password]",
            form_attribute_name: this.getFormPasswordAttributeName(),
            form_rules: this.getFormPasswordRules()
        })
    }

    handleClick(action: string, props?: any, e?: any) {
        if (action == "SUBMIT") {
            this.submit()
        }
    }

    async submit() {
        let pass = await this.submitValidation();
        if (pass == false) {
            return;
        }
        this.setState({ loading: true, error: undefined, success: undefined });
        try {
            const resData = await UserService.updateProfile(this.state.form_data);
            const { success, message } = resData;
            if (!success) throw new Error(message || 'Failed to update profile');
            this.setState({ success: 'Profile updated successfully', loading: false });
        } catch (err: any) {
            this.setState({ error: err.message || 'Error updating profile', loading: false });
        }
    };

    render() {
        const { form_data, loading, error, success, form_error } = this.state;

        return (
            <Container className="mt-4">
                <h2>Profile</h2>
                {loading && <p>Loading...</p>}
                {error && <p className="text-danger">{error}</p>}
                {success && <p className="text-success">{success}</p>}
                <Form id="form-profile" className="settings-form">
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label className="required">Name</Form.Label>
                        <Form.Control
                            isInvalid={form_error.name != null}
                            type="text"
                            name="name"
                            value={form_data.name || ""}
                            onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {form_error.name}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label className="required">Email</Form.Label>
                        <Form.Control
                            isInvalid={form_error.email != null}
                            type="email"
                            name="email"
                            value={form_data.email || ""}
                            onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {form_error.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="updatePassword">
                        <Form.Check
                            type="checkbox"
                            label="Update Password"
                            name="is_password_change"
                            checked={form_data.is_password_change == true}
                            onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                        />
                    </Form.Group>

                    {form_data.is_password_change == true && (
                        <>
                            <Form.Group className="mb-3" controlId="password">
                                <Form.Label className="required">New Password</Form.Label>
                                <Form.Control
                                    isInvalid={form_error.password != null}
                                    type="password"
                                    name="password"
                                    value={form_data.password || ""}
                                    onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {form_error.password}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="passwordConfirmation">
                                <Form.Label className="required">New Password Confirmation</Form.Label>
                                <Form.Control
                                    isInvalid={form_error.password_confirmation != null}
                                    type="password"
                                    name="password_confirmation"
                                    value={form_data.password_confirmation || ""}
                                    onChange={this.handleChange.bind(this, "FORM_DATA", {})}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {form_error.password_confirmation}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </>
                    )}
                    <Button variant="primary" type="button" onClick={this.handleClick.bind(this, "SUBMIT", {})} disabled={loading}>
                        Save
                    </Button>
                </Form>
            </Container>
        );
    }
}

export default function Profile(props: PropType) {
    const methods = useMemo(() => new ProfileClass(), []);
    methods.defineState(useState<StateType>({
        form_data: {},
        loading: false,
        error: "",
        form_error: {},
        success: ""
    }), props);
    useEffect(() => {
        methods.mounted()
    }, [])
    return methods.render();
}