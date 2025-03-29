import './js/SmartValidation.js';
declare var smartValidation: any;

export type inputTextValidationType = {
    form_attribute_name?: any
    form_data: any
    form_rules?: any
    callback: { (props: any, e?: any): void }
    element_target?: any
}

export type submitValidationType = {
    form_attribute_name?: any
    form_data: any
    form_rules?: any
    callback: { (props: any): void }
};

export interface SmartValidationInterface {
    privSubmitValidation: { (props: any, callback: Function): void }
    privInputTextValidation: { (wrapperTarget: String, props: any, callback: Function): void }
    inputTextValidation: {
        (props: inputTextValidationType): void
    }
    inputPasswordValidation: { (props: inputTextValidationType): void }
    submitValidation: { (props: submitValidationType): void }
}

function SmartValidationFunction(smartValidation: SmartValidationInterface) {
    return smartValidation;
}

export default function SmartValidation(id: String | HTMLElement | void) {
    let smart: any = smartValidation(id);
    return SmartValidationFunction({
        privSubmitValidation: smart.privSubmitValidation,
        privInputTextValidation: smart.privInputTextValidation,
        inputTextValidation: smart.inputTextValidation,
        inputPasswordValidation: smart.inputPasswordValidation,
        submitValidation: smart.submitValidation,
    });
};