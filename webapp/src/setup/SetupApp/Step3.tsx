import { useEffect, useMemo, useState } from "react";
import { Step1Class, StepProps, StepState } from "./Step1";
import { Button, Spinner } from "react-bootstrap";
import SetupService from "../services/SetupService";
import { SuperAgentRequest } from "superagent";
import ButtonLoading from "../components/Button/ButtonLoading";

interface Step3State extends StepState {
    http_status: "pending" | "done"
}

export class Step3Class extends Step1Class {
    declare state: Step3State;
    declare setState: (state: Step3State | Partial<Step3State>) => void;
    async handleClick(action: string, props?: any, e?: any): Promise<void> {
        if (action == "SUBMIT") {
            return this.submit(0)
        }
        super.handleClick(action, props, e);
    }
    declare httpRequest: SuperAgentRequest
    async submit(props: number): Promise<void> {
        try {
            this.setState({
                http_status: "pending"
            })
            let resData = await SetupService.submit(this.state.form_data, (request) => {
                if (this.httpRequest != null) {
                    this.httpRequest.abort()
                }
                this.httpRequest = request
            });
            this.props.onListener({
                return: resData.return,
                step: 1,
                percent: 25
            })
        } catch (error) {
            console.error("submit - err :: ", error)
        } finally {
            try {
                if ((await this.httpRequest).status != null) {
                    this.setState({
                        http_status: "done"
                    })
                }
            } catch (error) {
                this.setState({
                    http_status: "done"
                })
            }
        }
    }
}

export default function Step3(props: StepProps) {
    let methods = useMemo(() => new Step3Class(), []);
    methods.defineState(useState<Step3State>({
        form_data: {},
        form_error: {},
        http_status: "done"
    }), props)
    useEffect(() => {
        methods.mounted()
    }, [])
    useEffect(() => {
        methods.handlePropsData();
    }, [props.data])
    const {
        form_data,
        http_status
    } = methods.state
    return <div>
        <h3>Step 3: Review Your Setup</h3>
        <p>App Name: <strong>[{form_data.app_name}]</strong></p>
        <p>Timezone: <strong>[{form_data.timezone}]</strong></p>
        <p>Name: <strong>[{form_data.name}]</strong></p>
        <p>Email: <strong>[{form_data.email}]</strong></p>
        <Button variant="secondary" className="me-2" onClick={methods.handleClick.bind(methods, "STEP_CHANGE", -1)}>
            Back
        </Button>
        <ButtonLoading
            http_status={http_status}
            onClick={methods.handleClick.bind(methods, "SUBMIT", {})}
        >
            ...Loading
        </ButtonLoading>
    </div>
}