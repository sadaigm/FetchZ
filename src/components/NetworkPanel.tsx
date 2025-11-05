import React, { useState } from 'react';
import { Row, Col } from 'antd';
import RequestForm from './RequestForm';
import ResponsePanel from './ResponsePanel';
import TestResults from './TestResults';
import { sendRequest } from '../apiClient';
import { useRequestHistoryContext } from '../context/RequestHistoryProvider';
import { useCollectionContext } from '../context/CollectionProvider';
import { useEnvironmentContext } from '../context/EnvironmentProvider';
import { v4 as uuidv4 } from 'uuid';
import type { SavedResponse, WebRsRequest } from '../types/request.types';
import type { TestScriptResult } from '../services/testScriptExecutor';
import { generateId } from '../services/database/stores/collections';
import { executeTestScript } from '../services/testScriptExecutor';
import { updateUrl, updateHeaders, updateParams, updateBody } from '../utils/variable-replacement';

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
  const [testResults, setTestResults] = useState<TestScriptResult | null>(null);
  const { addRequestHistory } = useRequestHistoryContext();
  const { saveRequestToCollection, refreshCollections, addRequestToFolder } = useCollectionContext();
  const { activeEnvironment, activeEnvironmentWithCurrentValues, updateCurrentValue, currentValues } = useEnvironmentContext();

  const handleSendRequest = async (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body: any,
    headers: Record<string, string>,
    params: Record<string, string>
  ) => {
    try {
      // Replace environment variables in request components
      const updatedUrl = updateUrl(url, activeEnvironmentWithCurrentValues);
      const updatedHeaders = updateHeaders(
        Object.entries(headers).map(([key, value]) => ({ key, value })),
        activeEnvironmentWithCurrentValues
      ).reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      const updatedParams = updateParams(params, activeEnvironmentWithCurrentValues);
      const updatedBody = updateBody(body, activeEnvironmentWithCurrentValues);
       console.log({method, updatedUrl, updatedBody, updatedHeaders, updatedParams}) 
      const res = await sendRequest(method, updatedUrl, updatedBody, updatedHeaders, updatedParams);
      setResponse(res);

      // Execute test script if present
      if (request.testScript && activeEnvironment) {
        try {
          const testResult = executeTestScript(
            request.testScript,
            res,
            activeEnvironment.id,
            updateCurrentValue,
            () => activeEnvironmentWithCurrentValues || activeEnvironment,
            updateCurrentValue,
            () => currentValues
          );
          setTestResults(testResult);
        } catch (scriptError) {
          console.error('Test script execution failed:', scriptError);
          setTestResults({
            tests: [],
            environmentChanges: [],
            error: scriptError instanceof Error ? scriptError.message : 'Unknown error'
          });
        }
      } else {
        // Clear test results if no script or environment
        setTestResults(null);
      }

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
          testScript: "", // Initialize the new testScript field
        },
        response: JSON.parse(JSON.stringify(res)), // Deep clone to avoid DataCloneError
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
          testScript: "", // Initialize the new testScript field
        },
        response: { error: error.message }, // Simple object that can be cloned
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
          testResults={testResults}
        />
      </Col>
    </Row>
  );
};

export default NetworkPanel;
