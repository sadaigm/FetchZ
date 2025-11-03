import React, { useState, useEffect } from "react";
import { Tabs } from "antd";
import { v4 as uuidv4 } from "uuid";
import { useRequestContext } from "../context/RequestProvider";
import type { OpenedWindowInstance } from "../context/RequestProvider";
import NetworkPanel from "./NetworkPanel";
import EnvironmentDetails from "./environments/EnvironmentDetails";
import type { WebRsRequest } from "../types/request.types";
import type { Environment } from "../types/environment.types";

const { TabPane } = Tabs;

interface AppLayoutPanelProps {}

const AppLayoutPanel: React.FC<AppLayoutPanelProps> = ({}) => {
  const {
    openedRequests: requests,
    addRequest,
    removeRequest,
    selectedRequestId,
    setSelectedRequestId,
    requestCollections,
    dirtyRequests,
  } = useRequestContext();
  const [activeTabKey, setActiveTabKey] = useState<string>(
    requests[0]?.id?.toString() || ""
  );
  const [tabs, setTabs] = useState<OpenedWindowInstance[]>(requests);

  useEffect(() => {
    setTabs(requests);
  }, [requests]);

  useEffect(() => {
    if (selectedRequestId) {
      const matchingRequest = tabs.find(
        (tab) => tab.id?.toString() === selectedRequestId
      );
      if (matchingRequest) {
        setActiveTabKey(selectedRequestId);
      }
    }
  }, [selectedRequestId, tabs]);

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const handleAddTab = () => {
    const newRequest: WebRsRequest = {
      id: uuidv4(),
      name: `Request ${tabs.length + 1}`,
      url: "",
      method: "GET",
      headers: [],
      queryParams: [],
      body: "",
      description: "", // Initialize the new description field
      savedResponses: [], // Initialize the new savedResponses field
    };
    const newWindow: OpenedWindowInstance = {
      type: "WebRsRequest",
      data: newRequest,
      id: newRequest.id
    };
    setTabs([...tabs, newWindow]);
    addRequest(newRequest);
    setSelectedRequestId && setSelectedRequestId(newRequest.id.toString());
  };

  const handleRemoveTab = (targetKey: string) => {
    const newTabs = tabs.filter((tab) => tab.id?.toString() !== targetKey);
    setTabs(newTabs);
    removeRequest(targetKey);
    if (newTabs.length > 0) {
      setSelectedRequestId &&
        setSelectedRequestId(newTabs[0].id?.toString() || "");
    }
  };

  return (
    <Tabs
      type="editable-card"
      activeKey={activeTabKey}
      onChange={handleTabChange}
      onEdit={(targetKey, action) => {
        if (action === "add") handleAddTab();
        if (action === "remove") handleRemoveTab(targetKey as string);
      }}
    >
      {tabs.map((tab, index) => {
        const isRequest = tab.type === "WebRsRequest";
        const isEnvironment = tab.type === "Environment";
        const tabData = tab.data;
        const collectionId = tab.collectionId;
        
        return (
          <TabPane
            tab={`${tabData.name || `${isRequest ? 'Request' : 'Environment'} ${index + 1}`}${
              (isRequest || isEnvironment) && dirtyRequests.includes(tab.id) ? " *" : ""
            }`}
            key={tab.id?.toString() || `new-${index}`}
            closable={tabs.length > 1}
          >
            {isRequest && (
              <NetworkPanel
                collectionId={collectionId}
                request={tabData as WebRsRequest}
                index={index}
                tabs={tabs.filter(t => t.type === "WebRsRequest").map(t => t.data as WebRsRequest)}
                setTabs={(newTabs: WebRsRequest[]) => {
                  // Convert WebRsRequest[] back to OpenedWindowInstance[]
                  const updatedWindows: OpenedWindowInstance[] = tabs.map(window => {
                    if (window.type === "WebRsRequest") {
                      const matchingTab = newTabs.find(tab => tab.id === window.id);
                      if (matchingTab) {
                        return {
                          type: "WebRsRequest" as const,
                          data: matchingTab,
                          id: window.id
                        };
                      }
                      return window;
                    }
                    return window;
                  });
                  setTabs(updatedWindows);
                }}
              />
            )}
            {isEnvironment && (
              <EnvironmentDetails environment={tabData as Environment} />
            )}
          </TabPane>
        );
      })}
    </Tabs>
  );
};

export default AppLayoutPanel;
