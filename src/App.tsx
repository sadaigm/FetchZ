import { Layout, Space } from "antd";
import "./App.css";
import { RequestProvider } from "./context/RequestProvider";
import { RequestHistoryProvider } from "./context/RequestHistoryProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import Sidebar from "./components/Sidebar";
import AppLayoutPanel from "./components/AppLayoutPanel";
import ThemeToggle from "./components/ThemeToggle";
import fetchzLogo from "../public/fetchz-favicon.svg";
import AppInfo from "./components/AppInfo";
import { theme } from "antd";

const { Content } = Layout;

const App = () => {
  const { token } = theme.useToken();

  return (
    <RequestProvider>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "5px",
          backgroundColor: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorder}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={fetchzLogo}
            alt="FetchZ Logo"
            style={{ width: "40px", height: "40px", marginRight: "8px" }}
          />
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: token.colorText }}>
            FetchZ
          </h1>
        </div>
        <Space direction="horizontal" style={{marginRight:"20px",}} size="middle" >
          <ThemeToggle />
          <AppInfo />
        </Space>
      </div>
      <RequestHistoryProvider>
        <Layout style={{ height: "calc( 100vh - 60px )",
          background: token.colorBgContainer,
         }}>
          <Sidebar />
          <Layout style={{ padding: "16px",
            background: token.colorBgContainer,
           }}>
            <Content
              style={{
                background: token.colorBgContainer,
                padding: "16px",
                borderRadius: token.borderRadius,
                boxShadow: token.boxShadowSecondary,
              }}
            >
              <AppLayoutPanel />
            </Content>
          </Layout>
        </Layout>
      </RequestHistoryProvider>
    </RequestProvider>
  );
};

export default App;
