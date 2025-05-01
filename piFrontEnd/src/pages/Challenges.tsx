import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ActiveChallenge from '../components/ActiveChallenge';
import api from '../services/api';
import {
  Trophy,
  Star,
  Zap,
  Award,
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  Code,
  Languages,
  Flame,
  Crown,
  Medal,
  TrendingUp,
  Heart
} from 'lucide-react';

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
  relevanceScore?: number;
  completed?: boolean;
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
  interests: string[];
}

interface User {
  id?: string;
  _id?: string;
  email?: string;
  username?: string;
}

const Challenges = () => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'daily' | 'all' | 'completed'>('recommended');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [userProgress, setUserProgress] = useState<UserProgress>({
    xp: 0,
    level: 1,
    currentLevelXP: 0,
    nextLevelXP: 1000,
    streak: 0,
    completedToday: 0,
    dailyGoal: 5,
    interests: []
  });
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [recommendedChallenges, setRecommendedChallenges] = useState<Challenge[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [availableInterests, setAvailableInterests] = useState<string[]>([
    'JavaScript', 'Python', 'React', 'Data Structures', 'Algorithms', 
    'Machine Learning', 'Web Development', 'Mobile Development',
    'Databases', 'System Design', 'Frontend', 'Backend'
  ]);
  const [user, setUser] = useState<User | null>(null);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const [showBadgeToast, setShowBadgeToast] = useState(false);
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);

  // Progress calculations
  const progress = (userProgress.xp - userProgress.currentLevelXP) / 
                   (userProgress.nextLevelXP - userProgress.currentLevelXP) * 100;

  // Load user data
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
      }
    }
  }, []);

  // Fetch user progress and interests
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          api.setAuthToken(token);
          const progress = await api.fetchUserProgress();
          setUserProgress(progress);
          
          if (progress.interests && progress.interests.length > 0) {
            setSelectedInterests(progress.interests);
          } else {
            setShowInterestsModal(true);
          }
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
          
          if (activeTab === 'daily') {
            const dailyChallenges = await api.fetchDailyChallenges();
            setDailyChallenges(dailyChallenges);
          } else if (activeTab === 'recommended') {
            const recommendedChallenges = await api.fetchRecommendedChallenges();
            setRecommendedChallenges(recommendedChallenges);
          } else if (activeTab === 'completed') {
            const completedChallenges = await api.fetchCompletedChallenges();
            setCompletedChallenges(completedChallenges);
          } else {
            // 'all' tab
            const allChallenges = await api.fetchChallenges(selectedCategory);
            setChallenges(allChallenges);
          }
        }
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadChallenges();
    }
  }, [activeTab, selectedCategory, user]);

  const handleStartChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
  };

  const handleChallengeComplete = async (challengeId: string, success: boolean) => {
    if (success) {
      try {
        // Call API to record completion
        const result = await api.completeChallenge(challengeId);
        
        // Get challenge XP for animation
        const challenge = [...recommendedChallenges, ...dailyChallenges, ...challenges, ...completedChallenges]
          .find(c => c._id === challengeId);
        
        if (challenge) {
          setEarnedXp(challenge.xp);
          setShowXpAnimation(true);
          
          // Hide XP animation after 3 seconds
          setTimeout(() => {
            setShowXpAnimation(false);
          }, 3000);
        }
        
        // Check if streak increased
        if (result.streak > userProgress.streak) {
          setStreakAnimation(true);
          
          // Hide streak animation after 4 seconds
          setTimeout(() => {
            setStreakAnimation(false);
          }, 4000);
        }
        
        // Update user progress
        setUserProgress(prev => ({
          ...prev,
          xp: result.xp,
          level: result.level,
          currentLevelXP: result.currentLevelXP,
          nextLevelXP: result.nextLevelXP,
          streak: result.streak,
          completedToday: result.completedToday
        }));
        
        // Check if there are new badges
        if (result.newBadges && result.newBadges.length > 0) {
          setNewBadges(result.newBadges);
          setShowBadgeToast(true);
          
          // Hide toast after 5 seconds
          setTimeout(() => {
            setShowBadgeToast(false);
          }, 5000);
        }
        
        // Refresh challenges based on active tab
        if (activeTab === 'daily') {
          const updatedDailyChallenges = await api.fetchDailyChallenges();
          setDailyChallenges(updatedDailyChallenges);
        } else if (activeTab === 'recommended') {
          const updatedRecommendedChallenges = await api.fetchRecommendedChallenges();
          setRecommendedChallenges(updatedRecommendedChallenges);
        } else if (activeTab === 'completed') {
          const updatedCompletedChallenges = await api.fetchCompletedChallenges();
          setCompletedChallenges(updatedCompletedChallenges);
        } else {
          const updatedChallenges = await api.fetchChallenges(selectedCategory);
          setChallenges(updatedChallenges);
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

  const handleSaveInterests = async () => {
    try {
      if (!user) {
        throw new Error("No user data available.");
      }
  
      const userId = user.id || user._id;
  
      if (!userId) {
        throw new Error("User ID not found in user object.");
      }
  
      await api.updateUserInterests(userId, selectedInterests);
  
      setUserProgress(prev => ({
        ...prev,
        interests: selectedInterests
      }));
  
      if (activeTab === 'recommended') {
        const updatedRecommendedChallenges = await api.fetchRecommendedChallenges(userId);
        setRecommendedChallenges(updatedRecommendedChallenges);
      }
  
      setShowInterestsModal(false);
    } catch (error) {
      console.error('Error saving interests:', error);
      alert('Failed to save interests. Please try again later.');
    }
  };
  
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
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

  // Badges
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
      achieved: userProgress.streak >= 30
    },
    {
      id: '5',
      name: 'Rising Star',
      description: 'Reach level 10',
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      achieved: userProgress.level >= 10
    }
  ];

  // Display active challenges based on selected tab
  const getActiveChallenges = () => {
    switch (activeTab) {
      case 'recommended':
        return recommendedChallenges;
      case 'daily':
        return dailyChallenges;
      case 'completed':
        return completedChallenges;
      default:
        return challenges;
    }
  };

  // Example leaderboard data
  const leaderboardUsers = [
    { name: 'Sarah Chen', xp: 12500, level: 15, avatar: '/api/placeholder/150/150' },
    { name: 'Michael Smith', xp: 11200, level: 14, avatar: '/api/placeholder/150/150' },
    { name: 'Emma Garcia', xp: 10800, level: 13, avatar: '/api/placeholder/150/150' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        <span className="text-sm font-medium text-indigo-600">{userProgress.xp - userProgress.currentLevelXP}/{userProgress.nextLevelXP - userProgress.currentLevelXP} XP</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div className={`bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white ${streakAnimation ? 'animate-pulse' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Current Streak</p>
                      <p className="text-3xl font-bold">{userProgress.streak} Days</p>
                    </div>
                    <Flame className={`h-12 w-12 opacity-90 ${streakAnimation ? 'animate-bounce' : ''}`} />
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
                        onClick={() => setActiveTab('recommended')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          activeTab === 'recommended'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Star className="h-5 w-5 inline mr-2" />
                        Recommended
                      </button>
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
                        <Target className="h-5 w-5 inline mr-2" />
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
                        <CheckCircle2 className="h-5 w-5 inline mr-2" />
                        Completed
                      </button>
                    </div>
                    {activeTab === 'all' && (
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">All Categories</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Python">Python</option>
                        <option value="React">React</option>
                        <option value="Data Structures">Data Structures</option>
                        <option value="Algorithms">Algorithms</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Challenge Cards */}
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getActiveChallenges().length > 0 ? (
                      getActiveChallenges().map((challenge) => (
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
                            {challenge.completed ? (
                              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center">
                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                Completed
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleStartChallenge(challenge)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                              >
                                Start Challenge
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-700">No challenges found</h3>
                        <p className="text-gray-500">Try selecting a different category or tab</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Interests Button */}
                <button 
                  onClick={() => setShowInterestsModal(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-sm hover:from-purple-600 hover:to-indigo-700 flex items-center justify-center font-medium mb-6"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Update Your Interests
                </button>
                
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
                    {leaderboardUsers.map((user, index) => (
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
        </div>
      </div>

      {/* Interests modal */}
      {showInterestsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Your Coding Interests</h2>
            <p className="text-gray-600 mb-4">
              Select topics you're interested in to get personalized challenge recommendations.
            </p>
            
            <div className="grid grid-cols-2 gap-2 mb-6">
              {availableInterests.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`p-2 rounded-md text-sm ${
                    selectedInterests.includes(interest)
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowInterestsModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInterests}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={selectedInterests.length === 0}
              >
                Save Interests
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* XP gained animation */}
      {showXpAnimation && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg animate-bounce-up">
            +{earnedXp} XP
          </div>
        </div>
      )}

      {/* New badge toast notification */}
      {showBadgeToast && newBadges.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-white rounded-lg shadow-xl p-4 border-l-4 border-indigo-500 max-w-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-indigo-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">New Badge Earned!</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Congratulations! You've earned the "{newBadges[0].name}" badge.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active challenge modal */}
      {activeChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ActiveChallenge 
              challenge={activeChallenge} 
              onComplete={handleChallengeComplete} 
              onClose={() => setActiveChallenge(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;