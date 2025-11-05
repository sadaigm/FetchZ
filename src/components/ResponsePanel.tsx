import React, { useState } from 'react';
import { Card, Switch, Button, message, Modal, Input, Space, List, Typography, Divider, Tooltip } from 'antd';
import { SaveOutlined, CopyOutlined, MenuOutlined } from '@ant-design/icons';
import CurrentResponse from './CurrentResponse';
import SavedResponsesPanel from './SavedResponsesPanel';
import { deleteSavedResponse } from '../services/database/stores/collections';
import type { SavedResponse } from '../types/request.types';
import type { TestScriptResult } from '../services/testScriptExecutor';

const { Text } = Typography;

interface ResponsePanelProps {
  response: any;
  requestId?: string;
  collectionId?: string;
  folderId?: string;
  savedResponses?: SavedResponse[];
  saveRequestWithResponse: (name : string, content:string) => void;
  handleDeleteResponse: (responseId: string) => void;
  testResults?: TestScriptResult | null;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({
  response,
  requestId,
  collectionId,
  savedResponses = [],
  saveRequestWithResponse,
  handleDeleteResponse: handleDeleteResponseCallBack,
  testResults
}) => {
  const [isJsonView, setIsJsonView] = useState(true);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [responseName, setResponseName] = useState('');
  const [isSavedResponsesModalVisible, setIsSavedResponsesModalVisible] = useState(false);
  const [selectedSavedResponse, setSelectedSavedResponse] = useState<SavedResponse | null>(null);

  const handleSaveResponse = async (name: string, content: string) => {
    if (!requestId || !collectionId) {
      message.error('Request ID or Collection ID is missing');
      return;
    }

    try {
      await saveRequestWithResponse(name, content);
      message.success('Response saved successfully');
    } catch (error) {
      message.error('Failed to save response');
      console.error('Error saving response:', error);
    }
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (!requestId || !collectionId) {
      message.error('Request ID or Collection ID is missing');
      return;
    }

    try {
      await deleteSavedResponse(collectionId, requestId, responseId);
      handleDeleteResponseCallBack(responseId);
      message.success('Response deleted successfully');
    } catch (error) {
      message.error('Failed to delete response');
      console.error('Error deleting response:', error);
    }
  };

  const copyToClipboard = () => {
    const bodyData = JSON.stringify(response.data, null, 2);
    navigator.clipboard.writeText(bodyData)
      .then(() => {
        message.success('Response data copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy response data: ', err);
        message.error('Failed to copy response data');
      });
  };

  const handleSavedResponseClick = (savedResponse: SavedResponse) => {
    setSelectedSavedResponse(savedResponse);
  };

  const handleBackToList = () => {
    setSelectedSavedResponse(null);
  };

  const handleSaveCurrentResponse = () => {
    if (!response) {
      message.error('No response to save');
      return;
    }

    setResponseName('');
    setIsSaveModalVisible(true);
  };

  const handleModalOk = () => {
    if (!responseName.trim()) {
      message.error('Please enter a name for the response');
      return;
    }

    const responseContent = response.error
      ? JSON.stringify({ error: response.error }, null, 2)
      : JSON.stringify(response.data, null, 2);

    handleSaveResponse(responseName, responseContent);
    setIsSaveModalVisible(false);
    setResponseName('');
  };

  const handleModalCancel = () => {
    setIsSaveModalVisible(false);
    setResponseName('');
  };

  return (
    <>
      <Card
        title="Response Details"
        style={{ marginTop: '16px' }}
        extra={[
          <Space>
            <Switch
              key="view-switch"
              checked={isJsonView}
              onChange={() => setIsJsonView(!isJsonView)}
              checkedChildren="JSON View"
              unCheckedChildren="Text View"
            />
            <Tooltip title="Copy Response" key="copy-tooltip">
              <Button
                icon={<CopyOutlined />}
                onClick={copyToClipboard}
                disabled={!response || response.status !== 200 || !response.data}
              />
            </Tooltip>
            <Tooltip title="Save Response" key="save-tooltip">
              <Button
                icon={<SaveOutlined />}
                onClick={handleSaveCurrentResponse}
                disabled={!requestId || !collectionId || !response || response.error}
              />
            </Tooltip>
            <Tooltip title="Saved Responses" key="saved-tooltip">
              <Button
                icon={<MenuOutlined />}
                onClick={() => setIsSavedResponsesModalVisible(true)}
              />
            </Tooltip>
          </Space>
        ]}
      >
        <CurrentResponse
          response={response}
          isJsonView={isJsonView}
          testResults={testResults}
        />
      </Card>
      
      <Modal
        title="Save Response"
        open={isSaveModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Save"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="response-name" style={{ display: 'block', marginBottom: '8px' }}>
            Response Name:
          </label>
          <Input
            id="response-name"
            value={responseName}
            onChange={(e) => setResponseName(e.target.value)}
            placeholder="Enter a name for this response"
            onPressEnter={handleModalOk}
          />
        </div>
      </Modal>

      <Modal
        title={selectedSavedResponse ? "Saved Response Details" : "Saved Responses"}
        open={isSavedResponsesModalVisible}
        onCancel={() => {
          setIsSavedResponsesModalVisible(false);
          setSelectedSavedResponse(null);
        }}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        {selectedSavedResponse ? (
          <div>
            <Button
              onClick={handleBackToList}
              style={{ marginBottom: '16px' }}
            >
              ← Back to List
            </Button>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Name: </Text>
              <Text>{selectedSavedResponse.name}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Created: </Text>
              <Text>{new Date(selectedSavedResponse.timestamp).toLocaleString()}</Text>
            </div>
            <Divider />
            <div style={{ height: '400px', overflow: 'auto' }}>
              <pre style={{
                background: '#f5f5f5',
                padding: '12px',
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {JSON.stringify(JSON.parse(selectedSavedResponse.content), null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div>
            {savedResponses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">No saved responses yet</Text>
              </div>
            ) : (
              <List
                dataSource={savedResponses}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => handleSavedResponseClick(item)}
                    style={{ cursor: 'pointer', padding: '12px' }}
                    actions={[
                      <Button
                        key="delete"
                        type="text"
                        danger
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResponse(item.id);
                        }}
                      >
                        Delete
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={`Created: ${new Date(item.timestamp).toLocaleString()}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default ResponsePanel;
