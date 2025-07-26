import { Layout } from "antd";
import "./App.css";
import { RequestProvider } from "./context/RequestProvider";
import { RequestHistoryProvider } from "./context/RequestHistoryProvider";
import Sidebar from "./components/Sidebar";
import AppLayoutPanel from "./components/AppLayoutPanel";
import fetchzLogo from "../public/fetchz-favicon.svg";
import AppInfo from "./components/AppInfo";

const { Content } = Layout;

const App = () => {
  return (
    <RequestProvider>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "5px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={fetchzLogo}
            alt="FetchZ Logo"
            style={{ width: "40px", height: "40px", marginRight: "8px" }}
          />
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
            FetchZ
          </h1>
        </div>
        <AppInfo />
      </div>
      <RequestHistoryProvider>
        <Layout style={{ height: "calc( 100vh - 60px )" }}>
          <Sidebar />
          <Layout style={{ padding: "16px" }}>
            <Content
              style={{
                background: "#fff",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
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
