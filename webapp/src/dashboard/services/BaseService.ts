import request, { SuperAgentRequest } from 'superagent';

const BASE_API_URL = import.meta.env.VITE_PUBLIC_MASTER_DATA_API || '';
// Define your middleware function
const myMiddleware = (request: SuperAgentRequest) => {
    console.log('Request is being made to:', request.url);
    // You can also modify the request, add query params, etc.
    request.set('Authorization', 'Bearer ' + window.localStorage.getItem("token") || "");
    return request;
};

const superagent = request.agent()

superagent.use(myMiddleware);

export default {
    superagent,
    URL: {
        'workspaces.add': BASE_API_URL + '/api/workspaces',
        'workspaces.update': BASE_API_URL + '/api/workspaces/:id',
        'workspaces.view': BASE_API_URL + '/api/workspaces/:id',
        'workspaces.workspaces': BASE_API_URL + '/api/workspaces',
        'workspaces.delete': BASE_API_URL + '/api/workspaces',

        'test_connection.add': BASE_API_URL + '/api/test-connection',
        'test_connection.update': BASE_API_URL + '/api/test-connection/:id',
        'test_connection.view': BASE_API_URL + '/api/test-connection/:id',
        'test_connection.test_connections': BASE_API_URL + '/api/test-connection/test-connections',
        'test_connection.delete': BASE_API_URL + '/api/test-connection/delete',

        'channel.auth': BASE_API_URL + '/api/channel/auth',
        'channel.channels': BASE_API_URL + '/api/channel/channels',
        'channel.channel': BASE_API_URL + '/api/channel/:id',

        'message.emit': BASE_API_URL + '/api/message/emit',

        // Setting
        'setting.add_or_update': BASE_API_URL + '/api/setting/add_or_update',
        'setting.update_form_setting': BASE_API_URL + '/api/setting/update_form_setting',
        'setting.view': BASE_API_URL + '/api/setting/{name}/view',
        'setting.settings': BASE_API_URL + '/api/setting/settings',
        'setting.gets_form_setting': BASE_API_URL + '/api/setting/gets_form_setting',
        'setting.last_installed': BASE_API_URL + '/api/setting/last_installed',

        // Auth
        'auth.profile': BASE_API_URL + '/api/auth/profile',
        'auth.profile.update': BASE_API_URL + '/api/auth/profile/update',
        'auth.profile.refresh_token': BASE_API_URL + '/api/auth/refresh',

        // Admin
        'admin.add': BASE_API_URL + '/api/admin/add',
        'admin.update': BASE_API_URL + '/api/admin/update',
        'admin.restore': BASE_API_URL + '/api/admin/restore',
        'admin.view': BASE_API_URL + '/api/admin/{id}/view',
        'admin.admins': BASE_API_URL + '/api/admin/admins',
    }
}