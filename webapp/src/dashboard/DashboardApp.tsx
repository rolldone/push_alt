import { useEffect, useMemo, useState } from "react";
import BaseStateClass from "./components/helper/BaseStateClass";
import { Link, Outlet, Route, Routes, useNavigate } from "react-router";
import { Col, Container, Dropdown, Nav, Navbar, Row } from "react-bootstrap";
import WorkspacesList from "./workspaces/WorkspacesList";
import TestConnectionPage from "./test_connection/TestConnectionList";
import ChannelList from "./channel/ChannelList";
import SettingApp from "./setting/SettingApp";
import UserService from "./services/UserService";
import "./DashboardApp.scss";
import { divide } from "lodash-es";

export interface PropType {

}

export interface StateType {
    token: string,
    isSidebarClosed: boolean,
}

interface DashboardProps {
    isSidebarClosed: boolean;
    onSidebarToggle: () => void;
}

const DashboardContent = () => {
    return(
        <Container fluid>
            <Row className="row justify-content-center">
                <Col md={12}>
                    <h1 className="my-4" style={{fontWeight: 600, opacity: 0.85}}>Dashboard</h1>
                </Col>
            </Row>
            <Row>
                <Col lg={12}>
                    <Row>
                        <Col xs={12} sm={6} md={4}>
                            <Link to={"/dashboard"} className="card main-menu mb-3 flex-column-reverse">
                                <h5 className="mb-0 me-1">
                                    Dashboard 
                                    
                                </h5>
                                <i className="bi bi-house"></i>
                            </Link>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <Link to={"/dashboard/workspaces"} className="card main-menu mb-3 flex-column-reverse">
                                <h5 className="mb-0 me-1">
                                    Workspaces 
                                    
                                </h5>
                                    <i className="bi bi-person-workspace"></i>
                            </Link>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <Link to={"/dashboard/channels"} className="card main-menu mb-3 flex-column-reverse">
                                <h5 className="mb-0 me-1">
                                    Channels 
                                    
                                </h5>
                                    <i className="bi bi-list"></i>
                            </Link>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <Link to={"/dashboard/test-connection"} className="card main-menu mb-3 flex-column-reverse">
                                <h5 className="mb-0 me-1">
                                    Test Connection 
                                    
                                </h5>
                                    <i className="bi bi-reception-4"></i>
                            </Link>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <Link to={"/dashboard/settings"} className="card main-menu mb-3 flex-column-reverse">
                                <h5 className="mb-0 me-1">
                                    Settings
                                    
                                </h5>
                                    <i className="bi bi-gear-fill"></i>
                            </Link>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};


const Dashboard = ({ isSidebarClosed, onSidebarToggle }: DashboardProps) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        location.replace("/auth/logout")
    };

    return (
        <div id="dashboardApp" className={isSidebarClosed ? "sidenav-closed": ""}>
            <aside id="sidenav">
                <nav className="accordion" id="sidenavAccordion">
                    <div className="sidenav-brand px-3">
                        <Link to="/dashboard" className="py-2 text-uppercase d-flex align-items-center justify-content-center text-center text-decoration-none">
                            sv-pushalt
                        </Link>
                    </div>
                    <div className="sidenav-menu">
                        <Nav>
                            <div className="sidenav-menu-heading">Main Menu</div>
                            <Nav.Link as={Link} to="">
                                <div className="nav-link-icon">
                                    <i className="bi bi-house"></i>
                                </div>
                                <span>Dashboard</span>
                            </Nav.Link>
                            <Nav.Link as={Link} to="workspaces">
                                <div className="nav-link-icon">
                                    <i className="bi bi-person-workspace"></i>
                                </div>
                                <span>Workspaces</span>
                            </Nav.Link>
                            <Nav.Link as={Link} to="channels">
                                <div className="nav-link-icon">
                                    <i className="bi bi-list"></i>
                                </div>
                                <span>Channels</span>
                            </Nav.Link>
                            <Nav.Link as={Link} to="test-connection">
                                <div className="nav-link-icon">
                                    <i className="bi bi-reception-4"></i>
                                </div>
                                <span>Test Connection</span>
                            </Nav.Link>
                            <Nav.Link as={Link} to="settings">
                                <div className="nav-link-icon">
                                    <i className="bi bi-gear-fill"></i>
                                </div>
                                <span>Settings</span>
                            </Nav.Link>
                            {/* <Nav.Link onClick={handleLogout}>
                                <div className="nav-link-icon">
                                    <i className="bi bi-box-arrow-right"></i>
                                </div>
                                <span>Logout</span>
                            </Nav.Link> */}
                        </Nav>
                    </div>
                </nav>
            </aside>
            <main id="wrapper">
                <nav id="topnav" className="navbar navbar-expand">
                    <button className="btn btn-link btn-md order-1 m-0" id="sidebarToggle" type="button" onClick={onSidebarToggle}>
                        <i className="bi bi-list"></i>
                    </button>
                    <ul className="navbar-nav ms-auto me-3 ml-0">
                        <li className="nav-item dropdown">
                            <Dropdown>
                                <Dropdown.Toggle id="navbarDropdown" className="m-0">
                                    Username
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </li>
                    </ul>
                </nav>
                {/* <Container fluid className="mainContent">
                    <Row>
                        <Col md={3} className="bg-light vh-100 p-3">
                            <Navbar.Brand as={Link} to="/dashboard">My DashboardApp</Navbar.Brand>
                            <Nav className="flex-column">
                                <Nav.Link as={Link} to="">Dashboard</Nav.Link>
                                <Nav.Link as={Link} to="workspaces">Workspaces</Nav.Link>
                                <Nav.Link as={Link} to="channels">Channels</Nav.Link>
                                <Nav.Link as={Link} to="settings">Settings</Nav.Link>
                                <Nav.Link as={Link} to="test-connection">Test Connection</Nav.Link>
                                <Nav.Link onClick={handleLogout} className="mt-auto">Logout</Nav.Link>
                            </Nav>
                        </Col>
                        <Col md={12} className="p-4">
                        </Col>
                    </Row>
                </Container> */}
                <section id="mainContent">
                    <Outlet /> {/* Renders nested routes like /dashboard, /channels */}
                </section>
                <footer className="py-4 bg-light mt-auto">
                    <div className="container-fluid">
                        <div className="d-flex align-items-center justify-content-center small">
                            <div className="text-muted">sv-pushalt.artywiz.io © 2025</div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
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
                element={isNotAuthenticated == false ? <Dashboard 
                    isSidebarClosed={this.state.isSidebarClosed}
                    onSidebarToggle={() => {
                        const nextState = !this.state.isSidebarClosed;
                        localStorage.setItem("isSidebarClosed", String(nextState));
                        this.setState({ isSidebarClosed: nextState });
                    }}
                    /> : <>
                    {/* {(() => {
                        window.location.replace("/auth/login")
                    })()} */}
                    <h1>Try Refresh Token...</h1>
                </>}
            >
                <Route path="" element={<DashboardContent/>} />
                <Route path="workspaces" element={<WorkspacesList></WorkspacesList>} />
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
        token: localStorage.getItem("token") || "",
        isSidebarClosed: localStorage.getItem("isSidebarClosed") === "false" ? false : true,
    }), props)
    useEffect(() => {
        methods.mounted()
    }, [])
    return methods.render();
}