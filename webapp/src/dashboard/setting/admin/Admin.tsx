import { useEffect, useMemo, useState } from "react"
import AdminNewModal from "./AdminNewModal"
import AdminUpdateModal from "./AdminUpdateModal"
import AdminDeleteModal from "./AdminDeleteModal"
import { DebouncedFunc, debounce, filter } from "lodash-es"
import BaseStateClass from "../../components/helper/BaseStateClass"
import AdminService, { AdminSearchType, AdminType } from "../../services/AdminService"
import MessageCard, { MessageCardClass } from "../../components/message/MessageCard"
import EmptyList from "../EmptyList"
import { Dropdown } from "react-bootstrap"

type PropType = {

}

type StateType = {
    form_query: any
    admin_datas: Array<AdminType>
    admin_data_selected: AdminType
    show_admin_new_modal: boolean
    show_admin_update_modal: boolean
    show_admin_delete_user: boolean
    show_search_form: boolean
    is_loading: boolean
}

class AdminClass extends BaseStateClass<StateType, PropType> {

    declare messageCard: MessageCardClass

    async mounted() {
        this.setState({
            is_loading: true
        })
        this.setAdmins(await this.getAdmins())
    }
    handleClick(action: string, props?: any, e?: any) {
        let admin_datas = this.state.admin_datas
        switch (action) {
            case 'CLOSE':
                e.preventDefault();
                this.setState({
                    show_search_form: false
                })
                break;
            case 'FILTER':
                e.preventDefault();
                this.setState({
                    show_search_form: !this.state.show_search_form
                })
                break;
            case 'RESTORE':
                e.preventDefault();
                let restore_data = admin_datas[props.index]
                this.submitRestoreData(restore_data.id || 0);
                break;
            case 'DELETE':
                e.preventDefault();
                this.setState({
                    show_admin_delete_user: !this.state.show_admin_delete_user,
                    admin_data_selected: admin_datas[props.index]
                })
                break;
            case 'UPDATE':
                e.preventDefault();
                console.log("admin_datas[props.index] :: ", admin_datas[props.index])
                this.setState({
                    show_admin_update_modal: !this.state.show_admin_update_modal,
                    admin_data_selected: admin_datas[props.index]
                })
                break;
            case "NEW_GROUP":
                this.setState({
                    show_admin_new_modal: !this.state.show_admin_new_modal
                })
                break;
        }
    }

    async submitRestoreData(id: number) {
        let resData = await AdminService.restore([id]);
        alert("Data restored")
        this.mounted();
    }

    handleChange(action: string, props?: any, e?: any) {
        switch (action) {
            case 'FORM_FILTER':
                console.log(e.target.value)
                break;
        }
    }

    handleListener(action: string, props?: any) {
        switch (action) {
            case 'ADMIN_DELETE_MODAL_LISTENER':
            case 'ADMIN_NEW_MODAL_LISTENER':
            case 'ADMIN_UPDATE_MODAL_LISTENER':
                switch (props.action) {
                    case 'SUBMIT':
                        this.setState({
                            show_admin_new_modal: false,
                            show_admin_update_modal: false,
                            show_admin_delete_user: false,

                        })
                        this.mounted()
                        break;
                    case 'CLOSE':
                        this.setState({
                            show_admin_new_modal: false,
                            show_admin_update_modal: false,
                            show_admin_delete_user: false,
                        })
                        break;
                }
                break;

            case 'SEARCH_FORM_LISTENER':
                switch (props.action) {
                    case 'CLOSE':
                        this.setState({
                            show_search_form: false
                        })
                        break;
                    case 'SUBMIT':
                        this.setState({
                            is_loading: true
                        })
                        this.setAdmins(props.return);
                        break;
                }
                break;
        }
    }

    async getAdmins() {
        let httpStatus = 0
        try {
            let resData = await AdminService.getAdmins(this.state.form_query);
            return resData;
        } catch (error: any) {
            console.error(error)
            httpStatus = error.status
        } finally {
            if (httpStatus == 401) {
                this.messageCard.showMessage("Permission Denied", "You dont have permission to access this data. Please contact your administrator", "red")
            }
        }
    }

    setAdmins(props: any) {
        if (props == null) return
        let data = props.data;
        this.setState({
            admin_datas: data,
            form_query: {
                ...this.state.form_query,
                filter: props.filter || null
            },
            is_loading: false
        })
    }
}

export default function Admin(props: PropType) {
    let methods = useMemo(() => new AdminClass(), []);

    methods.defineState(useState<StateType>({
        form_query: {},
        admin_datas: [],
        show_admin_new_modal: false,
        show_admin_update_modal: false,
        show_admin_delete_user: false,
        show_search_form: false,
        admin_data_selected: {},
        is_loading: false
    }), props)

    useEffect(() => {
        methods.mounted()
    }, [])

    let { admin_datas, show_admin_new_modal, show_admin_update_modal, admin_data_selected, show_admin_delete_user, show_search_form, is_loading } = methods.state;

    return <>
        <div className="col d-flex flex-column">
            <div className="p-4">
                <h2 className="mb-4">Admin & Roles</h2>
                <div className="card mb-3">
                    <div className="card-stamp">
                        <div className="card-stamp-icon">
                            <svg width="133" height="132" viewBox="0 0 133 132" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="102.784" cy="29.1997" r="102.293" fill="#DC1882" fillOpacity="0.2" />
                                <circle cx="102.784" cy="29.1997" r="43.8399" fill="#DC1882" fillOpacity="0.3" />
                            </svg>
                        </div>
                    </div>
                    <div className="card-body">
                        <h3 className="card-title">Manage Admins</h3>
                        <p className="text-secondary">
                            The manage admin feature enables super administrators to create, edit, and manage other administrator accounts.
                            It provides options to assign specific roles and permissions to each admin, ensuring they have the necessary tools
                            and access to perform their duties. Super administrators can also monitor admin activity, reset passwords,
                            and deactivate accounts when necessary, maintaining full control over administrative access.
                        </p>
                        <div className="btn-list">
                            <div className="d-none d-sm-inline">
                                <button className="btn btn-primary" onClick={methods.handleClick.bind(methods, 'NEW_GROUP', {})}>New</button>
                            </div>
                            <div className="d-none d-sm-inline">
                                <a href="#" className="btn btn-outline-primary w-100" onClick={methods.handleClick.bind(methods, 'FILTER', {})}>
                                    Filter
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <SearchForm show={show_search_form} onListener={methods.handleListener.bind(methods, 'SEARCH_FORM_LISTENER')}></SearchForm>

                <MessageCard onInit={(val) => methods.messageCard = val}></MessageCard>
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
                    admin_datas.length > 0 ? <>
                        <div className="card">
                            <div className="table-responsive" style={{ minHeight: "500px" }}>
                                <table className="table table-vcenter card-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th className="w-1" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admin_datas.map((val, i) => {
                                            return <tr key={i}>
                                                <td>{val.name} {val.last_name}</td>
                                                <td>
                                                    <span className={`${val.status == 'active' ? 'badge bg-success' : 'badge bg-danger'} text-capitalize`}>{val.status}</span>
                                                </td>
                                                <td>
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                                                            Action
                                                        </Dropdown.Toggle>

                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={methods.handleClick.bind(methods, "UPDATE", { index: i })}>Edit</Dropdown.Item>
                                                            {val.deleted_at != null ?

                                                                <Dropdown.Item onClick={methods.handleClick.bind(methods, "RESTORE", { index: i })}>Restore</Dropdown.Item>
                                                                :
                                                                <Dropdown.Item onClick={methods.handleClick.bind(methods, 'DEACTIVATED', { index: i })}>Deactivated</Dropdown.Item>
                                                            }
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </> : <EmptyList></EmptyList>
                }
            </div>
            <div className="p-4">
                <div className="card-footer bg-transparent mt-auhref">
                    <div className="btn-list justify-content-end">
                    </div>
                </div>
            </div>
        </div>
        <AdminDeleteModal onListener={methods.handleListener.bind(methods, 'ADMIN_DELETE_MODAL_LISTENER')} show={show_admin_delete_user} admin_data={admin_data_selected}></AdminDeleteModal>
        <AdminNewModal onListener={methods.handleListener.bind(methods, 'ADMIN_NEW_MODAL_LISTENER')} show={show_admin_new_modal}></AdminNewModal>
        <AdminUpdateModal onListener={methods.handleListener.bind(methods, 'ADMIN_UPDATE_MODAL_LISTENER')} show={show_admin_update_modal} admin_data={admin_data_selected}></AdminUpdateModal>
    </>
}



type SearchFormPropType = {
    show: boolean
    onListener: {
        (props: {
            action: string
            return: any
        }): void
    }
}

type SearchFormStateType = {
    form_data: AdminSearchType
}

class SearchFormClass extends BaseStateClass<SearchFormStateType, SearchFormPropType> {
    declare pendingSubmit: DebouncedFunc<any>
    handleChange(action: string, props?: any, e?: any) {
        let form_data = this.state.form_data;
        switch (action) {
            case 'FORM_DATA':
                form_data = {
                    ...form_data,
                    [e.target.name]: e.target.value
                }
                this.setState({
                    form_data
                })
                if (this.pendingSubmit != null) {
                    this.pendingSubmit.cancel()
                }
                this.pendingSubmit = debounce((form_data: any) => {
                    this.submitData();
                }, 1000)
                this.pendingSubmit(form_data)
                break;
        }
    }

    async submitData() {
        try {
            let form_data = this.state.form_data
            let resData = await AdminService.postGetAdmins(form_data)
            this.props.onListener({
                action: "SUBMIT",
                return: resData
            })
        } catch (error) {
            console.error(error);
        }
    }

    handleClick(action: string, props?: any, e?: any) {
        switch (action) {
            case 'CLOSE':
                e.preventDefault();
                this.props.onListener({
                    action: "CLOSE",
                    return: null
                })
                break;
        }
    }
}

var SearchFormData = {
    form_data: {}
} as SearchFormStateType

const SearchForm = (props: SearchFormPropType) => {
    let methods = useMemo(() => new SearchFormClass(), []);

    methods.defineState(useState<SearchFormStateType>(SearchFormData), props)

    let { form_data } = methods.state
    if (props.show == false) return;
    return <div className="mb-3">
        <div className="card">
            <div className="card-body">
                <h3 className="card-title">Search User Form</h3>
                <div className="mb-3">
                    <label className="form-label">Data Position</label>
                    <div className="btn-group w-100" role="group">
                        <input
                            onChange={methods.handleChange.bind(methods, 'FORM_DATA', {})}
                            type="radio"
                            className="btn-check"
                            id="btn-radio-basic-1"
                            autoComplete="off"
                            name="data_position"
                            value="exist"
                            checked={form_data.data_position == "exist"}
                        />
                        <label htmlFor="btn-radio-basic-1" className="btn">
                            Exist
                        </label>
                        <input
                            onChange={methods.handleChange.bind(methods, 'FORM_DATA', {})}
                            type="radio"
                            className="btn-check"
                            id="btn-radio-basic-2"
                            autoComplete="off"
                            name="data_position"
                            value="deleted"
                            checked={form_data.data_position == "deleted"}
                        />
                        <label htmlFor="btn-radio-basic-2" className="btn">
                            Deleted
                        </label>
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">
                        Looking user by name, email
                    </label>
                    <div className="input-icon">
                        <input
                            onChange={methods.handleChange.bind(methods, 'FORM_DATA', {})}
                            type="text"
                            name="search"
                            value={form_data.search || ""}
                            className="form-control"
                            placeholder="Search…"
                            defaultValue=""
                        />
                        <span className="input-icon-addon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="icon"
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
                                <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                                <path d="M21 21l-6 -6" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
            <div className="card-footer">
                <div className="row align-items-center">
                    <div className="col" />
                    <div className="col-auto">
                        <a href="#" className="btn" onClick={methods.handleClick.bind(methods, 'CLOSE', {})}>
                            Close
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
}