import { useUserId, useUserData } from "@nhost/react";
import LogoutButton from "../../components/pages/LoginPage/logout";
import { SignUp } from "../../components/pages/LoginPage/SignUp";
import "./protectedRoute.css";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  HomeOutlined,
  ProfileOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, Navigate } from "react-router-dom";
import { useSignOut } from "@nhost/react";
function ProtectedRoute({ children }) {
  const userId = useUserId(); // Check if user is authenticated
  const user = useUserData();
  const navigate = useNavigate();
  const { signOut } = useSignOut();
  const { Header, Content } = Layout;
  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    {
      label: "Home",
      icon: <HomeOutlined></HomeOutlined>,
    },
    {
      label: ``,
      icon: <UserOutlined></UserOutlined>,
      children: [
        {
          label: `${user?.displayName || user?.email || "User"}`,
          icon: <ProfileOutlined></ProfileOutlined>,
        },
        {
          label: `Logout`,
          icon: <LogoutOutlined onClick={handleLogout}></LogoutOutlined>,
          onClick: handleLogout,
        },
      ],
    },
  ];
  return userId ? (
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
          {/* Logo/Title */}
          <h1 style={{ color: "white", margin: 0 }}>NewsPlace</h1>

          {/* Navigation Menu */}
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
    <Navigate to="/"></Navigate>
  );
}

export default ProtectedRoute;
