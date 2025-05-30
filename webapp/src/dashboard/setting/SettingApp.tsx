import { useEffect, useMemo, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify"
import BaseStateClass from "../components/helper/BaseStateClass";
import Company from "./company/Company";
import Profile from "./profile/Profile";
import Admin from "./admin/Admin";
import CorsList  from "./cors/CorsList";

type PropType = {

}

type StateType = {
    segment: string
}

export default function SettingApp(props: PropType) {
    let methods = useMemo(() => new SettingAppClass(), []);

    methods.defineState(useState<StateType>({
        segment: window.location.hash || "#group_role"
    }), props)

    useEffect(() => {
        methods.componentDidMount()
    }, [])

    return methods.render()
}

export class SettingAppClass extends BaseStateClass<StateType, PropType> {
    componentDidMount() {
        let listenUrlChange = (event: any) => {
            // The url has changed...
            this.setState({
                segment: window.location.hash
            })
            // debugger;
        }
        window.removeEventListener('hashchange', listenUrlChange)
        window.addEventListener('hashchange', listenUrlChange);
    }

    renderFoot() {
        return <>
            <footer className="footer footer-transparent d-print-none">
                <div className="container-xl">
                    <div className="row text-center align-items-center flex-row justify-content-end">
                        <div className="col-12 col-lg-auto mt-3 mt-lg-0">
                            <ul className="list-inline list-inline-dots mb-0">
                                <li className="list-inline-item">
                                    Copyright © 2024&nbsp;
                                    <a href="." className="link-secondary">
                                        BBH
                                    </a>
                                    . All rights reserved.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    }

    render() {
        let { segment } = this.state
        return <>
            <div className="page-wrapper">
                {/* Page header */}
                <div className="page-header d-print-none">
                    <div className="container-xl">
                        <div className="row g-2 align-items-center">
                            <div className="col">
                                <h2 className="page-title">Page Settings</h2>
                            </div>
                            {/* Page title actions */}
                            <div className="col-auto ms-auto d-print-none">
                                <div className="btn-list">
                                    {/* <button type="button" className="btn btn-primary" onClick={() => window.history.back()}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="icon icon-tabler icon-tabler-arrow-left"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M5 12l14 0" />
                                            <path d="M5 12l6 6" />
                                            <path d="M5 12l6 -6" />
                                        </svg>
                                        Back
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Page body */}
                <div className="page-body">
                    <div className="container-xl">
                        <div className="card">
                            <div className="row g-0">
                                <div className="col-12 col-md-3 border-end">
                                    <div className="card-body">
                                        <h4 className="subheader">Basic settings</h4>
                                        <div className="list-group list-group-transparent">
                                            <a
                                                href="#main"
                                                className={"list-group-item list-group-item-action d-flex align-items-center " + (segment == "#main" ? "active" : "")}
                                            >
                                                Main Setting
                                            </a>
                                             <a
                                                href="#cors"
                                                className={"list-group-item list-group-item-action d-flex align-items-center " + (segment == "#cors" ? "active" : "")}>
                                                Cors
                                            </a>
                                            <a
                                                href="#profile"
                                                className={"list-group-item list-group-item-action d-flex align-items-center " + (segment == "#profile" ? "active" : "")}>
                                                Profile
                                            </a>
                                        </div>
                                        <h4 className="subheader mt-4">Experience</h4>
                                        <div className="list-group list-group-transparent">
                                            {/* <a href="#group_role"
                                                className={"list-group-item list-group-item-action d-flex align-items-center " + (segment == "#group_role" ? "active" : "")}
                                            >
                                                Group & Role
                                            </a> */}
                                            <a href="#admin" className={"list-group-item list-group-item-action d-flex align-items-center " + (segment == "#admin" ? "active" : "")}
                                            >
                                                Admin
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-9 d-flex flex-column">
                                    <div className="card-body">
                                        {(() => {
                                            let segment = this.state.segment
                                            switch (segment) {
                                                case "#main":
                                                    return <Company></Company>
                                                case "#profile":
                                                    return <Profile></Profile>
                                                case "#admin":
                                                    return <Admin></Admin>
                                                case "#cors":
                                                    return <CorsList></CorsList>
                                                // case "#group_role":
                                                //     return <GroupRole></GroupRole>
                                            }
                                            return <></>
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.renderFoot()}
            </div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            {/* Same as */}
            <ToastContainer />
        </>
    }
}