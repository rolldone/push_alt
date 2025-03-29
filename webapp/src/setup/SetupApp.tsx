import { useMemo, useState } from "react";
import BaseStateClass from "./components/helper/BaseStateClass";
import { Form, ProgressBar } from "react-bootstrap";
import Step1, { OnListenerType } from "./SetupApp/Step1";
import Step2 from "./SetupApp/Step2";
import Step3 from "./SetupApp/Step3";
import Step4 from "./SetupApp/Step4";
import { SetupInterface } from "./services/SetupService";

interface SetupAppProps {

}


interface SetupAppState {
    form_data: SetupInterface
    section: number
    percent: number
}

export class SetupAppClass extends BaseStateClass<SetupAppState, SetupAppProps> {
    handleListener(action: string, props?: any) {
        if (action == "STEP_LISTENER") {
            let onListenerData = props as OnListenerType
            this.setState({
                section: this.state.section + onListenerData.step,
                form_data: onListenerData.return,
                percent: this.state.percent + onListenerData.percent
            })
        }
    }
    render() {
        const {
            section,
            form_data,
            percent
        } = this.state
        return <div className="container mt-5">
            <h1>Welcome to Your App</h1>
            <p>Let’s configure your app in a few steps.</p>
            <ProgressBar now={percent} label={`Step ${section} of 4`} className="mb-4" />
            <Form>
                {(() => {
                    switch (section) {
                        case 1:
                            {/* Step 1: App Name & Timezone */ }
                            return <Step1 data={form_data} onListener={this.handleListener.bind(this, "STEP_LISTENER")}></Step1>
                        case 2:
                            {/* Step 2: User Details */ }
                            return <Step2 data={form_data} onListener={this.handleListener.bind(this, "STEP_LISTENER")}></Step2>
                        case 3:
                            {/* Step 3: Review */ }
                            return <Step3 data={form_data} onListener={this.handleListener.bind(this, "STEP_LISTENER")}></Step3>
                        case 4:
                            {/* Step 4: Success */ }
                            return <Step4 data={form_data} onListener={this.handleListener.bind(this, "STEP_LISTENER")}></Step4>
                        default:
                            return <></>
                    }
                })()}
            </Form>
        </div>
    }
}

export default function SetupApp(props: SetupAppProps) {
    let methods = useMemo(() => new SetupAppClass(), []);
    methods.defineState(useState<SetupAppState>({
        section: 1,
        form_data: {},
        percent: 100 / 4
    }), props);
    return methods.render();
}