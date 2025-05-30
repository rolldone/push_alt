import { Form } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import BaseStateClass from "../../components/helper/BaseStateClass";
import CorsService, { CorsType } from "../../services/CorsService";

export type StateType = {
    corsList: CorsType[];
    newCorsUrl: string;
};

export type PropType = {}
export class CorsListClass extends BaseStateClass<StateType, PropType> {

    componentDidMount() {
        this.loadCorsList();
    }

    loadCorsList = async () => {
        try {
            const corsList: CorsType[] = await CorsService.List();
            this.setState({ corsList });
        } catch (error) {
            console.error("Failed to load CORS list:", error);
        }
    };

    handleAddCors = async (e: React.FormEvent) => {
        e.preventDefault();
        const { newCorsUrl, corsList } = this.state;
        const urlPattern = /^(https?:\/\/)?(localhost|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?(\/.*)?$/;

        if (!urlPattern.test(newCorsUrl.trim())) {
            alert("Please enter a valid URL.");
            return;
        }

        try {
            const newCors: CorsType = await CorsService.Add({ url: newCorsUrl });
            this.setState({
                corsList: [newCors, ...corsList],
                newCorsUrl: "",
            });
        } catch (error: any) {
            if (error.response && error.response.body && !error.response.body.success) {
                alert(error.response.body.message || "Failed to add CORS entry.");
            } else {
                console.error("Failed to add CORS entry:", error);
            }
        }
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ newCorsUrl: e.target.value });
    };

    handleRemoveCors = async (index: number) => {
        const { corsList } = this.state;
        const corsToRemove = corsList[index] as CorsType;

        try {
            await CorsService.Remove(corsToRemove.id!);
            const updatedList = corsList.filter((_, i) => i !== index);
            this.setState({ corsList: updatedList });
        } catch (error) {
            console.error("Failed to remove CORS entry:", error);
        }
    };

    handleEditCors = async (index: number) => {
        const { corsList } = this.state;
        const corsToEdit = corsList[index] as CorsType;
        this.setState({ newCorsUrl: corsToEdit.url! });
        await this.handleRemoveCors(index);
    };

    render() {
        const { corsList, newCorsUrl } = this.state;
        return (
            <div className="page-header d-print-none">
                <div className="container-xl">
                    <div className="row g-2 align-items-center">
                        <div className="col">
                            <h2 className="page-title">
                                CORS Settings
                            </h2>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <Form onSubmit={this.handleAddCors}>
                                <Form.Group controlId="corsInput">
                                    <Form.Label>Enter CORS URL</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter URL"
                                        value={newCorsUrl}
                                        onChange={this.handleInputChange}
                                    />
                                </Form.Group>
                                <button type="submit" className="btn btn-primary mt-2">
                                    Add
                                </button>
                            </Form>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <h3>Added CORS URLs</h3>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '5%' }}>#</th>
                                        <th style={{ width: '85%' }}>CORS URL</th>
                                        <th style={{ width: '10%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {corsList.map((url, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{url.url}</td>
                                            <td>
                                                <div className="d-flex">
                                                    <button
                                                        className="btn btn-warning btn-sm me-2"
                                                        onClick={() => this.handleEditCors(index)}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => this.handleRemoveCors(index)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default function CorsList(props: PropType) {
    let methods = useMemo(() => {
        return new CorsListClass();
    }, []);
    methods.defineState(
        useState<StateType>({
            corsList: [],
            newCorsUrl: "",
        }),
        props
    );
    useEffect(() => {
        methods.componentDidMount();
    }, []);
    return methods.render();
}