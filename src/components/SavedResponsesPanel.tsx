import React, { useState } from 'react';
import { List, Button, message, Modal, Typography, Space } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { allExpanded, JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import type { SavedResponse } from '../types/request.types';

const { Text } = Typography;

interface SavedResponsesPanelProps {
  savedResponses: SavedResponse[];
  onSaveResponse: (name: string, content: string) => Promise<void>;
  onDeleteResponse: (responseId: string) => Promise<void>;
}

const SavedResponsesPanel: React.FC<SavedResponsesPanelProps> = ({
  savedResponses,
  onSaveResponse,
  onDeleteResponse,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<SavedResponse | null>(null);
  const [isJsonView, setIsJsonView] = useState(true);

  const handleDeleteResponse = async (responseId: string) => {
    try {
      await onDeleteResponse(responseId);
      message.success('Response deleted successfully');
    } catch (error) {
      message.error('Failed to delete response');
    }
  };

  const handleViewResponse = (response: SavedResponse) => {
    setSelectedResponse(response);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedResponse(null);
  };

  const renderResponseContent = (content: string) => {
    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(content);
      return isJsonView ? (
        <JsonView data={jsonData} shouldExpandNode={allExpanded} style={defaultStyles} />
      ) : (
        <textarea
          rows={20}
          style={{ width: '100%', maxHeight: '100%', resize: 'none', border: 'none', background: '#aba8a82b', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}
          value={JSON.stringify(jsonData, null, 2)}
          readOnly
        />
      );
    } catch (e) {
      // If not valid JSON, display as text
      return (
        <textarea
          rows={20}
          style={{ width: '100%', maxHeight: '100%', resize: 'none', border: 'none', background: '#aba8a82b', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}
          value={content}
          readOnly
        />
      );
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h3>Saved Responses</h3>
      </div>

      {savedResponses.length === 0 ? (
        <p>No saved responses yet</p>
      ) : (
        <List
          bordered
          dataSource={savedResponses}
          renderItem={(response) => (
            <List.Item
              actions={[
                <Button
                  key="view"
                  type="primary"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewResponse(response)}
                >
                  View
                </Button>,
                <Button
                  key="delete"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteResponse(response.id)}
                >
                  Delete
                </Button>
              ]}
            >
              <List.Item.Meta
                title={response.name}
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary">
                      Saved: {new Date(response.timestamp).toLocaleString()}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Modal
        title={selectedResponse?.name}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button
            key="toggle-view"
            type={isJsonView ? "primary" : "default"}
            onClick={() => setIsJsonView(!isJsonView)}
          >
            {isJsonView ? 'Text View' : 'JSON View'}
          </Button>,
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {selectedResponse && (
          <div>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
              Saved: {new Date(selectedResponse.timestamp).toLocaleString()}
            </div>
            <div style={{ padding: '8px', maxHeight: '500px', overflowY: 'auto' }}>
              {renderResponseContent(selectedResponse.content)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SavedResponsesPanel;