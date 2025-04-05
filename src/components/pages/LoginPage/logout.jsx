import { useNavigate } from "react-router-dom";
import { useSignOut } from "@nhost/react";
function LogoutButton() {
  const navigate = useNavigate();
  const { signOut } = useSignOut();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;
