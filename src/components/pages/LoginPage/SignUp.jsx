import { useState } from "react";
import { nhost } from "../../../utils/nhost";
import { useAuthenticationStatus } from "@nhost/react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { Link } from "react-router-dom";
const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoading, error, isAuthenticated } = useAuthenticationStatus();
  const [upError, setUpError] = useState("");
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const { error } = await nhost.auth.signUp({ email, password });
      if (error) throw error;
      alert("Verification email sent! Please check your inbox.");
    } catch (err) {
      console.error("Signup Error:", err.message);
      setUpError(err.message);
      navigate("/");
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          Sign Up
        </button>
        {error && <p className="error">{error.message}</p>}
        {upError && <p className="error">{upError}</p>}
      </form>
      <p>
        Already have an Account? <Link to="/">SignIn</Link>
      </p>
    </div>
  );
};

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const { session, error } = await nhost.auth.signIn({ email, password });
      if (error) throw error;
      alert("Login successful!");
      if (session) {
        navigate("/news"); // Redirect to News Page after login
      }
    } catch (err) {
      console.error("Signin Error:", err.message);
      setError("Wrong email or password");
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign In</h2>
      <form onSubmit={handleSignIn}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Sign In</button>
      </form>
      <p>
        Don't have Account? <Link to="/signUp">Sign Up</Link>
      </p>
    </div>
  );
};

export { SignUp, SignIn };
