import React, { useState } from 'react';
import { Form, Input, Select, Button, Space, Tabs, Empty } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { type WebRsRequest } from '../types/request.types';
import SaveToCollectionModal from './collections/SaveToCollectionModal';
import EditRequestModal from './EditRequestModal';
import { useCollectionContext } from '../context/CollectionProvider';
import { useRequestContext } from '../context/RequestProvider';

const { TextArea } = Input;
const { TabPane } = Tabs;

interface RequestFormProps {
  request: WebRsRequest;
  collectionId?: string;
  index: number;
  tabs: WebRsRequest[];
  setTabs: (requests: WebRsRequest[]) => void;
  onSendRequest: (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body: any,
    headers: Record<string, string>,
    params: Record<string, string>
  ) => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ request, index, tabs, setTabs, onSendRequest, collectionId }) => {
  const { saveRequestToCollection, addRequestToFolder } = useCollectionContext();
   const {
      setSelectedRequestId,
      setDirtyRequests,
        dirtyRequests

      
    } = useRequestContext();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);

  const isDirty = dirtyRequests.includes(request.id) ;

  // Find the correct index of the request in the tabs array
  const getRequestIndex = () => {
    return tabs.findIndex(tab => tab.id === request.id);
  };

  const updateTabsAndFocus = (updatedTabs: WebRsRequest[], updatedRequestId: string) => {
    setTabs(updatedTabs);
    setSelectedRequestId && setSelectedRequestId(updatedRequestId);
    setDirtyRequests((prev) => {
        const newDirtyRequests = [...prev];
        if (!newDirtyRequests.includes(updatedRequestId)) {
            newDirtyRequests.push(updatedRequestId);
        }
        return newDirtyRequests;
    });

  };

  const handleEditSave = (name: string, description: string) => {
    const requestIndex = getRequestIndex();
    const updatedRequest = { ...tabs[requestIndex], name, description };
    const newTabs = [...tabs];
    newTabs[requestIndex] = updatedRequest;
    updateTabsAndFocus(newTabs, updatedRequest.id.toString());
    setIsEditModalVisible(false);
  };

  const handleSaveRequest = async (collectionId: string, folderId?: string) => {
    if (folderId) {
      // Save to folder
      await addRequestToFolder(collectionId, folderId, request);
    } else {
      // Save to collection root
      await saveRequestToCollection(collectionId, request);
    }
    setDirtyRequests((prev) => prev.filter((id) => id !== request.id));
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Name">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>

          <span>{request.name}</span>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => setIsEditModalVisible(true)}
            />
            </div>
            <div className="request__actions">
                 <Form.Item>
        <Button
          type={isDirty ? "primary" : "default"}
          onClick={() => setIsSaveModalVisible(true)}
        >
          Save to Collection
        </Button>
      </Form.Item>
            </div>
        </div>
      </Form.Item>
      <EditRequestModal
        visible={isEditModalVisible}
        request={request}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleEditSave}
      />

      <Form.Item label="URL & Method">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Select
            value={request.method}
            onChange={(value) => {
              const requestIndex = getRequestIndex();
              const newTabs = [...tabs];
              newTabs[requestIndex].method = value;
              updateTabsAndFocus(newTabs, request.id.toString());
            }}
            style={{ flex: 1 }}
          >
            <Select.Option value="GET">GET</Select.Option>
            <Select.Option value="POST">POST</Select.Option>
            <Select.Option value="PUT">PUT</Select.Option>
            <Select.Option value="DELETE">DELETE</Select.Option>
          </Select>
          <Input
            value={request.url}
            onChange={(e) => {
              const requestIndex = getRequestIndex();
              const newTabs = [...tabs];
              newTabs[requestIndex].url = e.target.value;
              updateTabsAndFocus(newTabs, request.id.toString())
            }}
            placeholder="Enter request URL"
            style={{ flex: 8 }}
          />
          
        </div>
      </Form.Item>

      <Form.Item>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Headers" key="1">
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #d9d9d9', padding: '8px', borderRadius: '4px' }}>
              {request.headers.length > 0 ? (
                request.headers.map((header, headerIndex) => (
                  <Space key={headerIndex} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Input
                      placeholder="Key"
                      value={header.key}
                      onChange={(e) => {
                        const requestIndex = getRequestIndex();
                        const newTabs = [...tabs];
                        newTabs[requestIndex].headers[headerIndex].key = e.target.value;
                        updateTabsAndFocus(newTabs, request.id.toString())
                      }}
                    />
                    <Input
                      placeholder="Value"
                      value={header.value}
                      onChange={(e) => {
                        const requestIndex = getRequestIndex();
                        const newTabs = [...tabs];
                        newTabs[requestIndex].headers[headerIndex].value = e.target.value;
                        updateTabsAndFocus(newTabs, request.id.toString())
                      }}
                    />
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        const requestIndex = getRequestIndex();
                        const newTabs = [...tabs];
                        newTabs[requestIndex].headers.splice(headerIndex, 1);
                        updateTabsAndFocus(newTabs, request.id.toString())
                      }}
                    />
                  </Space>
                ))
              ) : (
                <Empty description="No headers added" />
              )}
            </div>
            <Button
              onClick={() => {
                const requestIndex = getRequestIndex();
                const newTabs = [...tabs];
                newTabs[requestIndex].headers.push({ key: '', value: '' });
                updateTabsAndFocus(newTabs, request.id.toString())
              }}
            >
              Add Header
            </Button>
          </TabPane>
          <TabPane tab="Query Parameters" key="2">
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #d9d9d9', padding: '8px', borderRadius: '4px' }}>
              {request.queryParams.length > 0 ? (
                request.queryParams.map((param, paramIndex) => (
                  <Space key={paramIndex} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Input
                      placeholder="Key"
                      value={param.key}
                      onChange={(e) => {
                        const requestIndex = getRequestIndex();
                        const newTabs = [...tabs];
                        newTabs[requestIndex].queryParams[paramIndex].key = e.target.value;
                        updateTabsAndFocus(newTabs, request.id.toString())
                      }}
                    />
                    <Input
                      placeholder="Value"
                      value={param.value}
                      onChange={(e) => {
                        const requestIndex = getRequestIndex();
                        const newTabs = [...tabs];
                        newTabs[requestIndex].queryParams[paramIndex].value = e.target.value;
                        updateTabsAndFocus(newTabs, request.id.toString())
                      }}
                    />
                  </Space>
                ))
              ) : (
                <Empty description="No query parameters added" />
              )}
            </div>
            <Button
              onClick={() => {
                const requestIndex = getRequestIndex();
                const newTabs = [...tabs];
                newTabs[requestIndex].queryParams.push({ key: '', value: '' });
                updateTabsAndFocus(newTabs, request.id.toString())
              }}
            >
              Add Query Parameter
            </Button>
          </TabPane>
          <TabPane tab="Body" key="3">
            <TextArea
              rows={4}
              value={request.body}
              onChange={(e) => {
                const requestIndex = getRequestIndex();
                const newTabs = [...tabs];
                newTabs[requestIndex].body = e.target.value;
                updateTabsAndFocus(newTabs, request.id.toString())
              }}
              placeholder="Enter request body (JSON format)"
            />
          </TabPane>
        </Tabs>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          onClick={() => {
            const formattedHeaders = request.headers.reduce((acc, header) => {
              if (header.key) acc[header.key] = header.value;
              return acc;
            }, {} as Record<string, string>);

            const formattedParams = request.queryParams.reduce((acc, param) => {
              if (param.key) acc[param.key] = param.value;
              return acc;
            }, {} as Record<string, string>);

            onSendRequest(request.method, request.url, request.body, formattedHeaders, formattedParams);
          }}
        >
          Send Request
        </Button>
      </Form.Item>

     

      <SaveToCollectionModal
        collectionId={collectionId}
        visible={isSaveModalVisible}
        onClose={() => setIsSaveModalVisible(false)}
        onSave={handleSaveRequest}
        request={request}
      />
    </Form>
  );
};

export default RequestForm;
