import {
  useUserId,
  useUserData,
  useAuthenticationStatus,
  useSignOut,
} from "@nhost/react";
import { useNavigate, Navigate } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  HomeOutlined,
  ProfileOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "./protectedRoute.css";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const userId = useUserId();
  const user = useUserData();
  const { signOut } = useSignOut();
  const navigate = useNavigate();
  const { Header, Content } = Layout;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    {
      label: "Home",
      icon: <HomeOutlined />,
    },
    {
      label: ``,
      icon: <UserOutlined />,
      children: [
        {
          label: `${user?.displayName || user?.email || "User"}`,
          icon: <ProfileOutlined />,
        },
        {
          label: `Logout`,
          icon: <LogoutOutlined />,
          onClick: handleLogout,
        },
      ],
    },
  ];

  // ⏳ Wait for auth check to complete
  if (isLoading) return <div>Loading...</div>;

  return isAuthenticated ? (
    <>
      <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            position: "sticky",
          }}
        >
          <h1 style={{ color: "white", margin: 0 }}>NewsPlace</h1>
          <Menu
            theme="dark"
            mode="horizontal"
            items={navItems}
            selectedKeys={[]}
            style={{ flex: 1, justifyContent: "flex-end", minWidth: "300px" }}
          />
        </Header>
      </Layout>
      {children}
    </>
  ) : (
    <Navigate to="/" />
  );
}

export default ProtectedRoute;
