import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [sidebarState, setSidebarState] = useState(false);
  const [mainContentMargin, setMainContentMargin] = useState('ml-64');
  const [recommendations, setRecommendations] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log(parsedUser)
        } catch (error) {
          console.error("Erreur lors du parsing des données utilisateur :", error);
          localStorage.removeItem("user"); // Supprime les données corrompues
          sessionStorage.removeItem("user");
        }
      }
    }, []);
  // Fetch recommendations on component load
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        if (!user) return; // attend que le user soit chargé
  
        const userSkills = user.skills || [];      // tableau de skills
        const userInterests = user.interests || []; // tableau d'intérêts
  
        if (userSkills.length === 0 || userInterests.length === 0) {
          console.warn("Skills ou Interests sont vides.");
          return;
        }
  
        // Pour simplifier, on prend les premiers éléments de chaque tableau (ou adapte selon logique)
        const offering = userSkills[0];
        const lookingFor = userInterests[0];
        const userInput = `${offering},${lookingFor}`;
  
        const encodedInput = encodeURIComponent(userInput);
        const response = await axios.get(`http://localhost:5000/recommendations/${encodedInput}`);
        setRecommendations(response.data);
      } catch (error) {
        console.error('Erreur récupération recommandations:', error);
      }
    };
  
    fetchRecommendations();
  }, [user]); // 👈 dépendance à 'user' pour ne s'exécuter qu'après l'avoir récupéré
  

  useEffect(() => {
    const handleSidebarChange = (event) => {
      setSidebarState(event.detail.isCollapsed);
    };
    window.addEventListener('sidebarStateChange', handleSidebarChange);
    return () => window.removeEventListener('sidebarStateChange', handleSidebarChange);
  }, []);

  useEffect(() => {
    setMainContentMargin(sidebarState ? 'ml-16' : 'ml-64');
  }, [sidebarState]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className={`${mainContentMargin} p-8 transition-all duration-300 ease-in-out`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stat cards... */}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recommended Skill Exchanges</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recommendations.map((exchange, index) => (
              <div key={index} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${exchange.offering}`} // avatar aléatoire
                    alt={exchange.offering}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Unknown</h3>
                    <p className="text-sm text-gray-500">Location Unknown</p>
                  </div>
                </div>
                <div className="flex-1 px-8">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">Offering</p>
                      <p className="text-sm text-gray-500">{exchange.offering}</p>
                    </div>
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">Looking for</p>
                      <p className="text-sm text-gray-500">{exchange.looking_for}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Recommended
                  </span>
                </div>
                <button className="ml-8 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
