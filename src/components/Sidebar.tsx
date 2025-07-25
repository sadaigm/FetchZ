import React from "react";
import { Layout, Tabs, Typography } from "antd";
import RequestHistory from "./RequestHistory";
import Collections from "./collections/Collections";
import type { WebRsRequest } from "../types/request.types";
import { useRequestContext } from "../context/RequestProvider";

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar: React.FC<{}> = ({}) => {
  const { openedRequests, addRequest, setSelectedRequestId } =
    useRequestContext();
  const handleSelectRequest = (request: WebRsRequest) => {
    addRequest(request);
    setSelectedRequestId?.(request.id?.toString() || "");
  };
  return (
    <Sider
      theme="light"
      width={250}
      style={{
        padding: "8px",
        overflow: "auto",
        borderRight: "1px solid #f0f0f0",
      }}
    >
      <Tabs
        className="sidebar-tabs-vertical"
        defaultActiveKey="1"
        tabPosition="left"
        items={[
          {
            key: "1",
            label: (
              <div style={{ writingMode: "vertical-rl" }}>Collections</div>
            ),
            children: <Collections />,
          },
          {
            key: "2",
            label: <div style={{ writingMode: "vertical-rl" }}>History</div>,
            children: (
              <>
                <h3
                  style={{
                    marginBottom: "16px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Request History
                </h3>
                <RequestHistory onSelectRequest={handleSelectRequest} />
              </>
            ),
          },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
