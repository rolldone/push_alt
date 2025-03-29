const EmptyList = () => {
    return <>
        <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="table-responsive">
                        <table className="table table-vcenter card-table">
                            <thead>
                                <tr>
                                    <th>Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><div className="form-control-plaintext">Data is empty</div></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default EmptyList