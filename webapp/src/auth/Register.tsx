import { useMemo, useState } from "react";
import BaseStateClass from "./components/helper/BaseStateClass";
import { Button, Form } from "react-bootstrap";

export interface RegisterProp {

}

export interface RegisterState {

}

export class RegisterClass extends BaseStateClass<RegisterState, RegisterProp> {

}

export default function Register(props: RegisterProp) {
    let methods = useMemo(() => new RegisterClass(), []);
    methods.defineState(useState<RegisterState>({}), props);
    return <div className="container mt-5">
        <h1>Register</h1>
        <Form>
            <Form.Group controlId="name" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" placeholder="Enter your name" />
            </Form.Group>
            <Form.Group controlId="age" className="mb-3">
                <Form.Label>Age</Form.Label>
                <Form.Control type="number" placeholder="Enter your age" />
            </Form.Group>
            <Form.Group controlId="email" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" placeholder="Enter your email" isInvalid={true} />
                <Form.Control.Feedback type="invalid">
                    Please enter a valid email address.
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="password" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Enter your password" />
            </Form.Group>
            <Button variant="primary" type="submit">
                Register
            </Button>
        </Form>
    </div>
}