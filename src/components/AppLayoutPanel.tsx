import React, { useState, useEffect } from "react";
import { Tabs } from "antd";
import { v4 as uuidv4 } from "uuid";
import { useRequestContext } from "../context/RequestProvider";
import NetworkPanel from "./NetworkPanel";
import type { WebRsRequest } from "../types/request.types";

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
  const [tabs, setTabs] = useState(requests);

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
      {tabs.map((request, index) => (
        <TabPane
          tab={`${request.name || `Request ${index + 1}`}${
            dirtyRequests.includes(request.id) ? " *" : ""
          }`}
          key={request.id?.toString() || `new-${index}`}
          closable={tabs.length > 1}
        >
          <NetworkPanel
            request={request}
            index={index}
            tabs={tabs}
            setTabs={setTabs}
            collectionId={requestCollections[request.id]?.id || undefined}
          />
        </TabPane>
      ))}
    </Tabs>
  );
};

export default AppLayoutPanel;
