import { useMemo } from 'react';
import TestConnectionNew, { PropType, TestConnectionNewClass } from './TestConnectionNew';
import TestConnectionService from '../services/TestConnectionService';

export class TestConnectionUpdateClass extends TestConnectionNewClass {

  async submit(): Promise<void> {
    this.setState({ http_request: 'pending' });
    const pass = await this.submitValidation();
    if (!pass) {
      this.setState({ http_request: 'done' });
      return;
    }
    try {
      // Call update API (you'll need to create this in TestConnectionService)
      await TestConnectionService.update(this.state.form_data);
      this.props.onCloseListener();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      this.setState({ show: false, http_request: 'done' });
    }
  }

  async getTestConnection() {
    try {
      const resData = await TestConnectionService.getById(this.state.form_data.id || 0);
      return resData;
    } catch (error) {
      console.error('getTestConnection - err:', error);
    }
  }

  setTestConnection(props: any) {
    if (!props) return;
    const data = props.data;
    this.setState({
      form_data: {
        id: data.id,
        workspace_id: data.workspace_id,
        channel_name: data.channel_name,
        expires_in_seconds: data.expires_in_seconds,
        app_key: data.app_key
      },
    });
  }

  async show() {
    try {
      this.setState({ show: true });
      await this.fetchWorkspaces();
      this.setTestConnection(await this.getTestConnection());
      this.mounted();
    } catch (error) {
      console.error('show - err:', error);
    }
  }

}

export default function TestConnectionUpdate(props: PropType) {
  const methods = useMemo(() => new TestConnectionUpdateClass(), []);
  return <TestConnectionNew {...props} extend={methods} />;
}