import { useMemo, useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import BaseStateClass from '../components/helper/BaseStateClass';
import { io, Socket } from 'socket.io-client';
import TestConnectionService, { TestConnectionType } from '../services/TestConnectionService';
import ChannelService from '../services/ChannelService';
import MessageService from '../services/MessageService';
import ButtonLoading from '../components/Button/ButtonLoading';

const BASE_API_URL = import.meta.env.VITE_PUBLIC_MASTER_DATA_API || '';

interface PropType {
    onCloseListener?: () => void;
    onInit: { (props: TestConnectionModalClass): void }
}

interface StateType {
    show: boolean;
    connection_status: 'disconnected' | 'connecting' | 'connected' | 'error';
    messages: string[];
    socket: Socket | null;
    message_input: string;
    test_connection_data: TestConnectionType
    token: string
    message_listen_name: string
    emit_status: "pending" | "done"
}

export class TestConnectionModalClass extends BaseStateClass<StateType, PropType> {

    async getTestConnection() {
        try {
            let resData = await TestConnectionService.getById(this.state.test_connection_data.id || 0)
            return resData
        } catch (error) {
            console.error("getTestConnection - err :: ", error)
        }
    }

    setTestConnection(props: any) {
        if (props == null) return
        let data = props.data
        this.setState({
            test_connection_data: data
        })
    }

    async authChannel() {
        try {
            this.setState({
                connection_status: "connecting"
            })
            let test_connection_data = this.state.test_connection_data
            let resData = await ChannelService.auth({
                app_id: test_connection_data.workspace?.app_id,
                channel_name: test_connection_data.channel_name,
                expires_in_seconds: test_connection_data.expires_in_seconds,
                app_key: test_connection_data.app_key
            })
            this.setState({
                token: resData.token,
                message_listen_name: resData.message_listen_name
            })
            setTimeout(() => {
                this.connectSocket()
            }, 1000);
        } catch (error) {
            console.error("authChannel - err :: ", error)
            this.setState({
                connection_status: "error"
            })
        }
    }

    connectSocket() {
        if (!this.state.test_connection_data) return;

        const socket = io(BASE_API_URL, {
            path: "/ws"
        });

        socket.on('connect', () => {
            this.setState({ connection_status: 'connected', socket });
            this.addMessage('Connected to Socket.IO server');
            socket.emit('join_channel', {
                channel_name: this.state.test_connection_data!.channel_name,
                token: this.state.token
            });
        });

        socket.on(this.state.message_listen_name, (msg: string) => {
            console.log("bbb :: " + this.state.test_connection_data.channel_name + " :: ", msg)
            this.addMessage(`Received: ${msg}`);
        });

        socket.on('connect_error', (err) => {
            this.setState({ connection_status: 'error' });
            this.addMessage(`Connection error: ${err.message}`);
        });

        socket.on('joined', (msg) => {
            this.addMessage(JSON.stringify(msg));
        });

        socket.on('disconnect', () => {
            this.setState({ connection_status: 'disconnected' });
            this.addMessage('Disconnected from server');
        });
    }

    disconnectSocket() {
        if (this.state.socket) {
            this.state.socket.disconnect();
            this.setState({ socket: undefined, connection_status: 'disconnected' });
        }
    }

    addMessage(messageProps: string) {
        let messages = this.state.messages || [];
        messages.push(messageProps)
        this.setState({
            messages
        });
    }

    handleChange(action: string, props?: any, e?: any) {
        if (action === 'MESSAGE_INPUT') {
            this.setState({ message_input: e.target.value });
        }
    }

    handleClick(action: string, props?: any, e?: any) {
        if (action == 'AUTH') {
            this.authChannel()
        }
        if (action === 'SEND_MESSAGE') {
            this.emit()
        }
        if (action === 'CLOSE') {
            this.close();
        }
    }

    async emit() {
        this.setState({
            emit_status: "pending"
        })
        try {
            let test_connection_data = this.state.test_connection_data
            let resData = await MessageService.emit({
                app_id: test_connection_data.workspace?.app_id,
                body: this.state.message_input,
                channel_name: test_connection_data.channel_name
            })

        } catch (error) {
            console.error("emit - err :: ", error)
        } finally {
            this.setState({
                emit_status: "done"
            })
        }
    }

    show(test_id: number) {
        this.setState({
            test_connection_data: {
                id: test_id
            },
            show: true, messages: [],
        });
        setTimeout(async () => {
            this.setTestConnection(await this.getTestConnection())
        }, 100);

    }

    close() {
        this.disconnectSocket();
        this.setState({ show: false });
        if (this.props.onCloseListener) {
            this.props.onCloseListener();
        }
    }

    render() {
        const { show, connection_status,message_listen_name, messages, message_input, test_connection_data } = this.state;

        return (
            <Modal show={show} onHide={this.handleClick.bind(this, 'CLOSE')}>
                <Modal.Header closeButton>
                    <Modal.Title>Test Connection: {test_connection_data?.channel_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Button variant="secondary" onClick={this.handleClick.bind(this, 'AUTH')}>
                        Auth
                    </Button>
                    {Object.keys(test_connection_data).length > 0 && (
                        <>
                            <br />
                            <span><strong>Workspace:</strong> {test_connection_data.workspace?.name || 'N/A'}</span><br />
                            <span><strong>Event:</strong> {test_connection_data.channel_name}</span><br />
                            <span><strong>Workspace ID:</strong> {test_connection_data.workspace_id}</span><br />
                            <span><strong>Expires At:</strong> {test_connection_data.expires_in_seconds || 'N/A'}</span><br />
                            <span><strong>Connection Status:</strong> {connection_status}</span><br />
                            <span><strong>Message Listen Name:</strong> {message_listen_name}</span>
                            <div className="mb-3">
                                <h6>Messages:</h6>
                                <div
                                    style={{
                                        maxHeight: '150px',
                                        overflowY: 'auto',
                                        border: '1px solid #ccc',
                                        padding: '10px',
                                        borderRadius: '5px',
                                    }}
                                >
                                    {messages.length ? (
                                        messages.map((msg, idx) => <p key={idx}>{msg}</p>)
                                    ) : (
                                        <p>No messages yet.</p>
                                    )}
                                </div>
                            </div>
                            <Form.Group className="mb-3">
                                <Form.Label>Send Test Message:</Form.Label>
                                <Form.Control
                                    type="text"
                                    className='mb-3'
                                    value={message_input}
                                    onChange={this.handleChange.bind(this, 'MESSAGE_INPUT', {})}
                                    placeholder="Enter a message"
                                    disabled={connection_status !== 'connected'}
                                />
                                <ButtonLoading
                                    text='Send'
                                    http_status={this.state.emit_status}
                                    onClick={this.handleClick.bind(this, 'SEND_MESSAGE', {})}>
                                    Loading...
                                </ButtonLoading>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={this.handleClick.bind(this, 'SEND_MESSAGE')}
                        disabled={connection_status !== 'connected'}
                    >
                        Send Message
                    </Button>
                    <Button variant="secondary" onClick={this.handleClick.bind(this, 'CLOSE')}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default function TestConnectionModal(props: PropType) {
    const methods = useMemo(() => new TestConnectionModalClass(), []);
    useEffect(() => {
        props.onInit(methods);
    }, [])
    methods.defineState(useState<StateType>({
        connection_status: "disconnected",
        message_input: "",
        messages: [],
        show: false,
        socket: null,
        test_connection_data: {},
        token: "",
        message_listen_name: "",
        emit_status: "done"
    }), props);
    return methods.render();
}