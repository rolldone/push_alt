import { useMemo, useState } from "react"
import { Modal } from "react-bootstrap";
import BaseStateClass from "../../components/helper/BaseStateClass";
import AdminService, { AdminType } from "../../services/AdminService";

export type PropType = {
    show: boolean
    onListener: {
        (props: {
            action: string
            return: any
        }): void
    }
    admin_data: AdminType
}

export type StateType = {

}

export class AdminDeleteModalClass extends BaseStateClass<StateType, PropType> {
    handleClick(action: string, props?: any, e?: any) {
        switch (action) {
            case "CLOSE":
                this.props.onListener({
                    action: "CLOSE",
                    return: null
                })
                break
            case 'SUBMIT':
                this.submitData();
                break;
        }
    }
    async submitData() {
        let admin_data = this.props.admin_data || {};
        // let resData = await AdminService.deletes([admin_data.id || 0])
        this.props.onListener({
            action: "SUBMIT",
            return: null
        })
    }
}

export default function AdminDeleteModal(props: PropType) {
    let methods = useMemo(() => new AdminDeleteModalClass(), []);

    methods.defineState(useState<StateType>({}), props);

    let { show } = props
    let { } = methods.state;

    return <>
        <Modal
            show={show}
            onHide={methods.handleClick.bind(methods, 'CLOSE', {})}
            backdrop="static"
            size="sm"
            keyboard={false}
        >
            {/* <Modal.Header closeButton>
                <Modal.Title>New Category</Modal.Title>
            </Modal.Header> */}
            <div className="modal-content">
                <div className="modal-body">
                    <div className="modal-title">Delete user?</div>
                    <div>You can restore back the user deleted.</div>
                </div>
                <div className="modal-footer">
                    <button
                        onClick={methods.handleClick.bind(methods, 'CLOSE', {})}
                        type="button"
                        className="btn btn-link link-secondary me-auto"
                        data-bs-dismiss="modal"
                    >
                        Cancel
                    </button>
                    <button type="button" className="btn btn-danger" onClick={methods.handleClick.bind(methods, 'SUBMIT', {})} data-bs-dismiss="modal">
                        Yes, delete it
                    </button>
                </div>
            </div>
        </Modal>
    </>
}