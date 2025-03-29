import { useEffect, useMemo, useState } from "react"
import AdminNewModal, { StateType as StateTypeNew, PropType as PropTypeNew, AdminNewModalClass } from "./AdminNewModal"

import { toast } from "react-toastify";
import AdminService, { AdminType } from "../../services/AdminService";

type PropType = PropTypeNew & {
    admin_data: AdminType
}

class AdminUpdateModalClass extends AdminNewModalClass {
    declare props: PropType
    async submitData() {
        try {
            let form_data = this.state.form_data
            let resData = await AdminService.update(form_data)
            this.props.onListener({
                action: "SUBMIT",
                return: resData.return,
            })
            this.setState({
                error_mesage: "",
                is_loading: false
            })

            toast.success('User updated!');
        } catch (error: any) {
            this.setState({
                error_mesage: error.response.body.message
            })
        }
    }

    async setSyncMounted() {
        this.setState({
            form_data: this.props.admin_data,
            error_mesage: ""
        })
        // await this.getGroups();
    }
}

export default function AdminUpdateModal(props: PropType) {
    let methods = useMemo(() => new AdminUpdateModalClass(), []);

    methods.defineState(useState<StateTypeNew>({
        form_data: {},
        error_mesage: "",
        // group_datas: [],
        is_loading: false,
        form_error: {}
    }), {
        ...props,
        extendAdminNewModalClass: methods,
    })

    useEffect(() => {
        if (props.show == false) return
        methods.setSyncMounted();
    }, [props.show])

    return <AdminNewModal {...props} extendAdminNewModalClass={methods} ></AdminNewModal>
}