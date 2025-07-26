import React, { useState } from 'react';
import { Row, Col } from 'antd';
import RequestForm from './RequestForm';
import ResponsePanel from './ResponsePanel';
import { sendRequest } from '../apiClient';
import { useRequestHistoryContext } from '../context/RequestHistoryProvider';
import { v4 as uuidv4 } from 'uuid';
import type { WebRsRequest } from '../types/request.types';

interface NetworkPanelProps {
  request: WebRsRequest;
  index: number;
  tabs: WebRsRequest[];
  setTabs: React.Dispatch<React.SetStateAction<WebRsRequest[]>>;
  collectionId?: string;
}

const NetworkPanel: React.FC<NetworkPanelProps> = ({ request, index, tabs, setTabs, collectionId }) => {
  const [response, setResponse] = useState<any>(null);
  const { addRequestHistory } = useRequestHistoryContext();

  const handleSendRequest = async (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body: any,
    headers: Record<string, string>,
    params: Record<string, string>
  ) => {
    try {
      const res = await sendRequest(method, url, body, headers, params);
      setResponse(res);

      // Add the request and response to the history collection
      const formatHeaders = Object.entries(headers).map(([key, value]) => ({ key, value }));
      const formatQueryParams = Object.entries(params).map(([key, value]) => ({ key, value }));

      const historyEntry = {
        id: uuidv4(),
        request: {
          id: uuidv4(),
          name: `Request to ${url}`,
          method,
          url,
          body,
          headers: formatHeaders,
          queryParams: formatQueryParams,
        },
        response: res,
        timestamp: new Date().toISOString(),
      };
      await addRequestHistory(historyEntry);
    } catch (error: any) {
      console.error('Request failed:', error);
      setResponse({ error: error.message });

      // Add the failed request to the history collection
      const formatHeaders = Object.entries(headers).map(([key, value]) => ({ key, value }));
      const formatQueryParams = Object.entries(params).map(([key, value]) => ({ key, value }));

      const failedHistoryEntry = {
        id: uuidv4(),
        request: {
          id: uuidv4(),
          name: `Request to ${url}`,
          method,
          url,
          body,
          headers: formatHeaders,
          queryParams: formatQueryParams,
        },
        response: { error: error.message },
        timestamp: new Date().toISOString(),
      };
      await addRequestHistory(failedHistoryEntry);
    }
  };

  return (
    <Row gutter={[16, 16]} style={{ height: '100%', flexDirection: 'column' }}>
      <Col style={{ flex: '0 1 auto', overflowY: 'auto' }}>
        <RequestForm
          request={request}
          index={index}
          tabs={tabs}
          setTabs={setTabs}
          collectionId={collectionId}
          onSendRequest={handleSendRequest}
        />
      </Col>
      <Col style={{ flex: '1 1 auto', overflowY: 'auto', marginTop: '2px' }}>
        <ResponsePanel response={response} />
      </Col>
    </Row>
  );
};

export default NetworkPanel;
