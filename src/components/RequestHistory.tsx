import React from 'react';
import { List, Button, Typography, Avatar, Tooltip } from 'antd';
import { useRequestHistoryContext } from '../context/RequestHistoryProvider';
import type { WebRsRequest } from '../types/request.types';
import RelativeTimestamp from './RelativeTimestamp';

const { Text } = Typography;

const getAvatarStyle = (method: string) => {
  switch (method) {
    case 'POST':
      return { backgroundColor: '#5f88e2ff', color: '#fff' }; // Green for POST
    case 'PUT':
      return { backgroundColor: '#dfa11bff', color: '#fff' }; // Orange for PUT
    case 'DELETE' :
      return { backgroundColor: '#d31913ff', color: '#fff' }; // Red for DELETE
    default:
      return { backgroundColor: '#4ecf75ff', color: '#fff' }; // Default Blue
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  onClick={() => onSelectRequest(history.request)}
                  style={{
                    textAlign: 'left',
                    padding: '0',
                    flex: 1,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Text ellipsis>{history.request.url}</Text>
                </div>
                <RelativeTimestamp history={history} />
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default RequestHistory;
