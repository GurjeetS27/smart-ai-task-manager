import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData.email, formData.password);
    navigate("/dashboard"); // ✅ Navigate here instead of inside AuthContext.js
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="mb-2 p-2 border" required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="mb-2 p-2 border" required />
        <button type="submit" className="bg-blue-500 text-white p-2">Login</button>
      </form>
    </div>
  );
};

export default Login;
