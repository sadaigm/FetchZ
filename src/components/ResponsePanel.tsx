import React, { useState } from 'react';
import { Card, Switch, Button, Tabs, message, Modal, Input, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import SavedResponsesPanel from './SavedResponsesPanel';
import CurrentResponse from './CurrentResponse';
import { saveResponseToRequest, deleteSavedResponse } from '../services/database/stores/collections';
import type { SavedResponse } from '../types/request.types';

const { TabPane } = Tabs;

interface ResponsePanelProps {
  response: any;
  requestId?: string;
  collectionId?: string;
  folderId?: string;
  savedResponses?: SavedResponse[];
  saveRequestWithResponse: (name : string, content:string) => void;
  handleDeleteResponse: (responseId: string) => void;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({
  response,
  requestId,
  collectionId,
  savedResponses = [],
  saveRequestWithResponse,
  handleDeleteResponse: handleDeleteResponseCallBack

}) => {
  const [isJsonView, setIsJsonView] = useState(true);
  const [activeTabKey, setActiveTabKey] = useState('current');
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [responseName, setResponseName] = useState('');

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
      : JSON.stringify(response, null, 2);

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
          // add Space
          <Space>
            <Switch
            key="view-switch"
            checked={isJsonView}
            onChange={() => setIsJsonView(!isJsonView)}
            checkedChildren="JSON View"
            unCheckedChildren="Text View"
          />,
          <Button
            key="save-button"
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveCurrentResponse}
            disabled={!requestId || !collectionId || !response || response.error}
          >
            Save Response
          </Button>
          </Space>
        ]}
      >
        <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
          <TabPane tab="Current Response" key="current">
            <CurrentResponse response={response} isJsonView={isJsonView} />
          </TabPane>
          <TabPane tab="Saved Responses" key="saved">
            <SavedResponsesPanel
              savedResponses={savedResponses}
              onSaveResponse={handleSaveResponse}
              onDeleteResponse={handleDeleteResponse}
            />
          </TabPane>
        </Tabs>
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
    </>
  );
};

export default ResponsePanel;
