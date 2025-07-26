import React from 'react';
import { List, Button, Typography, Avatar, Tooltip } from 'antd';
import { useRequestHistoryContext } from '../context/RequestHistoryProvider';
import type { WebRsRequest } from '../types/request.types';

const { Text } = Typography;

const getAvatarStyle = (method: string) => {
  switch (method) {
    case 'POST':
      return { backgroundColor: '#3f51b5', color: '#fff' }; // Green for POST
    case 'PUT':
      return { backgroundColor: '#ff9800', color: '#fff' }; // Orange for PUT
    default:
      return { backgroundColor: '#1890ff', color: '#fff' }; // Default Blue
  }
};

const getAvatarText = (method: string) => {
  switch (method) {
    case 'POST':
      return 'P';
    case 'PUT':
      return 'PU';
    default:
      return method[0];
  }
};

const RequestHistory: React.FC<{ onSelectRequest: (request: WebRsRequest) => void }> = ({ onSelectRequest }) => {
  const { requestHistory } = useRequestHistoryContext(); // Fetch request history from the provider

  return (
    <List
      dataSource={requestHistory} // Use requestHistory instead of mockRequests
      renderItem={(history) => (
        <List.Item style={{ padding: '8px 0' }}>
          <List.Item.Meta
            avatar={
              <Tooltip title={history.request.method}>
                <Avatar
                  style={getAvatarStyle(history.request.method)}
                >
                  {getAvatarText(history.request.method)}
                </Avatar>
              </Tooltip>
            }
            title={
              <Button
                type="text"
                block
                onClick={() => onSelectRequest(history.request)}
                style={{ textAlign: 'left', padding: '0' }}
              >
                <Text ellipsis>{history.request.url}</Text>
              </Button>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default RequestHistory;
