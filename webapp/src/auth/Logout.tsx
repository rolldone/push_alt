import { useEffect, useMemo, useState } from "react";
import BaseStateClass from "./components/helper/BaseStateClass";
import AuthService from "./services/AuthService";

export interface PropType {

}

export interface StateType {

}

export class LogoutClass extends BaseStateClass<StateType, PropType> {
    mounted() {
        AuthService.logout();
    }
    handleClick(action: string, props?: any, e?: any) {
        if (action == "LOGIN") {
            window.location.replace("/auth/login")
        }
    }
    render() {
        return <div className="logout-container">
            <h1 className="logout-title">Logout page</h1>
            <p className="logout-description">You have logout</p>
            <button onClick={this.handleClick.bind(this, "LOGIN", {})} className="login-again-button">
                Login again
            </button>
        </div>
    }
}

export default function Logout(props: PropType) {
    let methods = useMemo(() => new LogoutClass(), []);
    methods.defineState(useState<StateType>({}), props);
    useEffect(() => {
        methods.mounted();
    }, [])
    return methods.render()
}