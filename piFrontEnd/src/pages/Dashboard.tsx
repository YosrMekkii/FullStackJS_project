import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  skills: string[];
  xp: number;
  level: number;
  completedChallenges: any[];
  interactions: User[];
  matchedUserId?: string; // Si tu as besoin d'utiliser ce champ
  status?: string;        // Le statut de la connexion, par exemple "pending"
  createdAt?: string;     // Date de création de la connexion
}

const Dashboard = () => {
  const [mainContentMargin, setMainContentMargin] = useState("ml-64");
  const [user, setUser] = useState<User | null>(null);
  const [connectionRequests, setConnectionRequests] = useState<User[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [mySkills, setMySkills] = useState<any[]>([]);
  const navigate = useNavigate();

  // Fetch user from localStorage or sessionStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    }
  }, []);

  // Handle edit skill
const handleEditSkill = (skillId: string) => {
  navigate(`/edit-skill/${skillId}`);
};

// Handle delete skill
const handleDeleteSkill = async (skillId: string) => {
  if (window.confirm("Are you sure you want to delete this skill?")) {
    try {
      const response = await fetch(`http://localhost:3000/skill/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Update the skills state to remove the deleted skill
        setMySkills(mySkills.filter(skill => skill._id !== skillId));
      } else {
        throw new Error('Failed to delete skill');
      }
    } catch (err) {
      console.error('Error deleting skill:', err);
      alert('Failed to delete skill. Please try again.');
    }
  }
};
  

  // Fetch connections and requests
  useEffect(() => {
   const fetchConnections = async () => {
    if (!user || !user.id) return;

    try {
      // Fetch user details (optional, if needed)
      const res = await axios.get(`http://localhost:3000/api/users/${user.id}`);
      setUser(res.data);

      // Fetch connected users based on the user's connections
      const connectedResponse = await axios.get(`http://localhost:3000/api/matches/${user.id}`);
      const connectedData = connectedResponse.data;

      // Récupérer les IDs des utilisateurs connectés
      const connectedUserIds = connectedData.map((connection: any) => connection.matchedUserId);

      // Fetch details of each connected user by ID
      const userPromises = connectedUserIds.map(async (id: string) => {
        const userDetails = await axios.get(`http://localhost:3000/api/users/${id}`);
        return userDetails.data;  // Renvoie les données de l'utilisateur
      });

      // Attendre que toutes les requêtes pour récupérer les informations complètes des utilisateurs soient terminées
      const userDetailsArray = await Promise.all(userPromises);

      // Mettre à jour l'état avec les utilisateurs connectés
      setConnectedUsers(userDetailsArray);
      console.log("Connected users with details:", userDetailsArray);

      // Fetch connection requests (if needed)
      const requests = await axios.get(`http://localhost:3000/api/matches/getmatchesfor/${user.id}`);
      setConnectionRequests(requests.data);
      console.log("Connection requests:", requests.data);
      
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

    const fetchSkills = async () => {
  if (!user || !user.id) {
    console.error('User data is unavailable.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/skill/user/${user.id}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching skills: ${response.statusText}`);
    }

    const data = await response.json();
    setMySkills(data);  // Assuming you have a state like this
  } catch (error) {
    console.error('Error fetching skills:', error);
  }
};



    fetchSkills();
    fetchConnections();
  }, [user?.id]);

 // Check for undefined user or data before rendering
if (!user) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <main className="ml-64 p-8">
        <p>Loading user data...</p>
      </main>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gray-100">
    <Sidebar />

    <div className="flex flex-1">

    
    <main className={`${mainContentMargin} transition-all duration-300 ease-in-out p-8 w-full`}>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Hello, {user.firstName} 👋
      </h1>

      <section className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 mb-6 rounded-lg shadow-lg">
  <h2 className="text-3xl font-bold text-white mb-6">Statistics</h2>

  <div className="flex justify-between items-center space-x-10">
    {/* XP */}
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 border-4 border-white rounded-full mb-3 flex items-center justify-center overflow-hidden">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwjL4N6LE8H_7xIkdr0N7SAee4JoD2wAj6sw&s"
          alt="XP"
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-white text-lg font-medium">XP</span>
      <span className="text-white text-xl font-semibold">{user.xp}</span>
    </div>

    {/* Level */}
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 border-4 border-white rounded-full mb-3 flex items-center justify-center overflow-hidden">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVfZouzAWKgQ8gw4kUa5sAJwKDbvH8p5-n-Q&s"
          alt="Level"
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-white text-lg font-medium">Level</span>
      <span className="text-white text-xl font-semibold">{user.level}</span>
    </div>

    {/* Completed Challenges */}
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 border-4 border-white rounded-full mb-3 flex items-center justify-center overflow-hidden">
        <img
          src="https://media.istockphoto.com/id/1320350485/vector/vintage-black-color-hexagon-label-banner-with-word-challenge-on-white-background.jpg?s=612x612&w=0&k=20&c=a-n48e8hQ1SidQMcKoY2pFN7y8rz6tmQYfK9MRwZpxM="
          alt="Challenges"
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-white text-lg font-medium">Challenges</span>
      <div className="h-2 bg-gray-200 rounded-full w-32 mt-1">
        <div
          className="h-full bg-yellow-400 rounded-full"
          style={{
            width: `${(user.completedChallenges?.length || 0) / 10 * 100}%`,
          }}
        ></div>
      </div>
      <span className="text-white text-sm font-semibold mt-1">
        {user.completedChallenges?.length || 0} completed
      </span>
    </div>

    {/* Connections */}
    <div className="flex flex-col items-center">
  <div className="relative w-20 h-20 border-4 border-white rounded-full mb-3 flex items-center justify-center overflow-hidden">
    <img
      src="https://i.ytimg.com/vi/TTNhYyg1vy8/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGGAgYChgMA8=&rs=AOn4CLDolevsJ-2RykVjTAEAxFA3JS5OKw"
      alt="Connections"
      className="w-full h-full object-cover"
    />
  </div>
  <span className="text-white text-lg font-medium">Connections</span>
  <span className="text-white text-xl font-semibold">{connectedUsers?.length || 0}</span>
</div>
  </div>
</section>



      {/* Skills */}
      <section className="bg-white p-6 mb-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Skills</h2>
        {mySkills.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mySkills.map((skill) => (
              <div 
                key={skill._id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] border-l-4 border-l-indigo-500"
              >
                <div className="relative">
                  <img 
                    src={skill.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={skill.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <span className="text-white text-sm font-medium px-3 py-1 bg-indigo-600 rounded-full">
                      {skill.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">{skill.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{skill.description}</p>
                  <p className="text-sm text-gray-500">👍 {skill.likes || 0} likes</p>
                  <div className="mt-4 flex gap-2">
    <button
      onClick={() => handleEditSkill(skill._id)}
      className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 font-medium transition-colors flex items-center justify-center gap-2"
    >
      ✏️ Edit
    </button>
    <button
      onClick={() => handleDeleteSkill(skill._id)}
      className="flex-1 border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-50 font-medium transition-colors flex items-center justify-center gap-2"
    >
      🗑️ Delete
    </button>
  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't added any skills yet.</p>
        )}
      </section>


      {/* Connection Requests */}
      <section className="bg-white p-6 mb-6 rounded-lg shadow">
  <h2 className="text-lg font-semibold text-gray-800 mb-2">Connection Requests</h2>
  {connectionRequests.length > 0 ? (
    <ul className="space-y-2">
      {connectionRequests.map((req, idx) => (
        <li key={idx} className="text-gray-700">
          {req.firstName} {req.lastName}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-500">No connection requests.</p>
  )}
</section>

      
      
    </main>

{/* Barre latérale droite pour les utilisateurs connectés */}
     <aside className="w-1/3 p-4 bg-white border-l border-gray-200 shadow-md hidden xl:block mt-4 mb-4 mr-4">
  <h2 className="text-lg font-semibold text-gray-800 mb-4">Connected Users</h2>
  {connectedUsers.length > 0 ? (
    <ul className="space-y-4">
      {connectedUsers.map((conn, idx) => (
        <li key={idx} className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
          <div className="font-bold text-lg text-gray-800">
            {conn.firstName} {conn.lastName}
          </div>
          <div className="text-gray-600">
            <strong>Status:</strong> {conn.status}
          </div>
          <div className="text-gray-600">
            <strong>Connected since:</strong> {conn.createdAt ? new Date(conn.createdAt).toLocaleDateString() : 'N/A'}
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-500">You have no connections yet.</p>
  )}
</aside>





    </div>
  </div>
);
};
export default Dashboard;
