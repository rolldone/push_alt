import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Row, Dropdown } from 'react-bootstrap';
import BaseStateClass from '../components/helper/BaseStateClass';
import TestConnectionService, { TestConnectionType } from '../services/TestConnectionService';
import { SuperAgentRequest } from 'superagent';
import TestConnectionNew, { TestConnectionNewClass } from './TestConnectionNew';
import TestConnectionUpdate, { TestConnectionUpdateClass } from './TestConnectionUpdate';
import TestConnectionModal, { TestConnectionModalClass } from './TestConnectionModal';

interface PropType { }

interface StateType {
  test_connection_datas: TestConnectionType[];
  select_test_connection: TestConnectionType | null;
  http_request: 'pending' | 'done';
  section: 'new' | 'update' | 'close';
}

export class TestConnectionListClass extends BaseStateClass<StateType, PropType> {
  async mounted() {
    this.setTestConnections(await this.getTestConnections());
  }

  declare testConnectionNew: TestConnectionNewClass;
  declare testConnectionUpdate: TestConnectionUpdateClass;
  declare testConnectionsRequest: SuperAgentRequest;
  declare testConnectionModal: TestConnectionModalClass;

  async getTestConnections() {
    try {
      const resData = await TestConnectionService.gets({}, (request) => {
        if (this.testConnectionsRequest != null) {
          this.testConnectionsRequest.abort();
        }
        this.testConnectionsRequest = request;
        this.setState({ http_request: 'pending' });
      });
      return resData;
    } catch (error) {
      console.error('getTestConnections - err:', error);
    } finally {
      this.setState({ http_request: 'done' });
    }
  }

  setTestConnections(props: any) {
    if (!props) return;
    const data = props.data;
    this.setState({ test_connection_datas: data });
  }

  handleClick(action: string, props?: any, e?: any) {
    if (action === 'ITEM_CLICK') {
      this.testConnectionUpdate.setState({
        form_data: { id: props.id },
      });
      this.testConnectionUpdate.show();
    }
    if (action === 'NEW') {
      this.testConnectionNew.show();
      return;
    }
    if (action === 'TEST') {
      console.log('Test:', props.id);
      this.testConnectionModal.show(props.id);
    }
    if (action === 'DELETE') {
      console.log('Delete:', props.id);
      this.deleteData(props.id)

    }
  }

  async deleteData(id: number) {
    try {
      let resData = await TestConnectionService.deletes([id])
      alert("Test Connection is deleted")
      this.mounted()
    } catch (error) {
      console.error("deleteData - err ", error)
    }
  }

  handleListener(action: string, props?: any) {
    if (action === 'TEST_CONNECTION_NEW_LISTENER' || action === 'TEST_CONNECTION_UPDATE_LISTENER') {
      this.mounted();
    }
  }

  render() {
    const { test_connection_datas, select_test_connection, section } = this.state;

    return (
      <div>
        <Row className="mb-4 align-items-center">
          <Col>
            <h2>Test Connections</h2>
          </Col>
          <Col className="text-end">
            <Button variant="primary" onClick={this.handleClick.bind(this, 'NEW', {})}>
              New Testing
            </Button>
          </Col>
        </Row>
        <Row xs={1} md={2} lg={3} className="g-4">
          {test_connection_datas?.map((testConnection) => (
            <Col key={testConnection.id}>
              <Card>
                <Card.Body className="position-relative">
                  <Dropdown className="position-absolute top-0 end-0 mt-2 me-2">
                    <Dropdown.Toggle variant="secondary" id={`dropdown-${testConnection.id}`}>
                      Actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={this.handleClick.bind(this, 'TEST', { id: testConnection.id })}>
                        Test
                      </Dropdown.Item>
                      <Dropdown.Item onClick={this.handleClick.bind(this, 'ITEM_CLICK', { id: testConnection.id })}>
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item onClick={this.handleClick.bind(this, 'DELETE', { id: testConnection.id })}>
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Card.Title>
                    {testConnection.workspace?.name} - {testConnection.channel_name}
                  </Card.Title>
                  <Card.Text>
                    <span>ID: {testConnection.id}</span><br />
                    <span>Workspace ID: {testConnection.workspace_id}</span><br />
                    <span>Event Name: {testConnection.channel_name}</span><br />
                    <span>Expires In Seconds: {testConnection.expires_in_seconds || 'N/A'}</span>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <TestConnectionNew
          onCloseListener={this.handleListener.bind(this, 'TEST_CONNECTION_NEW_LISTENER')}
          onInit={(props) => (this.testConnectionNew = props)}
        />
        <TestConnectionUpdate
          onCloseListener={this.handleListener.bind(this, 'TEST_CONNECTION_UPDATE_LISTENER')}
          onInit={(props) => {
            // @ts-ignore
            this.testConnectionUpdate = props;
          }}
        />
        <TestConnectionModal
          onInit={(props) => (this.testConnectionModal = props)}
          onCloseListener={this.handleListener.bind(this, "TEST_CONNECTION_MODAL")}></TestConnectionModal>
      </div>
    );
  }
}

export default function TestConnectionList(props: PropType) {
  const methods = useMemo(() => new TestConnectionListClass(), []);
  methods.defineState(
    useState<StateType>({
      test_connection_datas: [],
      http_request: 'done',
      select_test_connection: null,
      section: 'close',
    }),
    props
  );
  useEffect(() => {
    methods.mounted();
  }, []);
  return methods.render();
}