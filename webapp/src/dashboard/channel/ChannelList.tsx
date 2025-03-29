import { useEffect, useMemo, useState } from 'react';
import { Table, Container } from 'react-bootstrap';
import ChannelService, { ChannelType } from '../services/ChannelService';
import BaseStateClass from '../components/helper/BaseStateClass';

interface PropType { }

interface StateType {
    channels: ChannelType[];
    loading: boolean;
    error?: string;
}

export class ChannelListClass extends BaseStateClass<StateType, PropType> {
    constructor() {
        super();
        this.state = {
            channels: [],
            loading: false,
            error: undefined,
        };
    }

    componentDidMount() {
        this.fetchChannels();
    }

    async fetchChannels() {
        this.setState({ loading: true, error: undefined });
        try {
            const response = await ChannelService.gets({});
            const { success, data, message } = response;
            if (!success) throw new Error(message || 'Failed to fetch channels');
            this.setState({ channels: data, loading: false });
        } catch (err: any) {
            this.setState({ error: err.message || 'Error fetching channels', loading: false });
        }
    }

    render() {
        const { channels, loading, error } = this.state;

        return (
            <Container className="mt-4">
                <h2>Channels</h2>
                {loading && <p>Loading...</p>}
                {error && <p className="text-danger">{error}</p>}
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Channel Name</th>
                            <th>Workspace</th>
                            <th>Token</th>
                            <th>Created At</th>
                            <th>Expires At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {channels.length ? (
                            channels.map((channel) => (
                                <tr key={channel.id}>
                                    <td>{channel.id}</td>
                                    <td>{channel.channel_name}</td>
                                    <td>{channel.workspace?.name || 'N/A'}</td>
                                    <td>{channel.token}</td>
                                    <td>{channel.created_at ? new Date(channel.created_at).toLocaleString() : 'N/A'}</td>
                                    <td>{channel.expires_at ? new Date(channel.expires_at).toLocaleString() : 'N/A'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center">
                                    No channels found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Container>
        );
    }
}

export default function ChannelList(props: PropType) {
    const methods = useMemo(() => new ChannelListClass(), []);
    methods.defineState(useState<StateType>({
        channels: [],
        loading: false,
    }), props);
    useEffect(()=>{
        methods.componentDidMount()
    },[])
    return methods.render();
}