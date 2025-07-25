import React, { useState, useEffect } from 'react';
import { Tabs, Input, Select, Button, Form, Space } from 'antd';
import { sendRequest } from '../apiClient';
import type { WebRsRequest } from '../types/request.types';
import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { defaultResponseJsonStyle } from '../const';
import ResponsePanel from './ResponsePanel';
import { v4 as uuidv4 } from 'uuid';
import { useRequestContext } from '../context/RequestProvider';

const { TabPane } = Tabs;
const { TextArea } = Input;

interface RequestPanelProps {
  onSendRequest: (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body: any,
    headers: Record<string, string>,
    params: Record<string, string>
  ) => void;
  requests?: WebRsRequest[];
  selectedRequestId?: string;
}

const RequestPanel: React.FC<RequestPanelProps> = ({ onSendRequest }) => {

    const { openedRequests : requests, addRequest, removeRequest,selectedRequestId,  setSelectedRequestId } = useRequestContext();
  const [activeTabKey, setActiveTabKey] = useState<string>(requests[0]?.id?.toString() || '');
  const [tabs, setTabs] = useState<WebRsRequest[]>(requests);

  useEffect(() => {
    setTabs(requests);
    // if (requests.length > 0 && !selectedRequestId) {
    //   setActiveTabKey(requests[0].id?.toString() || '');
    // }
  }, [requests]);

  useEffect(() => {
    if (selectedRequestId) {
        console.log("selectedRequestId", selectedRequestId)
      const matchingRequest = tabs.find((tab) => tab.id?.toString() === selectedRequestId);
      console.log("matchingRequest", {matchingRequest})
      if (matchingRequest) {
        setActiveTabKey(selectedRequestId);
      }
    }
    // else if (requests.length > 0) { setActiveTabKey(requests[0].id?.toString() || '');}
  }, [selectedRequestId, tabs]);

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const handleAddTab = () => {
    const newRequest: WebRsRequest = {
      id: uuidv4(), // Generate a unique ID using uuid
      name: `Request ${tabs.length + 1}`, // Optional name for the request
      url: '',
      method: 'GET',
      headers: [],
      queryParams: [],
      body: '',
    };
    setTabs([...tabs, newRequest]);
    addRequest(newRequest);
   setSelectedRequestId && setSelectedRequestId(newRequest.id.toString());
  };

  const handleRemoveTab = (targetKey: string) => {
    const newTabs = tabs.filter((tab) => tab.id?.toString() !== targetKey);
    setTabs(newTabs);
    removeRequest(targetKey);
    if (newTabs.length > 0) {
     setSelectedRequestId && setSelectedRequestId(newTabs[0].id?.toString() || '');
    }
  };

  return (
    <Tabs
      type="editable-card"
      activeKey={activeTabKey}
      onChange={handleTabChange}
      onEdit={(targetKey, action) => {
        if (action === 'add') handleAddTab();
        if (action === 'remove') handleRemoveTab(targetKey as string);
      }}
    >
      {tabs.map((request, index) => (
        <Tabs.TabPane tab={`Request ${index + 1}`} key={request.id?.toString() || `new-${index}`} closable={tabs.length > 1}>
          <Form layout="vertical">
            <Form.Item label="URL">
              <Input
                value={request.url}
                onChange={(e) => {
                  const newTabs = [...tabs];
                  newTabs[index].url = e.target.value;
                  setTabs(newTabs);
                }}
                placeholder="Enter request URL"
              />
            </Form.Item>

            <Form.Item label="Method">
              <Select
                value={request.method}
                onChange={(value) => {
                  const newTabs = [...tabs];
                  newTabs[index].method = value;
                  setTabs(newTabs);
                }}
              >
                <Select.Option value="GET">GET</Select.Option>
                <Select.Option value="POST">POST</Select.Option>
                <Select.Option value="PUT">PUT</Select.Option>
                <Select.Option value="DELETE">DELETE</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Headers">
              {request.headers.map((header, headerIndex) => (
                <Space key={headerIndex} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Input
                    placeholder="Key"
                    value={header.key}
                    onChange={(e) => {
                      const newTabs = [...tabs];
                      newTabs[index].headers[headerIndex].key = e.target.value;
                      setTabs(newTabs);
                    }}
                  />
                  <Input
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => {
                      const newTabs = [...tabs];
                      newTabs[index].headers[headerIndex].value = e.target.value;
                      setTabs(newTabs);
                    }}
                  />
                </Space>
              ))}
              <Button
                onClick={() => {
                  const newTabs = [...tabs];
                  newTabs[index].headers.push({ key: '', value: '' });
                  setTabs(newTabs);
                }}
              >
                Add Header
              </Button>
            </Form.Item>

            <Form.Item label="Query Parameters">
              {request.queryParams.map((param, paramIndex) => (
                <Space key={paramIndex} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Input
                    placeholder="Key"
                    value={param.key}
                    onChange={(e) => {
                      const newTabs = [...tabs];
                      newTabs[index].queryParams[paramIndex].key = e.target.value;
                      setTabs(newTabs);
                    }}
                  />
                  <Input
                    placeholder="Value"
                    value={param.value}
                    onChange={(e) => {
                      const newTabs = [...tabs];
                      newTabs[index].queryParams[paramIndex].value = e.target.value;
                      setTabs(newTabs);
                    }}
                  />
                </Space>
              ))}
              <Button
                onClick={() => {
                  const newTabs = [...tabs];
                  newTabs[index].queryParams.push({ key: '', value: '' });
                  setTabs(newTabs);
                }}
              >
                Add Query Parameter
              </Button>
            </Form.Item>

            <Form.Item label="Request Body">
              <TextArea
                rows={4}
                value={request.body}
                onChange={(e) => {
                  const newTabs = [...tabs];
                  newTabs[index].body = e.target.value;
                  setTabs(newTabs);
                }}
                placeholder="Enter request body (JSON format)"
              />
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
          </Form>
        </Tabs.TabPane>
      ))}
    </Tabs>
  );
};

export default RequestPanel;
