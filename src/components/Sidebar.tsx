import React from "react";
import { Layout, Tabs, Typography } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import RequestHistory from "./RequestHistory";
import Collections from "./collections/Collections";
import type { WebRsRequest } from "../types/request.types";
import { useRequestContext } from "../context/RequestProvider";
import "./Sidebar.css";

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar: React.FC<{}> = ({}) => {
  const { openedRequests, addRequest, setSelectedRequestId } =
    useRequestContext();
  const [collapsed, setCollapsed] = React.useState(false);

  const handleSelectRequest = (request: WebRsRequest) => {
    addRequest(request);
    setSelectedRequestId?.(request.id?.toString() || "");
  };

  return (
    <Sider
      theme="light"
      width={collapsed ? 50 : "30%"}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      trigger={
        collapsed ? (
          <MenuUnfoldOutlined onClick={() => setCollapsed(false)} />
        ) : (
          <MenuFoldOutlined onClick={() => setCollapsed(true)} />
        )
      }
      style={{
        padding: "8px",
        overflow: "auto",
        borderRight: "1px solid #f0f0f0",
      }}
    >
      <Tabs
        className={`sidebar-tabs-vertical ${collapsed ? "collapsed" : ""}`}
        defaultActiveKey="1"
        tabPosition="left"
        style={{ height: "100%" }}
        items={[
          {
            key: "1",
            label: (
              <div style={{ writingMode: "vertical-rl" }}>Collections</div>
            ),
            children: (
              <div className={`tab-content ${collapsed ? "hidden" : ""}`}>
                <Collections />
              </div>
            ),
          },
          {
            key: "2",
            label: <div style={{ writingMode: "vertical-rl" }}>History</div>,
            children: (
              <div className={`tab-content ${collapsed ? "hidden" : ""}`}>
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
              </div>
            ),
          },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
