import { useEffect, useMemo, useState } from "react";
import { Step1Class, StepProps, StepState } from "./Step1";
import { Button, Form } from "react-bootstrap";

export class Step2Class extends Step1Class {
    // @ts-ignore
    getFormAttributeName() {
        return {
            name: "Name",
            email: "Email",
            password: "Password",
            password_confirm: "Password Confirmation"
        }
    }
    // @ts-ignore
    getFormRule() {
        return {
            name: "required",
            email: "required|email",
            password: "required|min:8",
            password_confirm: "required|same:password"
        }
    }
}
export default function Step2(props: StepProps) {
    let methods = useMemo(() => new Step2Class(), []);
    methods.defineState(useState<StepState>({
        form_data: {},
        form_error: {}
    }), props)
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
        <h3>Step 2: Your Details</h3>
        <Form.Group controlId="name" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
                type="text" name="name"
                value={form_data.name} onChange={methods.handleChange.bind(methods, "FORM_DATA", {})}
                placeholder="Enter your name"
                isInvalid={form_error.name != null}
            />
            <Form.Control.Feedback type="invalid">
                {form_error.name}
            </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
                type="email" name="email" value={form_data.email}
                onChange={methods.handleChange.bind(methods, "FORM_DATA", {})}
                placeholder="Enter your email"
                isInvalid={form_error.email != null}
            />
            <Form.Control.Feedback type="invalid">
                {form_error.email}
            </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="password" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
                type="password" name="password" value={form_data.password}
                onChange={methods.handleChange.bind(methods, "FORM_DATA", {})}
                placeholder="Create a password"
                isInvalid={form_error.password != null}
            />
            <Form.Control.Feedback type="invalid">
                {form_error.password}
            </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="passwordConfirm" className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
                type="password" name="password_confirm"
                value={form_data.password_confirm}
                onChange={methods.handleChange.bind(methods, "FORM_DATA", {})}
                placeholder="Confirm your password"
                isInvalid={form_error.password_confirm != null}
            />
            <Form.Control.Feedback type="invalid">
                {form_error.password_confirm}
            </Form.Control.Feedback>
        </Form.Group>
        <Button variant="secondary" className="me-2" onClick={methods.handleClick.bind(methods, "STEP_CHANGE", -1)}>
            Back
        </Button>
        <Button variant="primary" onClick={methods.handleClick.bind(methods, "STEP_CHANGE", 1)}>
            Next
        </Button>
    </div>
}