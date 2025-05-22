import { useEffect, useMemo, useState } from "react";
import BaseStateClass from "./components/helper/BaseStateClass";
import { Link, Outlet, Route, Routes, useNavigate } from "react-router";
import { Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import WorkspacesList from "./workspaces/WorkspacesList";
import TestConnectionPage from "./test_connection/TestConnectionList";
import ChannelList from "./channel/ChannelList";
import SettingApp from "./setting/SettingApp";
import UserService from "./services/UserService";

export interface PropType {

}

export interface StateType {
    token: string
}

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        location.replace("/auth/logout")
    };

    return (
        <Container fluid>
            <Row>
                {/* Side Menu */}
                <Col md={3} className="bg-light vh-100 p-3">
                    <Navbar.Brand as={Link} to="/dashboard">My DashboardApp</Navbar.Brand>
                    <Nav className="flex-column">
                        <Nav.Link as={Link} to="">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="channels">Channels</Nav.Link>
                        <Nav.Link as={Link} to="settings">Settings</Nav.Link>
                        <Nav.Link as={Link} to="test-connection">Test Connection</Nav.Link>
                        <Nav.Link onClick={handleLogout} className="mt-auto">Logout</Nav.Link>
                    </Nav>
                </Col>
                {/* Content */}
                <Col md={9} className="p-4">
                    <Outlet /> {/* Renders nested routes like /dashboard, /channels */}
                </Col>
            </Row>
        </Container>
    );
};

export class DashboardAppCLass extends BaseStateClass<StateType, PropType> {

    mounted() {
        this.checkAuth()
    }

    async checkAuth() {
        try {
            let resData = await UserService.profile();
        } catch (error) {
            console.error("checkAuth - err ", error)
            this.refershToken()
        }
    }

    async refershToken() {
        try {
            let resData = await UserService.refreshToken();
            let token = resData.data.access_token
            localStorage.setItem("token", token);
            this.setState({
                token
            })
        } catch (error) {
            console.error("refershToken - err ", error)
            window.location.replace("/admin/auth/login")
        }
    }

    render() {
        console.log("this.state.token", this.state.token);
        const isNotAuthenticated = ["", null].some((val) => {
            return this.state.token == val
        });
        return <Routes>
            <Route
                path="/"
                element={isNotAuthenticated == false ? <Dashboard /> : <>
                    {/* {(() => {
                        window.location.replace("/auth/login")
                    })()} */}
                    <h1>Try Refresh Token...</h1>
                </>}
            >
                <Route path="" element={<WorkspacesList></WorkspacesList>} />
                <Route path="channels" element={<ChannelList></ChannelList>} />
                <Route path="settings" element={<SettingApp></SettingApp>} />
                <Route path="test-connection" element={<TestConnectionPage></TestConnectionPage>} />
            </Route>
        </Routes>
    }
}

export default function DashboardApp(props: PropType) {
    let methods = useMemo(() => new DashboardAppCLass(), []);
    methods.defineState(useState<StateType>({
        token: localStorage.getItem("token") || ""
    }), props)
    useEffect(() => {
        methods.mounted()
    }, [])
    return methods.render();
}