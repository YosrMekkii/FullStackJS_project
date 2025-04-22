import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
  Trophy,
  Star,
  Zap,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  Code,
  Languages,
  Flame,
  Crown,
} from 'lucide-react';
import ActiveChallenge from '../components/ActiveChallenge';
import api from '../services/api';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: 'coding' | 'quiz' | 'interactive';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp: number;
  timeLimit: number;
  category: string;
  tags: string[];
  content?: {
    question?: string;
    options?: string[];
    code?: string;
    correctAnswer?: string | string[];
  };
  dailyChallenge?: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  achieved: boolean;
}

interface UserProgress {
  xp: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  streak: number;
  completedToday: number;
  dailyGoal: number;
}

const Challenges = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'all' | 'completed'>('daily');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userProgress, setUserProgress] = useState<UserProgress>({
    xp: 0,
    level: 1,
    currentLevelXP: 0,
    nextLevelXP: 1000,
    streak: 0,
    completedToday: 0,
    dailyGoal: 5
  });
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate progress percentage for XP bar
  const xpProgress = () => {
    const { xp, currentLevelXP, nextLevelXP } = userProgress;
    const levelXP = xp - currentLevelXP;
    const levelRange = nextLevelXP - currentLevelXP;
    return (levelXP / levelRange) * 100;
  };

  // Fetch user progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Load token from localStorage
        const token = localStorage.getItem('token');
        if (token) {
          api.setAuthToken(token);
          const progress = await api.fetchUserProgress();
          setUserProgress(progress);
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
      }
    };

    fetchProgress();
  }, []);

  // Fetch challenges based on active tab
  useEffect(() => {
    const loadChallenges = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          api.setAuthToken(token);
          
          // Fetch challenges based on tab
          if (activeTab === 'daily') {
            const dailyChallenges = await api.fetchDailyChallenges();
            setDailyChallenges(dailyChallenges);
          } else {
            const allChallenges = await api.fetchChallenges(selectedCategory);
            setChallenges(allChallenges);
            
            // Filter completed challenges if on completed tab
            if (activeTab === 'completed') {
              // This would require a separate endpoint or filtering on the client
              // For now, we'll just show all challenges on this tab
            }
          }
        }
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, [activeTab, selectedCategory]);

  const handleStartChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
  };

  const handleChallengeComplete = async (challengeId: string, success: boolean) => {
    if (success) {
      try {
        // Call API to record completion
        const updatedProgress = await api.completeChallenge(challengeId);
        setUserProgress(prev => ({
          ...prev,
          xp: updatedProgress.xp,
          level: updatedProgress.level,
          streak: updatedProgress.streak
        }));
        
        // Refresh challenges
        if (activeChallenge?.dailyChallenge) {
          const updatedDailyChallenges = await api.fetchDailyChallenges();
          setDailyChallenges(updatedDailyChallenges);
        }
        
        // Close challenge modal
        setActiveChallenge(null);
        
      } catch (error) {
        console.error('Error completing challenge:', error);
      }
    } else {
      // Just close the modal if challenge failed
      setActiveChallenge(null);
    }
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-500 bg-green-100';
      case 'intermediate':
        return 'text-yellow-500 bg-yellow-100';
      case 'advanced':
        return 'text-red-500 bg-red-100';
    }
  };

  const getTypeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'coding':
        return <Code className="h-5 w-5" />;
      case 'quiz':
        return <Target className="h-5 w-5" />;
      case 'interactive':
        return <Zap className="h-5 w-5" />;
    }
  };

  // Fixed badges for now - could be fetched from API
  const badges: Badge[] = [
    {
      id: '1',
      name: 'Code Master',
      description: 'Complete 50 coding challenges',
      icon: <Code className="h-6 w-6 text-indigo-500" />,
      achieved: true
    },
    {
      id: '2',
      name: 'Polyglot',
      description: 'Learn 5 different languages',
      icon: <Languages className="h-6 w-6 text-green-500" />,
      achieved: false
    },
    {
      id: '3',
      name: 'Speed Demon',
      description: 'Complete 10 challenges under time limit',
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      achieved: true
    },
    {
      id: '4',
      name: 'Perfect Streak',
      description: 'Maintain a 30-day streak',
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      achieved: false
    }
  ];

  // Fixed leaderboard for now - could be fetched from API
  const leaderboard = [
    { name: 'Sarah Chen', xp: 12500, level: 15, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
    { name: 'Michael Smith', xp: 11200, level: 14, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop' },
    { name: 'Emma Garcia', xp: 10800, level: 13, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop' }
  ];

  // Determine which challenges to display based on active tab
  const displayChallenges = activeTab === 'daily' 
    ? dailyChallenges 
    : activeTab === 'completed' 
      ? completedChallenges 
      : challenges;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Sidebar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with User Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Level and XP */}
            <div className="col-span-2">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Trophy className="h-10 w-10 text-indigo-600" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
                    {userProgress.level}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Level Progress</span>
                    <span className="text-sm font-medium text-indigo-600">
                      {userProgress.xp - userProgress.currentLevelXP}/
                      {userProgress.nextLevelXP - userProgress.currentLevelXP} XP
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${xpProgress()}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Current Streak</p>
                  <p className="text-3xl font-bold">{userProgress.streak} Days</p>
                </div>
                <Flame className="h-12 w-12 opacity-90" />
              </div>
            </div>

            {/* Daily Goal */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Daily Goal</p>
                  <p className="text-3xl font-bold">{userProgress.completedToday}/{userProgress.dailyGoal}</p>
                </div>
                <Target className="h-12 w-12 opacity-90" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('daily')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      activeTab === 'daily'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Calendar className="h-5 w-5 inline mr-2" />
                    Daily Challenges
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      activeTab === 'all'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Zap className="h-5 w-5 inline mr-2" />
                    All Challenges
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      activeTab === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <CheckCircle className="h-5 w-5 inline mr-2" />
                    Completed
                  </button>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Categories</option>
                  <option value="programming">Programming</option>
                  <option value="language">Languages</option>
                </select>
              </div>
            </div>

            {/* Challenge Cards */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-500">Loading challenges...</p>
                </div>
              ) : displayChallenges.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
                  <p className="text-gray-500">No challenges found.</p>
                </div>
              ) : (
                displayChallenges.map((challenge) => (
                  <div
                    key={challenge._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className={`p-2 rounded-lg ${
                            challenge.type === 'coding' ? 'bg-blue-100 text-blue-600' :
                            challenge.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {getTypeIcon(challenge.type)}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                          {challenge.dailyChallenge && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                              Daily
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-gray-600">{challenge.description}</p>
                        {challenge.tags && challenge.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {challenge.tags.map((tag, index) => (
                              <span 
                                key={index} 
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <Star className="h-5 w-5 text-yellow-500 mx-auto" />
                          <span className="block mt-1 text-sm font-medium text-gray-900">{challenge.xp} XP</span>
                        </div>
                        <div className="text-center">
                          <Clock className="h-5 w-5 text-gray-400 mx-auto" />
                          <span className="block mt-1 text-sm text-gray-500">{challenge.timeLimit}m</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => handleStartChallenge(challenge)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Start Challenge
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Badges</h2>
              <div className="grid grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg text-center ${
                      badge.achieved ? 'bg-indigo-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="inline-block p-2 rounded-lg bg-white shadow-sm">
                      {badge.icon}
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{badge.name}</h3>
                    <p className="mt-1 text-xs text-gray-500">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
                <Crown className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="space-y-4">
                {leaderboard.map((user, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        'bg-orange-500'
                      } text-white`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                      <p className="text-xs text-gray-500">Level {user.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-indigo-600">{user.xp.toLocaleString()} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
{/* Active Challenge Modal */}
{activeChallenge && (
        <ActiveChallenge
          challenge={activeChallenge}
          onComplete={(success) => handleChallengeComplete(activeChallenge._id, success)}
          onClose={() => setActiveChallenge(null)}
        />
      )}
      
      {/* Toast for challenge completion */}
      {/* Add toast notification component here */}
    </div>
  );
};

export default Challenges;

