import { useEffect, useMemo, useState } from 'react';
import { Table, Container } from 'react-bootstrap';
import ChannelService, { ChannelType } from '../services/ChannelService';
import BaseStateClass from '../components/helper/BaseStateClass';

interface PropType { }

interface StateType {
    channels: ChannelType[];
    loading: boolean;
    error?: string;
    currentPage: number; // Current page for pagination
    hasMore: boolean;    // New state for checking if there are more pages
}

export class ChannelListClass extends BaseStateClass<StateType, PropType> {
    
    componentDidMount() {
        this.fetchChannels();
    }

    async fetchChannels(page: number = 1) {
        this.setState({ loading: true, error: undefined });
        try {
            const response = await ChannelService.gets({ page, take: 10 }); // Assuming 10 items per page
            const { success, data, message } = response;
            if (!success) throw new Error(message || 'Failed to fetch channels');
            
            // If the returned data length is less than the `take` value, it means there are no more pages
            const hasMore = data.length === 10;

            this.setState({ 
                channels: data, 
                loading: false, 
                currentPage: page, 
                hasMore 
            });
        } catch (err: any) {
            this.setState({ 
                error: err.message || 'Error fetching channels', 
                loading: false 
            });
        }
    }

    renderPagination() {
        const { currentPage, channels } = this.state;

        return (
            <div className="d-flex justify-content-center mt-3">
                <button
                    className="btn btn-primary me-2"
                    onClick={() => this.fetchChannels(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span className="align-self-center">
                    Page {currentPage}
                </span>
                <button
                    className="btn btn-primary ms-2"
                    onClick={() => this.fetchChannels(currentPage + 1)}
                    disabled={channels.length < 10} // Disable if less than 10 items are returned
                >
                    Next
                </button>
            </div>
        );
    }

    render() {
        const { channels, loading, error } = this.state;

        return (
            <Container>
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
                {this.renderPagination()}
            </Container>
        );
    }
}

export default function ChannelList(props: PropType) {
    const methods = useMemo(() => new ChannelListClass(), []);
    methods.defineState(useState<StateType>({
        channels: [],
        loading: false,
        currentPage: 1,
        hasMore: true
    }), props);
    useEffect(() => {
        methods.componentDidMount()
    }, [])
    return methods.render();
}