import React, { useState }  from "react";

export type TextareaState = {
    value: string
}
export type TextareaProps = {
    id: string
    name: string
    value: string | null | undefined
    label: string
    maxLength?: number
    rows?: number
    cols?: number
    onChange: {
      (props: {
        target: {
          name: string
          value: any
        }
      }): void
    }
    placeholder?: string
    className?: string
    disabled?: boolean
    isRequired?: boolean
}

export default class Textarea extends React.Component {
    setState<K extends never>(state: TextareaState | Pick<TextareaState, K>, callback?: (() => void) | undefined): void {
        super.setState(state, callback);
    }
    declare state: Readonly<TextareaState>;
    declare props: Readonly<TextareaProps>;

    constructor(props: any) {
        super(props);
        this.state = {
            value: this.props.value as string
        }
    }

    componentDidUpdate(prevProps: Readonly<TextareaProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (this.props.value != prevProps.value) {
            this.setState({
                value: this.props.value
            })
        }
    }

    render(): React.ReactNode { 
        return <>
            <label className={"form-label " + (this.props.isRequired ? "required" : "")}>
                {this.props.label} <span className="form-label-description">{this.state.value?.length ?? 0}/{this.props.maxLength}</span>
            </label>        
            <textarea
                disabled={this.props.disabled || false}
                className={this.props.className}
                id={this.props.id}
                name={this.props.name}
                onChange={this.handleChange.bind(this, 'FORM_DATA', {})}
                placeholder={this.props.placeholder}
                maxLength={this.props.maxLength}
                rows={this.props.rows}
                cols={this.props.cols}
                value={this.state.value} />
        </>
    }

    handleChange(action: string, props?: any, e?: any) {
        switch (action) {
            case 'FORM_DATA':
                this.setState({
                    value: e.target.value
                }, () => {
                    this.props.onChange({
                        target: {
                            name: this.props.name,
                            value: this.state.value
                        }
                    })
                })
                break;
        }
    }
}