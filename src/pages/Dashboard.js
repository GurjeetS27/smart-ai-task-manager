import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";
import { Mic, BrainCircuit, Trash, Check } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);


const Dashboard = ({ darkMode, setDarkMode }) => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", deadline: "" });
  const [suggestedTime, setSuggestedTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [filter, setFilter] = useState("all");

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filter === "completed") return task.status === "completed";
      if (filter === "incomplete") return task.status !== "completed";
      return true;
    });
  }, [tasks, filter]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  const fetchSuggestedTime = async () => {
    try {
      console.log("📢 Fetching AI Suggested Time...");
  
      const response = await axios.post(
        "http://localhost:5000/api/ai/suggest-time",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
  
      console.log("✅ AI Suggested Time API Response:", response.data);
  
      if (response.data && response.data.suggested_time) {
        const formattedTime = response.data.suggested_time.replace(/(\d{1,2} [APM]{2} - \d{1,2} [APM]{2})/g, "<b>$1</b>");
        setSuggestedTime(formattedTime);
      } else {
        setSuggestedTime("No valid suggestion"); // Display fallback message
        console.warn("⚠️ AI Suggested Time API returned invalid data:", response.data);
      }
    } catch (error) {
      console.error("❌ Error fetching AI Suggested Time:", error.response?.data || error.message);
      
      // Handle different error cases
      if (error.response?.status === 400) {
        setSuggestedTime("No task history available");
      } else {
        setSuggestedTime("Error fetching time");
      }
    }
  };
  
  
  // Fetch Tasks + Suggested Time
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setTasks(response.data);

      // Check if completed tasks exist before calling AI
      const hasCompletedTasks = response.data.some(task => task.status === "completed");
      if (hasCompletedTasks) {
        await fetchSuggestedTime(); // Fetch AI Best Time
      } else {
        setSuggestedTime("N/A"); // No history for AI to analyze
      }
    } catch (error) {
      console.error("Error fetching tasks:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add new task
  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!newTask.title.trim() || !newTask.description.trim()) {
      alert("⚠️ Title and Description cannot be empty!");
      return;
    }

    const isDuplicate = tasks.some(task => task.title.toLowerCase() === newTask.title.toLowerCase());
    if (isDuplicate) {
      alert("⚠️ This task already exists!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/tasks", newTask, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks(prev => [...prev, res.data]);
      setNewTask({ title: "", description: "", priority: "medium", deadline: "" });
    } catch (error) {
      console.error("Add task failed:", error.response?.data || error.message);
      alert("Failed to add task.");
    }
  };
  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, fetchDashboardData]);
  
  
  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks(prev => prev.filter(task => task._id !== taskId));
    } catch (error) {
      console.error("Delete failed:", error.response?.data || error.message);
    }
  };

  // Complete task
  const handleCompleteTask = async (taskId) => {
    let time;
    while (true) {
      time = prompt("⏳ Enter time to complete (minutes):");
      if (!time || isNaN(time) || parseInt(time) <= 0) {
        alert("⚠️ Please enter a valid number greater than 0.");
      } else {
        break;
      }
    }
  
    try {
      await axios.put(`http://localhost:5000/api/tasks/complete/${taskId}`, {
        completion_time: parseInt(time)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
  
      fetchDashboardData(); // ✅ Refresh tasks and AI suggested time
    } catch (error) {
      console.error("Error completing task:", error.response?.data || error.message);
      alert("⚠️ Failed to complete task.");
    }
  };
  
  
  // Voice → Task Suggestion
  const handleVoiceTask = async () => {
    if (!transcript) return alert("Please say something!");
  
    try {
      const res = await axios.post("http://localhost:5000/api/ai/voice-task", {
        text: transcript
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      setNewTask(res.data);
      alert("🎤 AI suggested: " + res.data.title);
      resetTranscript();
      
      // ✅ Clear input after AI fills it
      setTimeout(() => setNewTask({ title: "", description: "", priority: "medium", deadline: "" }), 5000);
    } catch (error) {
      console.error("Voice task failed:", error.response?.data || error.message);
    }
  };
  
  const getCompletionChartData = () => {
    const completedTasks = tasks.filter(task => task.status === "completed");

    const timeSlots = {
      "6 AM - 9 AM": 0,
      "9 AM - 12 PM": 0,
      "12 PM - 3 PM": 0,
      "3 PM - 6 PM": 0,
      "6 PM - 9 PM": 0
    };

    completedTasks.forEach(task => {
      const taskTime = new Date(task.completion_time);
      if (isNaN(taskTime)) return; // Skip invalid dates

      const hour = taskTime.getHours();
      if (hour >= 6 && hour < 9) timeSlots["6 AM - 9 AM"]++;
      else if (hour >= 9 && hour < 12) timeSlots["9 AM - 12 PM"]++;
      else if (hour >= 12 && hour < 15) timeSlots["12 PM - 3 PM"]++;
      else if (hour >= 15 && hour < 18) timeSlots["3 PM - 6 PM"]++;
      else if (hour >= 18 && hour < 21) timeSlots["6 PM - 9 PM"]++;
    });

    return {
      labels: Object.keys(timeSlots),
      datasets: [
        {
          label: "Completed Tasks",
          data: Object.values(timeSlots),
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1
        }
      ]
    };
};

  
  return (
    <div className={`p-6 min-h-screen transition-all ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <h2 className="text-4xl font-extrabold mb-6 text-center">📋 Task Dashboard</h2>

      {/* AI Suggested Time */}
      <div className="text-center mt-2 mb-6 p-4 bg-blue-100 dark:bg-blue-800 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-200">⏰ AI Best Time to Work:</h3>
        <p className="text-xl font-bold text-blue-900 dark:text-white mt-1" dangerouslySetInnerHTML={{ __html: suggestedTime || "N/A" }}></p>
      </div>

      {/* Task Form */}
      <motion.form onSubmit={handleAddTask} className="mb-6 p-6 rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800 max-w-2xl mx-auto" whileHover={{ scale: 1.02 }}>
        <input type="text" placeholder="Title" required className="border p-3 w-full rounded-lg dark:bg-gray-700 dark:text-white mb-3"
          value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
        <textarea placeholder="Description" required className="border p-3 w-full rounded-lg dark:bg-gray-700 dark:text-white mb-3"
          value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
        <input type="date" required className="border p-3 w-full rounded-lg dark:bg-gray-700 dark:text-white mb-3"
          value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} />
        <select className="border p-3 w-full rounded-lg dark:bg-gray-700 dark:text-white mb-4"
          value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="w-full p-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition">
          ➕ Add Task
        </button>
      </motion.form>

      {/* Voice Commands */}
      <div className="flex justify-center space-x-4 mb-6">
        <button onClick={SpeechRecognition.startListening}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
          <Mic size={18} /> {listening ? "Listening..." : "Start Voice"}
        </button>
        <button onClick={handleVoiceTask}
          className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
          <BrainCircuit size={18} /> AI Process Task
        </button>
      </div>
      {transcript && <p className="text-center italic text-gray-500 dark:text-gray-300">🗣️ "{transcript}"</p>}

      {/* Filter */}
      <div className="flex justify-center mb-6">
        <label className="mr-3 font-semibold">📌 Filter Tasks:</label>
        <select onChange={(e) => setFilter(e.target.value)}
          className={`border p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}>
          <option value="all">📂 All Tasks</option>
          <option value="completed">✅ Completed Tasks</option>
          <option value="incomplete">📝 Incomplete Tasks</option>
        </select>
      </div>

      <div className="mt-6 max-w-lg mx-auto p-4 rounded-lg shadow-lg"
          style={{ backgroundColor: darkMode ? "#1e1e1e" : "#f8f9fa", color: darkMode ? "#fff" : "#000" }}>
        <h3 className="text-lg font-semibold text-center mb-4">📊 Task Completion by Time</h3>
        <Bar data={getCompletionChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>

      {/* Task List */}
      <div className="max-w-3xl mx-auto mt-8">
        <h3 className="text-2xl font-semibold mb-4 text-center">Your Tasks</h3>
        {isLoading ? (
          <p className="text-center text-gray-500">Loading tasks...</p>
        ) : filteredTasks.length > 0 ? (
          <ul className="space-y-4">
            {filteredTasks.map((task) => (
              <motion.li key={task._id} className="p-4 border rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 dark:bg-gray-800" whileHover={{ scale: 1.02 }}>
                <div>
                  <h4 className="text-lg font-bold">{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <p className="flex items-center gap-2 text-gray-500">
                    📅 {new Date(task.deadline).toLocaleDateString()} | 
                    🔥 Priority: {task.priority.toUpperCase()}
                  </p>
                </div>
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  {task.status === "completed" ? (
                    <span className="text-green-600 font-semibold">✅ Completed</span>
                  ) : (
                    <button onClick={() => handleCompleteTask(task._id)}
                      className="bg-green-500 text-white flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg hover:bg-green-600 transition">
                      <Check size={16} /> Complete
                    </button>
                  )}
                  <button onClick={() => handleDeleteTask(task._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition">
                    <Trash size={16} />
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No tasks yet. Add some!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
