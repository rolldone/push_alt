import { useMemo, useState } from "react";
import { Step1Class, StepProps, StepState } from "./Step1";
import { Alert, Button } from "react-bootstrap";

export class Step4Class extends Step1Class {
    handleClick(action: string, props?: any, e?: any): void {
        if (action == "LOGIN") {
            window.location.href = "/auth/login"
            return;
        }
        super.handleClick(action, props, e)
    }
}

export default function Step4(props: StepProps) {
    let methods = useMemo(() => new Step4Class(), []);
    methods.defineState(useState<StepState>({
        form_data: {},
        form_error: {}
    }), props)
    return <div>
        <h3>Step 4: Setup Complete!</h3>
        <Alert variant="success">
            Success! Your app is ready to use.
        </Alert>
        <Button variant="success" onClick={methods.handleClick.bind(methods, "LOGIN", {})}>
            Start Using App
        </Button>
    </div>
}