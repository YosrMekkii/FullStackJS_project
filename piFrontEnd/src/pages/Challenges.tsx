import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ActiveChallenge from '../components/ActiveChallenge';
import api from '../services/api';
import fetchRecommendedChallenges from '../services/MLapi.ts';
import {
  Trophy,
  Star,
  Zap,
  XCircle,
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
  Heart,
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
  completedAt?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  achieved: boolean;
}

interface UserProgress {
  level: number;
  streak: number;
  completedToday: number;
  dailyGoal: number;
  lastCompletedDate: string | null;
  xp: number;
  currentLevelXP: number;
  nextLevelXP: number;
  interests: string[]; // Fixed the typo from "intereststs"
}

interface User {
  id?: string;
  _id?: string;
  email?: string;
  username?: string;
  level?: number;
  interests?: string[];
}

const Challenges = () => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'daily' | 'all' | 'completed'>('recommended');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [showLevelUpToast, setShowLevelUpToast] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(1);
  const [progress, setProgress] = useState(0);

  const [userProgress, setUserProgress] = useState<UserProgress>({
    xp: 0,
    level: 1,
    currentLevelXP: 0,
    nextLevelXP: 1000,
    streak: 0,
    completedToday: 0,
    dailyGoal: 5,
    interests: [],
    lastCompletedDate: null,
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
  const [error, setError] = useState<string | null>(null);


  

  // Load user data
  useEffect(() => {const calculateProgress = () => {
  // Handle edge cases
  if (userProgress.nextLevelXP <= userProgress.currentLevelXP) return 100;
  if (userProgress.xp < userProgress.currentLevelXP) return 0;
  
  const levelDiff = userProgress.nextLevelXP - userProgress.currentLevelXP;
  if (levelDiff <= 0) return 100;
  
  const xpInCurrentLevel = userProgress.xp - userProgress.currentLevelXP;
  const calculatedProgress = (xpInCurrentLevel / levelDiff) * 100;
  
  // Ensure progress is between 0 and 100
  return Math.max(0, Math.min(100, calculatedProgress));
};

    
    const progress = calculateProgress();
    const updateUserInStorage = (userData) => {
      try {
        // Get the current stored user data
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        
        if (storedUser) {
          // Parse existing data
          const existingData = JSON.parse(storedUser);
          
          // Merge with new data, preserving the ID and other essential fields
          const updatedData = {
            ...existingData,
            ...userData,
            // Make sure ID is preserved with either id or _id format
            id: existingData.id || existingData._id,
            _id: existingData._id || existingData.id
          };
          
          // Store back in the same storage that was used originally
          if (localStorage.getItem("user")) {
            localStorage.setItem("user", JSON.stringify(updatedData));
          } else {
            sessionStorage.setItem("user", JSON.stringify(updatedData));
          }
          
          console.log("User data updated in storage:", updatedData);
        } else {
          console.warn("No user data found in storage to update");
        }
      } catch (error) {
        console.error("Error updating user in storage:", error);
      }
    };
    

    const loadUserData = async () => {
      try {
        // Get user from storage
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        
        if (!storedUser) {
          setError("No user found in storage. Please login again.");
          setLoading(false);
          return;
        }
        
        // Parse user data with error handling
        let parsedUser;
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (parseError) {
          console.error("Failed to parse user data:", parseError);
          setError("Invalid user data in storage. Please login again.");
          setLoading(false);
          return;
        }
        
        console.log("Parsed user data:", parsedUser);
        
        // Validate the user object has the required fields
        const userId = parsedUser.id || parsedUser._id;
        if (!userId) {
          setError("User ID is missing from stored data. Please login again.");
          setLoading(false);
          return;
        }
        
        setUser(parsedUser);
        
        // Fetch user progress with error handling
        try {
          // First initialize with values from localStorage to prevent flashing
          if (parsedUser.level) {
            setUserProgress(prev => ({
              ...prev,
              level: parsedUser.level || 1,
              xp: parsedUser.xp || 0,
              streak: parsedUser.streak || 0,
              completedToday: parsedUser.completedToday || 0,
              lastCompletedDate: parsedUser.lastCompletedDate || null,
              interests: parsedUser.interests || []
            }));
          }
    
          // Then fetch from API
          const progress = await api.fetchUserProgress(userId);
          console.log("Fetched user progress:", progress);
          
          // If we have progress data from the API, use the most recent/complete information
          if (progress && progress.length > 0) {
            // Calculate currentLevelXP and nextLevelXP based on level
            // This is assuming your level thresholds follow a pattern like:
            // Level 1: 0-1000 XP
            // Level 2: 1000-2000 XP
            // Level 3: 2000-3500 XP etc.
            const level = progress[0]?.level || parsedUser.level || 1;
            let currentLevelXP = 0;
            let nextLevelXP = 1000;
            
            // Simple progression formula (adjust to match your backend logic)
            if (level === 1) {
              currentLevelXP = 0;
              nextLevelXP = 1000;
            } else if (level === 2) {
              currentLevelXP = 1000;
              nextLevelXP = 2000;
            } else if (level === 3) {
              currentLevelXP = 2000;
              nextLevelXP = 3500;
            } else if (level >= 4) {
              // For level 4+, increase by 1500 per level
              currentLevelXP = 3500 + (level - 4) * 1500;
              nextLevelXP = currentLevelXP + 1500;
            }
            
            // Use the provided XP or calculate from the progress data
            const totalXP = progress[0]?.xp || parsedUser.xp || 0;
            
            setUserProgress(prev => ({
              ...prev,
              xp: totalXP,
              level: level,
              currentLevelXP: currentLevelXP,
              nextLevelXP: nextLevelXP,
              streak: progress[0]?.streak || parsedUser.streak || 0,
              completedToday: progress[0]?.completedToday || parsedUser.completedToday || 0,
              dailyGoal: 5, // Default to 5 if not provided
              lastCompletedDate: progress[0]?.lastCompletedDate || parsedUser.lastCompletedDate || null,
              interests: parsedUser.interests || []
            }));
            
            // Also ensure user state has these values
            setUser(prev => ({
              ...prev,
              level: level,
              xp: totalXP,
              streak: progress[0]?.streak || parsedUser.streak || 0,
              completedToday: progress[0]?.completedToday || 0,
              lastCompletedDate: progress[0]?.lastCompletedDate || null
            }));
            
            // Save these values back to storage to ensure consistency
            updateUserInStorage({
              level: level,
              xp: totalXP,
              streak: progress[0]?.streak || parsedUser.streak || 0,
              completedToday: progress[0]?.completedToday || 0,
              lastCompletedDate: progress[0]?.lastCompletedDate || null
            });
          }
          
        } catch (progressError) {
          console.error("Failed to fetch user progress:", progressError);
          setError("Failed to load progress data. Using cached data if available.");
          // Continue with what data we have from local storage
        }
        
        // Fix for progress calculation
        const calculatedProgress = calculateProgress();
        setProgress(calculatedProgress);
        
        // Set loading to false even if progress fetch fails
        setLoading(false);
      } catch (error) {
        console.error('Error initializing challenges page:', error);
        setError("Failed to load user data. Please try refreshing the page.");
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Load challenges based on active tab
  const loadChallenges = async (tab: 'recommended' | 'daily' | 'all' | 'completed', userId?: string) => {
    setLoading(true);
    try {
      if (!userId && user) {
        userId = user.id || user._id;
      }
      
      if (!userId) {
        throw new Error("Cannot load challenges: No user ID available");
      }
      
      console.log(`Loading ${tab} challenges for user ID: ${userId}`);
      
      switch (tab) {
        case 'daily': {
          const dailyResults = await api.fetchDailyChallenges(userId);
          console.log("Fetched daily challenges:", dailyResults);
          setDailyChallenges(dailyResults);
          break;
        }
        case 'recommended': {
          // Get user interests to pass to the recommendation function
          const interests = selectedInterests.length > 0 ? selectedInterests : undefined;
          
          try {
            // First try the ML recommendation system
            console.log("Attempting to fetch ML-based recommendations...");
            const recResults = await fetchRecommendedChallenges(userId, interests);
            console.log("Fetched ML-based recommended challenges:", recResults);
            
            // Add a source property to identify ML recommendations
            const enhancedResults = recResults.map(challenge => ({
              ...challenge,
              source: 'ml', // Tag these as coming from the ML system
            }));
            
            setRecommendedChallenges(enhancedResults);
          } catch (mlError) {
            // If ML recommendation fails, log the error and use the fallback
            console.error("ML recommendation failed, using fallback:", mlError);
            
            // The fallback is already implemented in the fetchRecommendedChallenges function
            // It will automatically use the original API if the ML service fails
          }
          
          break;
        }
        case 'completed': {
          const compResults = await api.fetchCompletedChallenges(userId);
          console.log("Fetched completed challenges:", compResults);
          setCompletedChallenges(compResults);
          break;
        }
        case 'all': {
          const allResults = await api.fetchChallenges(selectedCategory, userId);
          console.log(`Fetched all challenges with category ${selectedCategory}:`, allResults);
          setChallenges(allResults);
          break;
        }
      }
      
    } catch (error) {
      console.error(`Error fetching ${tab} challenges:`, error);
      setError(`Failed to load ${tab} challenges. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  useEffect(() => {
    if (user) {
      const userId = user.id || user._id;
      loadChallenges(activeTab, userId as string);
    }
  }, [activeTab, selectedCategory, user]);

  const handleStartChallenge = (challenge: Challenge) => {
    // Don't allow starting completed challenges
    if (challenge.completed) {
      console.log("Cannot start completed challenge");
      return;
    }
    
    console.log("Starting challenge:", challenge);
    setActiveChallenge(challenge);
  };
  
  const handleChallengeComplete = async (challengeId: string, success: boolean) => {
    if (!success) {
      console.log("Challenge failed, just closing modal");
      setActiveChallenge(null);
      return;
    }
    
    try {
      console.log(`Challenge ${challengeId} completed successfully, recording completion`);
      
      // Get user ID
      const userId = user?.id || user?._id;
      if (!userId) {
        throw new Error("User ID not available");
      }
      
      // Find the challenge that was completed before making the API call
      const completedChallenge = [...recommendedChallenges, ...dailyChallenges, ...challenges, ...completedChallenges]
        .find(c => c._id === challengeId);
        
      if (!completedChallenge) {
        throw new Error("Challenge not found");
      }
      
      // Call API to record completion
      const result = await api.completeChallenge(challengeId, userId as string);
      console.log("Challenge completion result:", result);
      
      // Store previous level to check for level up
      const previousLevel = userProgress.level;
      
      // Get challenge XP for animation
      // Show XP animation
      setEarnedXp(completedChallenge.xp);
      setShowXpAnimation(true);
      
      // Hide XP animation after 3 seconds
      setTimeout(() => {
        setShowXpAnimation(false);
      }, 3000);
      
      // Remove the completed challenge from its current list
      // Check which list contains the challenge and update it
      if (activeTab === 'recommended') {
        setRecommendedChallenges(prev => prev.filter(c => c._id !== challengeId));
      } else if (activeTab === 'daily') {
        setDailyChallenges(prev => prev.filter(c => c._id !== challengeId));
      } else if (activeTab === 'all') {
        setChallenges(prev => prev.filter(c => c._id !== challengeId));
      }
      
      // Add challenge to completed list with completion timestamp
      const justCompletedChallenge = {
        ...completedChallenge,
        completed: true,
        completedAt: new Date().toISOString()
      };
      setCompletedChallenges(prev => [justCompletedChallenge, ...prev]);
      
      // Check if streak increased
      if (result.streak > userProgress.streak) {
        console.log("Streak increased! Showing animation");
        setStreakAnimation(true);
        
        // Hide streak animation after 4 seconds
        setTimeout(() => {
          setStreakAnimation(false);
        }, 4000);
      }
      
      // Update user progress with new data
      setUserProgress(prev => ({
        ...prev,
        xp: result.xp,
        level: result.level,
        currentLevelXP: result.currentLevelXP,
        nextLevelXP: result.nextLevelXP,
        streak: result.streak,
        completedToday: result.completedToday,
        lastCompletedDate: result.lastCompletedDate
      }));
      
      // Update the level in the user object as well to ensure it persists
      setUser(prev => prev ? {
        ...prev,
        level: result.level,
        streak: result.streak,
        completedToday: result.completedToday,
        lastCompletedDate: result.lastCompletedDate
      } : null);
      
      // Save user data to storage including streak and daily goals
      const dataToSave = {
        ...result,
        interests: selectedInterests
      };
      const updateUserInStorage = (userData) => {
        try {
          // Get the current stored user data
          const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
          
          if (storedUser) {
            // Parse existing data
            const existingData = JSON.parse(storedUser);
            
            // Merge with new data, preserving the ID and other essential fields
            const updatedData = {
              ...existingData,
              ...userData,
              // Make sure ID is preserved with either id or _id format
              id: existingData.id || existingData._id,
              _id: existingData._id || existingData.id
            };
            
            // Store back in the same storage that was used originally
            if (localStorage.getItem("user")) {
              localStorage.setItem("user", JSON.stringify(updatedData));
            } else {
              sessionStorage.setItem("user", JSON.stringify(updatedData));
            }
            
            console.log("User data updated in storage:", updatedData);
          } else {
            console.warn("No user data found in storage to update");
          }
        } catch (error) {
          console.error("Error updating user in storage:", error);
        }
      };
      updateUserInStorage(dataToSave);
      
      // Check for level up
      if (result.level > previousLevel) {
        setShowLevelUpToast(true);
        setPreviousLevel(result.level);
        
        // Hide level up toast after 5 seconds
        setTimeout(() => {
          setShowLevelUpToast(false);
        }, 5000);
      }
      
      // Check for new badges
      if (result.newBadges && result.newBadges.length > 0) {
        console.log("New badges earned:", result.newBadges);
        setNewBadges(result.newBadges);
        setShowBadgeToast(true);
        
        // Hide toast after 5 seconds
        setTimeout(() => {
          setShowBadgeToast(false);
        }, 5000);
      }
      
      // Close challenge modal
      setActiveChallenge(null);
      
    } catch (error) {
      console.error('Error completing challenge:', error);
      setError("Failed to record challenge completion. Please try again.");
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
      
      console.log(`Saving interests for user ${userId}:`, selectedInterests);
      
      // Update interests via API
      const result = await api.updateUserInterests(userId as string, selectedInterests);
      console.log("Interests update result:", result);
  
      // Update local state
      setUserProgress(prev => ({
        ...prev,
        interests: selectedInterests
      }));
      
      // Update user object as well
      setUser(prev => prev ? {
        ...prev,
        interests: selectedInterests
      } : null);
  
      // If we're on recommended tab, refresh recommendations
      if (activeTab === 'recommended') {
        await loadChallenges('recommended', userId as string);
      }
  
      setShowInterestsModal(false);
    } catch (error) {
      console.error('Error saving interests:', error);
      setError("Failed to save interests. Please try again later.");
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

  // Format date for completed challenges
  const formatCompletionDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Badges
  const badges: Badge[] = [
    {
      id: '1',
      name: 'Code Master',
      description: 'Complete 50 coding challenges',
      icon: <Code className="h-6 w-6 text-indigo-500" />,
      achieved: completedChallenges.filter(c => c.type === 'coding').length >= 50
    },
    {
      id: '2',
      name: 'Polyglot',
      description: 'Learn 5 different languages',
      icon: <Languages className="h-6 w-6 text-green-500" />,
      achieved: new Set(completedChallenges.map(c => c.category)).size >= 5
    },
    {
      id: '3',
      name: 'Speed Demon',
      description: 'Complete 10 challenges under time limit',
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      achieved: completedChallenges.length >= 10
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

  // Error display component
  const ErrorBanner = () => {
    if (!error) return null;
    
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm">{error}</p>
          </div>
          <div className="ml-auto">
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Helper for daily goal progress circle
  const dailyGoalProgress = (completedToday: number, dailyGoal: number) => {
    const percentage = Math.min(100, (completedToday / dailyGoal) * 100);
    return percentage;
  };

  // Debug function to log state (for development only)
  const debugState = () => {
    console.log({
      user,
      userProgress,
      progress: Math.round(progress),
      xp: userProgress.xp,
      currentLevelXP: userProgress.currentLevelXP,
      nextLevelXP: userProgress.nextLevelXP
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Error Display */}
            <ErrorBanner />
            
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
                          {Math.max(0, userProgress.xp - userProgress.currentLevelXP)}/
                          {Math.max(1, userProgress.nextLevelXP - userProgress.currentLevelXP)} XP
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Total XP: {userProgress.xp}
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
                      <p className="text-xs mt-1 opacity-80">
                        {userProgress.lastCompletedDate 
                          ? `Last completed: ${new Date(userProgress.lastCompletedDate).toLocaleDateString()}` 
                          : 'Complete a challenge today!'}
                      </p>
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
                      <div className="mt-1 h-2 bg-blue-700 bg-opacity-40 rounded-full w-full">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-300"
                          style={{ width: `${dailyGoalProgress(userProgress.completedToday, userProgress.dailyGoal)}%` }}
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <Target className="h-12 w-12 opacity-90" />
                      {userProgress.completedToday >= userProgress.dailyGoal && (
                        <CheckCircle2 className="h-6 w-6 text-green-300 absolute -bottom-1 -right-1 bg-blue-600 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex space-x-4 flex-wrap">
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
                        {availableInterests.map(interest => (
                          <option key={interest} value={interest}>{interest}</option>
                        ))}
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
            <p className="text-gray-600 mb-4">Select topics you're interested in to get personalized challenges.</p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {availableInterests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`p-2 text-sm rounded-lg transition-colors ${
                    selectedInterests.includes(interest)
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowInterestsModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInterests}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                disabled={selectedInterests.length === 0}
              >
                Save Interests
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Challenge Modal */}
      {activeChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{activeChallenge.title}</h2>
              <button
                onClick={() => setActiveChallenge(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <ActiveChallenge 
              challenge={activeChallenge} 
              onComplete={handleChallengeComplete}
            />
          </div>
        </div>
      )}

      {/* XP Animation */}
      {showXpAnimation && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-center animate-bounce">
            <div className="text-5xl font-bold text-indigo-600 drop-shadow-lg">
              +{earnedXp} XP
            </div>
            <div className="text-2xl font-semibold text-yellow-500 mt-2">
              Great job!
            </div>
          </div>
        </div>
      )}

      {/* Streak Animation */}
      {streakAnimation && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-center animate-pulse">
            <div className="flex items-center justify-center space-x-3">
              <Flame className="h-16 w-16 text-orange-500" />
              <div>
                <div className="text-3xl font-bold text-orange-500 drop-shadow-lg">
                  {userProgress.streak} Day Streak!
                </div>
                <div className="text-xl font-semibold text-yellow-500 mt-1">
                  Keep it going!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Toast */}
      {showBadgeToast && newBadges.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-indigo-200 p-4 max-w-md animate-slideIn">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Medal className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">New Badge Unlocked!</h3>
                <p className="text-gray-600">{newBadges[0].name} - {newBadges[0].description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Toast */}
      {userProgress.level > 1 && (
        <div className="fixed bottom-6 left-6 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-indigo-200 p-4 max-w-md animate-slideIn">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Level Up!</h3>
                <p className="text-gray-600">You're now level {userProgress.level}!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;