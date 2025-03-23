import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, CalendarCheck, Mic, BrainCircuit } from "lucide-react";

const Home = () => {
  const [darkMode] = useState(false);

  return (
    <div className={darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}>
      {/* Hero Section */}
      <header className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-gradient-to-br from-blue-500 to-purple-600">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-3xl sm:text-5xl font-extrabold text-white flex items-center gap-2 text-center"
        >
          <Rocket size={32} /> Smart AI Task Manager
        </motion.h1>
        <p className="text-base sm:text-lg text-white mt-3 max-w-md">
          Boost your productivity with AI-driven insights and smart task scheduling!
        </p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto"
        >
          <Link to="/register" className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg text-lg font-bold flex justify-center items-center gap-2 shadow-lg transition w-full sm:w-auto">
            🔥 Try Now - It's Free!
          </Link>
          <Link to="/login" className="bg-white hover:bg-gray-200 text-blue-600 px-6 py-3 rounded-lg text-lg font-bold flex justify-center items-center gap-2 shadow-lg transition w-full sm:w-auto">
            🔑 Login
          </Link>
        </motion.div>
      </header>
      {/* Features Section */}
      <section className="py-12 text-center">
        <h2 className="text-3xl font-bold mb-6">Why Choose Smart AI Task Manager? 🤖</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
          <motion.div className="bg-blue-100 p-6 rounded-lg shadow-lg flex flex-col items-center" whileHover={{ scale: 1.05 }}>
            <CalendarCheck size={36} className="text-blue-600 mb-3" />
            <h3 className="text-xl font-semibold">AI-Powered Task Prioritization</h3>
            <p className="text-gray-600 mt-2">Never miss a deadline again. AI suggests what to do next based on urgency.</p>
          </motion.div>
          <motion.div className="bg-green-100 p-6 rounded-lg shadow-lg flex flex-col items-center" whileHover={{ scale: 1.05 }}>
            <Mic size={36} className="text-green-600 mb-3" />
            <h3 className="text-xl font-semibold">Voice Command Integration</h3>
            <p className="text-gray-600 mt-2">Use voice commands to add tasks hands-free in seconds.</p>
          </motion.div>
          <motion.div className="bg-purple-100 p-6 rounded-lg shadow-lg flex flex-col items-center" whileHover={{ scale: 1.05 }}>
            <BrainCircuit size={36} className="text-purple-600 mb-3" />
            <h3 className="text-xl font-semibold">AI Auto-Scheduling</h3>
            <p className="text-gray-600 mt-2">AI organizes your tasks efficiently for maximum productivity.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
