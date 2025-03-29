import { useEffect, useMemo, useState } from "react";
import BaseStateClass from "../components/helper/BaseStateClass";
import { Button, Form } from "react-bootstrap";
import { SetupInterface } from "../services/SetupService";
import SmartValidation, { SmartValidationInterface } from "../components/helper/SmartValidation";

export type OnListenerType = {
    step: number
    return: SetupInterface
    percent: number
}

export interface StepProps {
    data: SetupInterface
    onListener: { (props: OnListenerType): void }
}

export interface StepState {
    form_data: SetupInterface
    form_error: any
}

export class Step1Class extends BaseStateClass<StepState, StepProps> {
    FORM_NAME = "form-setup"
    declare smartValidation: SmartValidationInterface
    getFormRule(): any {
        return {
            app_name: "required",
            timezone: "required",
        }
    }
    getFormAttributeName(): any {
        return {
            app_name: "App Name",
            timezone: "Timezone"
        }
    }
    mounted() {
        this.smartValidation = SmartValidation(this.FORM_NAME)
        // For text basic
        this.smartValidation.inputTextValidation({
            callback: (props, e) => {
                let form_data = props.form_data
                let error = props.error
                let form_error = this.state.form_error
                if (props.status == "error") {
                    return this.setState({
                        form_error: {
                            ...form_error,
                            ...error
                        }
                    })
                }
                for(let key in form_data){
                    delete form_error[key]
                }
                this.setState({
                    form_error: form_error
                })
            },
            form_data: this.state.form_data,
            element_target: "input[type=text],input[type=email],select",
            form_attribute_name: this.getFormAttributeName(),
            form_rules: this.getFormRule()
        })
        // For password
        this.smartValidation.inputTextValidation({
            callback: (props, e) => {
                let form_data = props.form_data
                let error = props.error
                let form_error = this.state.form_error
                if (props.status == "error") {
                    return this.setState({
                        form_error: {
                            ...form_error,
                            ...error
                        }
                    })
                }
                for(let key in form_data){
                    delete form_error[key]
                }
                this.setState({
                    form_error: form_error
                })
            },
            form_data: this.state.form_data,
            element_target: "select,input[type=password]",
            form_attribute_name: this.getFormAttributeName(),
            form_rules: this.getFormRule()
        })
    }
    submitValidation() {
        return new Promise((resolve: { (props: boolean): void }) => {
            this.smartValidation.submitValidation({
                callback: (props) => {
                    console.log(props);
                    if (props.status == "error") {
                        this.setState({
                            form_error: props.error
                        })
                        resolve(false)
                    }
                    if (props.status == "complete") {
                        this.setState({
                            form_error: {},
                        })
                        resolve(true)
                    }
                },
                form_data: this.state.form_data,
                form_attribute_name: this.getFormAttributeName(),
                form_rules: this.getFormRule()
            })
        })
    }
    handlePropsData() {
        this.setState({
            form_data: this.props.data
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
        if (action == "STEP_CHANGE") {
            this.submit(props);
        }
    }
    async submit(props: number) {
        let passed = await this.submitValidation();
        if (passed == false) {
            return;
        }
        let step = props as number
        this.props.onListener({
            return: this.state.form_data,
            step: step,
            percent: 25
        })
    }
}

export default function Step1(props: StepProps) {
    let methods = useMemo(() => new Step1Class(), []);
    methods.defineState(useState<StepState>({
        form_data: {},
        form_error: {}
    }), props);
    useEffect(() => {
        methods.mounted()
    }, [])
    useEffect(() => {
        methods.handlePropsData();
    }, [props.data])
    const {
        form_data,
        form_error
    } = methods.state
    return <div id={methods.FORM_NAME}>
        <h3>Step 1: App Configuration</h3>
        <Form.Group controlId="appName" className="mb-3">
            <Form.Label>App Name</Form.Label>
            <Form.Control
                type="text"
                name="app_name"
                value={form_data.app_name}
                onChange={methods.handleChange.bind(methods, "FORM_DATA", {})}
                placeholder="Enter app name"
                isInvalid={form_error.app_name != null}
            />
            <Form.Control.Feedback type="invalid">
                {form_error.app_name}
            </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="timezone" className="mb-3">
            <Form.Label>Timezone</Form.Label>
            <Form.Select name="timezone" value={form_data.timezone} onChange={methods.handleChange.bind(methods, "FORM_DATA", {})}
                isInvalid={form_error.timezone != null}>
                <option value={""}>Select timezone</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New York</option>
                <option value="Asia/Jakarta">Asia/Jakarta</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
                {form_error.timezone}
            </Form.Control.Feedback>
        </Form.Group>
        <Button variant="primary" className="mt-3" onClick={methods.handleClick.bind(methods, "STEP_CHANGE", 1)}>
            Next
        </Button>
    </div>
}