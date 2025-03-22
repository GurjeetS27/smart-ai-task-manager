import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://3.84.103.28:5000/api/auth/register", formData);
      navigate("/login");
    } catch (err) {
      alert("Registration failed!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input name="name" type="text" placeholder="Name" onChange={handleChange} className="mb-2 p-2 border" required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="mb-2 p-2 border" required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="mb-2 p-2 border" required />
        <button type="submit" className="bg-blue-500 text-white p-2">Register</button>
      </form>
    </div>
  );
};

export default Register;
