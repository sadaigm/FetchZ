import React, { useState } from 'react';
import { Row, Col } from 'antd';
import RequestForm from './RequestForm';
import ResponsePanel from './ResponsePanel';
import { sendRequest } from '../apiClient';
import { useRequestHistoryContext } from '../context/RequestHistoryProvider';
import { useCollectionContext } from '../context/CollectionProvider';
import { v4 as uuidv4 } from 'uuid';
import type { SavedResponse, WebRsRequest } from '../types/request.types';
import { generateId } from '../services/database/stores/collections';

interface NetworkPanelProps {
  request: WebRsRequest;
  index: number;
  tabs: WebRsRequest[];
  setTabs: (requests: WebRsRequest[]) => void;
  collectionId?: string;
  folderId?: string;
}

const NetworkPanel: React.FC<NetworkPanelProps> = ({ request, index, tabs, setTabs, collectionId, folderId }) => {
  const [response, setResponse] = useState<any>(null);
  const [currentRequest, setCurrentRequest] = useState<WebRsRequest>(request);
  const { addRequestHistory } = useRequestHistoryContext();
  const { saveRequestToCollection, refreshCollections, addRequestToFolder } = useCollectionContext();

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
          savedResponses: [], // Initialize the new savedResponses field
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
          savedResponses: [], // Initialize the new savedResponses field
        },
        response: { error: error.message },
        timestamp: new Date().toISOString(),
      };
      await addRequestHistory(failedHistoryEntry);
    }
  };

  const saveRequestWithResponse = async (responseName : string, responseContent:string) => {
    if(collectionId){    
    const newSavedResponse = {
        id: generateId(),
        name: responseName,
        content: responseContent,
        timestamp: new Date().toISOString()
      };
      
      if (!request.savedResponses) {
        request.savedResponses = [];
      }
      request.savedResponses.push(newSavedResponse);
      if (folderId) {
      // Save to folder
      await addRequestToFolder(collectionId, folderId, request);
    } else {
      // Save to collection root
      await saveRequestToCollection(collectionId, request);
    }
    setCurrentRequest(request);
      }
  }

  const handleDeleteResponse = (responseId: string ) => {
    console.log("delete : ", responseId);
     request.savedResponses = request.savedResponses.filter(
              (response: SavedResponse) => response.id !== responseId
            );
            setCurrentRequest(prev => {
              prev.savedResponses = prev.savedResponses.filter(
              (response: SavedResponse) => response.id !== responseId
            );
            return {...prev};
            });
  }

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
        <ResponsePanel
          response={response}
          requestId={currentRequest.id}
          collectionId={collectionId}
          savedResponses={currentRequest.savedResponses}
          folderId={folderId}
          saveRequestWithResponse={saveRequestWithResponse}
          handleDeleteResponse={handleDeleteResponse}
        />
      </Col>
    </Row>
  );
};

export default NetworkPanel;
