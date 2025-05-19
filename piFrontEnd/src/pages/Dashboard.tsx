import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { Link , useNavigate } from "react-router-dom";

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
  profileImagePath?: string;     // 👈 ajoute ceci
  profileImageFilename?: string; // 👈 (optionnel si tu veux l'utiliser)
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
      src="data:image/jpeg;base64,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"
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

  {connectedUsers && connectedUsers.length > 0 ? (
    <ul className="space-y-4">
      {connectedUsers.map((conn, idx) => {
        const initials = (conn.firstName?.[0] || '') + (conn.lastName?.[0] || '');
        const imageUrl = conn.profileImagePath;

        return (
          <li key={idx} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <Link
              to={`/user/${conn.id}`}
              className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl mr-3 overflow-hidden">
                {imageUrl ? (
                  <img
                    src={`http://localhost:3000${imageUrl}`}
                    alt={`${conn.firstName} ${conn.lastName}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  initials
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {conn.firstName} {conn.lastName}
                </p>
                <p className="text-sm text-gray-500">View Profile</p>
              </div>
            </Link>

            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p>
                <strong>Status:</strong>{' '}
                {conn.status === 'true' || conn.status === 'true' ? 'Online' : 'Offline'}
              </p>
              <p>
                <strong>Connected since:</strong>{' '}
                {conn.createdAt ? new Date(conn.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </li>
        );
      })}
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
