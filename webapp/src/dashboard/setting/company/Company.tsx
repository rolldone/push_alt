
import $ from 'jquery';
import { toast } from 'react-toastify';
import BaseStateClass from '../../components/helper/BaseStateClass';
import SmartValidation from '../../components/helper/SmartValidation';
import Textarea from '../../components/textarea/Textarea';
import { useEffect, useMemo, useState } from 'react';
import SettingService, { SettingInterface } from '../../services/SettingService';
import { Form } from 'react-bootstrap';

export type StateType = {
    form_data: SettingInterface,
    form_error: any,
    is_loading: boolean,
    max_address_length: number
}

export type PropType = {

}


export class CompanyClass extends BaseStateClass<StateType, PropType> {

    /* VALIDATION CONFIGURATION OBJECT */
    validationConfig = {
        formAttributeName: {
            app_name: "App Name",
            timezone: "Timezone",
        },
        formRules: {
            app_name: "required",
            timezone: "required",
        },
    };

    async mounted() {
        await this.getById(this.state.form_data.id as number);
        /* VALIDATION ON LEAVE */
        setTimeout(() => {
            let _smartValidation = SmartValidation("form-company");
            _smartValidation.inputTextValidation({
                callback: (props, e) => {
                    console.log(props);
                    let target = $(e.target);
                    let _form_error = this.state.form_error;
                    switch (props.status) {
                        case "error":
                            _form_error = props.error;
                            this.setState({
                                form_error: {
                                    ...this.state.form_error,
                                    ..._form_error
                                }
                            })
                            return target.addClass("is-invalid");
                        case "valid":
                        case "complete":
                            return target.removeClass("is-invalid");
                    }
                },
                form_data: this.state.form_data,
                element_target: "input[type=email],input[type=text],input[type=number],input[type=password],select",
                form_attribute_name: this.validationConfig.formAttributeName,
                form_rules: this.validationConfig.formRules,
            })
        }, 1000);
    }

    handleChange(action: string, props?: any, e?: any) {
        let _form_data = this.state.form_data || {};
        switch (action) {
            case 'FORM_DATA':
                switch (e.target.name) {
                    default:
                        _form_data = {
                            ..._form_data,
                            [e.target.name]: e.target.value
                        }
                        break;
                }
                this.setState({
                    form_data: _form_data
                })
                break;
        }
    }

    handleClick(action: string, props?: any, e?: any) {
        e.preventDefault();
        switch (action) {
            case 'SUBMIT':
                e.preventDefault();

                let _smartValidation = SmartValidation("form-company");
                _smartValidation.submitValidation({
                    form_data: this.state.form_data,
                    form_attribute_name: this.validationConfig.formAttributeName,
                    form_rules: this.validationConfig.formRules,
                    callback: (props) => {
                        switch (props.status) {
                            case "error":
                                this.setState({
                                    form_error: props.error
                                })
                                for (let key in props.error) {
                                    $("#" + props.id).find(`input[name=${key}], select[name=${key}], textarea[name=${key}]`).addClass("is-invalid");
                                    $("#" + key).addClass("is-invalid");
                                }
                                break;
                            case "valid":
                            case "complete":
                                for (let key in props.form_data) {
                                    $("#" + props.id).find(`input[name=${key}], select[name=${key}], textarea[name=${key}]`).removeClass("is-invalid");
                                    $("#" + key).removeClass("is-invalid");

                                }
                                this.setState({
                                    is_loading: true
                                })
                                this.submitData()
                                break;
                        }
                    }
                })
                break;
        }
    }

    async submitData() {
        try {
            let resData = await SettingService.addOrUpdateFormData(this.state.form_data);
            if (resData) {
                this.setState({
                    form_data: {},
                    form_error: {},
                    is_loading: false
                });
                this.getById(this.state.form_data.id as number);
            }

            toast.success('Data company created!');
        } catch (ex) {
            console.error("submitData - ex :: ", ex);
        }
    }

    async getById(companyId: number) {
        try {
            let resData = await SettingService.getsFormSetting();
            let data = resData.data;
            this.setState({
                form_data: { ...data, id: companyId },
                is_loading: false
            })
        } catch (error) {
            console.error(error)
        }
    }

    render(): React.ReactNode {
        const {
            form_data,
            form_error,
            is_loading
        } = this.state
        return <>
            <div className="col d-flex flex-column">
                <div className="p-4">
                    <h2 className="mb-4">Foundation Profile</h2>
                    <div id="form-company">
                        <div className="card-stamp">
                            <div className="card-stamp-icon">
                                <svg width="133" height="132" viewBox="0 0 133 132" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="102.784" cy="29.1997" r="102.293" fill="#DC1882" fillOpacity="0.2" />
                                    <circle cx="102.784" cy="29.1997" r="43.8399" fill="#DC1882" fillOpacity="0.3" />
                                </svg>
                            </div>
                        </div>
                        {is_loading ? <>
                            <div className="page page-center">
                                <div className="container container-slim py-4">
                                    <div className="text-center">
                                        <div className="text-secondary mb-3">Loading data...</div>
                                        <div className="progress progress-sm">
                                            <div className="progress-bar progress-bar-indeterminate"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </> :
                            <>
                                <Form.Group className="mb-3" controlId="app_name">
                                    <Form.Label>App Name</Form.Label>
                                    <Form.Control
                                        isInvalid={form_error.app_name != null}
                                        name="app_name"
                                        value={form_data.app_name || ''}
                                        onChange={this.handleChange.bind(this, 'FORM_DATA', {})}
                                        type="text"
                                        placeholder="Enter event name"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {form_error.app_name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group controlId="timezone" className="mb-3">
                                    <Form.Label>Timezone</Form.Label>
                                    <Form.Select 
                                        name="timezone" 
                                        value={form_data.timezone} 
                                        onChange={this.handleChange.bind(this, "FORM_DATA", {})}
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
                            </>
                        }
                    </div>
                </div>
                <div className="p-4">
                    <hr />
                    <div className="btn-list justify-content-end">
                        <a href="#" className="btn">
                            Cancel
                        </a>
                        <button type="submit" className="btn btn-primary" disabled={this.state.is_loading} onClick={this.handleClick.bind(this, 'SUBMIT', {})}>
                            {this.state.is_loading ? <span className="spinner-border spinner-border-sm me-2" role="status"></span> : null}
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </>
    }
}

export default function Company(props: PropType) {
    let methods = useMemo(() => new CompanyClass(), []);
    methods.defineState(useState<StateType>({
        form_data: {
            id: 1
        },
        form_error: {},
        is_loading: true,
        max_address_length: 1000
    }), props)
    useEffect(() => {
        methods.mounted()
    }, [])
    return methods.render()
}