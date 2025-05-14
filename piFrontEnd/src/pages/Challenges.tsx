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
  interests: string[];
}

interface User {
  id?: string;
  _id?: string;
  email?: string;
  username?: string;
  level?: number;
  interests?: string[];
  xp?: number;
}

interface LeaderboardUser {
  username: string;
  xp: number;
  level: number;
  avatar: string;
}

const Challenges = () => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'daily' | 'all' | 'completed'>('recommended');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [showLevelUpToast, setShowLevelUpToast] = useState(false);
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
    'JavaScript', 'Python', 'React',
    'Machine Learning', 'Web Development', 'Frontend', 'Backend', 'C++', 'Java',
    'French', 'Spanish', 'English', 'German', 'Italian', 'Chinese', 'Japanese',
    'Korean', 'Russian', 'Arabic', 'Portuguese'
  ]);
  const [user, setUser] = useState<User | null>(null);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const [showBadgeToast, setShowBadgeToast] = useState(false);
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);

  const calculateProgress = (progress: UserProgress) => {
    if (!progress.nextLevelXP || !progress.currentLevelXP || progress.nextLevelXP <= progress.currentLevelXP) {
      return 100;
    }
    const xpInCurrentLevel = Math.max(0, progress.xp - progress.currentLevelXP);
    const levelDiff = progress.nextLevelXP - progress.currentLevelXP;
    return Math.min(100, Math.max(0, (xpInCurrentLevel / levelDiff) * 100));
  };

  useEffect(() => {
  const loadLeaderboard = async () => {
  try {
    const response = await api.fetchLeaderboard(); // Assuming fetchLeaderboard returns the leaderboard array
    if (Array.isArray(response)) {
      setLeaderboardUsers(response.map(user => ({
        username: `${user.firstName} ${user.lastName}`,  // Combine first and last names
        xp: user.xp || 0,
        level: user.level || 1,
        avatar: user.profileImagePath || '/api/placeholder/150/150'
      })));
    } else {
      console.warn('Unexpected leaderboard response:', response);
      setLeaderboardUsers([]); // Handle unexpected data structure
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    setError('Failed to load leaderboard');
    setLeaderboardUsers([]); // Set empty users if there's an error
  }
};


    const loadUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (!storedUser) {
          setError("No user found in storage. Please login again.");
          setLoading(false);
          return;
        }
        let parsedUser;
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (parseError) {
          console.error("Failed to parse user data:", parseError);
          setError("Invalid user data in storage. Please login again.");
          setLoading(false);
          return;
        }
        const userId = parsedUser.id || parsedUser._id;
        if (!userId) {
          setError("User ID is missing from stored data. Please login again.");
          setLoading(false);
          return;
        }
        setUser(parsedUser);
        try {
          const progress = await api.fetchUserProgress(userId);
          if (progress && progress.length > 0) {
            const level = progress[0]?.level || parsedUser.level || 1;
            let currentLevelXP = 0;
            let nextLevelXP = 1000;
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
              currentLevelXP = 3500 + (level - 4) * 1500;
              nextLevelXP = currentLevelXP + 1500;
            }
            const totalXP = progress[0]?.xp || parsedUser.xp || 0;
            const newProgress = {
              xp: totalXP,
              level: level,
              currentLevelXP,
              nextLevelXP,
              streak: progress[0]?.streak || parsedUser.streak || 0,
              completedToday: progress[0]?.completedToday || parsedUser.completedToday || 0,
              dailyGoal: progress[0]?.dailyGoal || 5,
              lastCompletedDate: progress[0]?.lastCompletedDate || parsedUser.lastCompletedDate || null,
              interests: parsedUser.interests || []
            };
            setUserProgress(newProgress);
            setProgress(calculateProgress(newProgress));
            setUser(prev => ({
              ...prev,
              level: level,
              xp: totalXP,
              streak: progress[0]?.streak || parsedUser.streak || 0,
              completedToday: progress[0]?.completedToday || 0,
              lastCompletedDate: progress[0]?.lastCompletedDate || null
            }));
            localStorage.setItem('user', JSON.stringify({
              ...parsedUser,
              level: level,
              xp: totalXP,
              streak: progress[0]?.streak || parsedUser.streak || 0,
              completedToday: progress[0]?.completedToday || 0,
              lastCompletedDate: progress[0]?.lastCompletedDate || null
            }));
          }
        } catch (progressError) {
          console.error("Failed to fetch user progress:", progressError);
          setError("Failed to load progress data.");
        }
        await loadLeaderboard();
        setLoading(false);
      } catch (error) {
        console.error('Error initializing challenges page:', error);
        setError("Failed to load user data.");
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const loadChallenges = async (tab: 'recommended' | 'daily' | 'all' | 'completed', userId?: string) => {
    setLoading(true);
    try {
      if (!userId && user) {
        userId = user.id || user._id;
      }
      if (!userId) {
        throw new Error("Cannot load challenges: No user ID available");
      }
      switch (tab) {
        case 'daily': {
          const dailyResults = await api.fetchDailyChallenges(userId);
          if (dailyResults.data && Array.isArray(dailyResults.data)) {
            setDailyChallenges(dailyResults.data.filter(challenge => !challenge.completed));
          } else {
            setDailyChallenges([]);
          }
          break;
        }
        case 'recommended': {
          const interests = selectedInterests.length > 0 ? selectedInterests : undefined;
          try {
            const recResults = await fetchRecommendedChallenges(userId, interests);
            setRecommendedChallenges(recResults.filter(challenge => !challenge.completed));
          } catch (mlError) {
            console.error("ML recommendation failed:", mlError);
            setRecommendedChallenges([]);
          }
          break;
        }
        case 'completed': {
          const completedIdsResult = await api.fetchCompletedChallenges(userId);
          if (!completedIdsResult.success || !Array.isArray(completedIdsResult.data)) {
            setCompletedChallenges([]);
            break;
          }
          const completedChallengeIds = completedIdsResult.data.map(item => item._id);
          const uniqueIds = [...new Set(completedChallengeIds)];
          if (uniqueIds.length === 0) {
            setCompletedChallenges([]);
            break;
          }
          try {
            const fullChallengeDetails = await api.fetchChallengesByIds(uniqueIds, userId);
            const completedWithDetails = fullChallengeDetails.map(challenge => {
              const completionInfo = completedIdsResult.data
                .filter(item => item._id === challenge._id)
                .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
              return {
                ...challenge,
                completed: true,
                completedAt: completionInfo?.completedAt || new Date().toISOString()
              };
            });
            setCompletedChallenges(completedWithDetails);
          } catch (detailsError) {
            console.error("Failed to fetch full challenge details:", detailsError);
            setError("Failed to load completed challenge details");
          }
          break;
        }
        case 'all': {
          const allResults = await api.fetchChallenges(selectedCategory, userId);
          if (allResults.data && Array.isArray(allResults.data)) {
            setChallenges(allResults.data.filter(challenge => !challenge.completed));
          } else {
            setChallenges([]);
          }
          break;
        }
      }
    } catch (error) {
      console.error(`Error fetching ${tab} challenges:`, error);
      setError(`Failed to load ${tab} challenges.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const userId = user.id || user._id;
      loadChallenges(activeTab, userId as string);
    }
  }, [activeTab, selectedCategory, user]);

  const handleStartChallenge = (challenge: Challenge) => {
    if (challenge.completed) {
      showPopup("This challenge is already completed!", 'info');
      return;
    }
    setActiveChallenge(challenge);
  };

  const showPopup = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('fixed', 'top-6', 'right-6', 'z-50', 'max-w-sm', 'w-full', 'transform', 'transition-all', 'duration-500');
    popupContainer.style.animation = 'slideInRight 0.3s ease-out forwards';

    let bgColor, iconBgColor, iconColor, borderColor;
    let icon = '';

    switch (type) {
      case 'success':
        bgColor = 'bg-green-50';
        iconBgColor = 'bg-green-100';
        iconColor = 'text-green-600';
        borderColor = 'border-green-200';
        icon = `<svg class="h-6 w-6 ${iconColor}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;
        break;
      case 'error':
        bgColor = 'bg-red-50';
        iconBgColor = 'bg-red-100';
        iconColor = 'text-red-600';
        borderColor = 'border-red-200';
        icon = `<svg class="h-6 w-6 ${iconColor}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;
        break;
      default:
        bgColor = 'bg-blue-50';
        iconBgColor = 'bg-blue-100';
        iconColor = 'text-blue-600';
        borderColor = 'border-blue-200';
        icon = `<svg class="h-6 w-6 ${iconColor}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    }

    popupContainer.innerHTML = `
      <div class="rounded-lg shadow-lg ${bgColor} border ${borderColor} overflow-hidden">
        <div class="p-4 flex items-start">
          <div class="flex-shrink-0">
            <div class="rounded-full p-2 ${iconBgColor}">
              ${icon}
            </div>
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium text-gray-900">${message}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button class="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div class="h-1 ${type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'} w-full" id="progress-bar"></div>
      </div>
    `;

    document.body.appendChild(popupContainer);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        0% { opacity: 0; transform: translateX(100%); }
        100% { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideOutRight {
        0% { opacity: 1; transform: translateX(0); }
        100% { opacity: 0; transform: translateX(100%); }
      }
      @keyframes progressShrink {
        0% { width: 100%; }
        100% { width: 0%; }
      }
    `;
    document.head.appendChild(style);

    const progressBar = popupContainer.querySelector('#progress-bar');
    if (progressBar) {
      progressBar.style.animation = 'progressShrink 3s linear forwards';
    }

    const closeButton = popupContainer.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        popupContainer.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
          if (document.body.contains(popupContainer)) {
            document.body.removeChild(popupContainer);
          }
        }, 300);
      });
    }

    setTimeout(() => {
      popupContainer.style.animation = 'slideOutRight 0.3s ease-in forwards';
      setTimeout(() => {
        if (document.body.contains(popupContainer)) {
          document.body.removeChild(popupContainer);
        }
      }, 300);
    }, 3000);
  };

  const handleChallengeComplete = async (challengeId: string, success: boolean) => {
    if (!success) {
      showPopup("Challenge failed", 'error');
      setActiveChallenge(null);
      return;
    }

    try {
      const userId = user?.id || user?._id;
      if (!userId) {
        throw new Error("User ID not available");
      }

      const completedChallenge = [...recommendedChallenges, ...dailyChallenges, ...challenges]
        .find(c => c._id === challengeId);

      if (!completedChallenge) {
        throw new Error("Challenge not found");
      }

      const result = await api.completeChallenge(challengeId, userId);
      const previousLevel = userProgress.level;

      setEarnedXp(completedChallenge.xp);
      setShowXpAnimation(true);
      setTimeout(() => setShowXpAnimation(false), 3000);

      // Update challenge lists to remove completed challenge
      setRecommendedChallenges(prev => prev.filter(c => c._id !== challengeId));
      setDailyChallenges(prev => prev.filter(c => c._id !== challengeId));
      setChallenges(prev => prev.filter(c => c._id !== challengeId));

      // Add to completed challenges
      const justCompletedChallenge = {
        ...completedChallenge,
        completed: true,
        completedAt: new Date().toISOString()
      };
      setCompletedChallenges(prev => [justCompletedChallenge, ...prev]);

      // Update streak and daily goal
      const today = new Date().toISOString().split('T')[0];
      const lastDate = userProgress.lastCompletedDate?.split('T')[0];
      let newStreak = userProgress.streak;
      let newCompletedToday = userProgress.completedToday;

      if (!lastDate || lastDate < today) {
        newCompletedToday = 1;
        if (lastDate === new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]) {
          newStreak += 1;
          setStreakAnimation(true);
          setTimeout(() => setStreakAnimation(false), 3000);
        } else {
          newStreak = 1;
        }
      } else if (lastDate === today) {
        newCompletedToday += 1;
      }

      const newProgress = {
        ...userProgress,
        xp: result.xp,
        level: result.level,
        currentLevelXP: result.currentLevelXP,
        nextLevelXP: result.nextLevelXP,
        streak: newStreak,
        completedToday: newCompletedToday,
        lastCompletedDate: new Date().toISOString()
      };

      setUserProgress(newProgress);
      setProgress(calculateProgress(newProgress));

      if (result.level > previousLevel) {
        setShowLevelUpToast(true);
        setTimeout(() => setShowLevelUpToast(false), 5000);
      }

      setUser(prev => prev ? {
        ...prev,
        xp: result.xp,
        level: result.level,
        streak: newStreak,
        completedToday: newCompletedToday,
        lastCompletedDate: new Date().toISOString()
      } : null);

      // Update storage
      localStorage.setItem('user', JSON.stringify({
        ...user,
        xp: result.xp,
        level: result.level,
        streak: newStreak,
        completedToday: newCompletedToday,
        lastCompletedDate: new Date().toISOString()
      }));

      setActiveChallenge(null);
      showPopup("Challenge completed successfully!", 'success');

      // Check for new badges
      const newlyAchievedBadges = badges.filter(b => {
        const wasAchieved = b.achieved;
        b.achieved = checkBadgeAchieved(b);
        return !wasAchieved && b.achieved;
      });

      if (newlyAchievedBadges.length > 0) {
        setNewBadges(newlyAchievedBadges);
        setShowBadgeToast(true);
        setTimeout(() => setShowBadgeToast(false), 5000);
      }

    } catch (error) {
      console.error('Error completing challenge:', error);
      setError("Failed to record challenge completion.");
      setActiveChallenge(null);
    }
  };

   const handleSaveInterests = async () => {
    try {
      if (!user) {
        throw new Error("No user data available.");
      }
  
      const userId = user._id || user.id;
  
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
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500 bg-green-100';
      case 'intermediate': return 'text-yellow-500 bg-yellow-100';
      case 'advanced': return 'text-red-500 bg-red-100';
    }
  };

  const getTypeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'coding': return <Code className="h-5 w-5" />;
      case 'quiz': return <Target className="h-5 w-5" />;
      case 'interactive': return <Zap className="h-5 w-5" />;
    }
  };

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

  const checkBadgeAchieved = (badge: Badge) => {
    switch (badge.id) {
      case '1':
        return completedChallenges.filter(c => c.type === 'coding').length >= 50;
      case '2':
        return new Set(completedChallenges.map(c => c.category)).size >= 5;
      case '3':
        return completedChallenges.length >= 10;
      case '4':
        return userProgress.streak >= 30;
      case '5':
        return userProgress.level >= 10;
      default:
        return false;
    }
  };

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

  const getActiveChallenges = () => {
    switch (activeTab) {
      case 'recommended': return recommendedChallenges;
      case 'daily': return dailyChallenges;
      case 'completed': return completedChallenges;
      default: return challenges;
    }
  };

  const dailyGoalProgress = (completedToday: number, dailyGoal: number) => {
    return Math.min(100, (completedToday / dailyGoal) * 100);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ErrorBanner />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Total XP: {userProgress.xp}
                      </div>
                    </div>
                  </div>
                </div>

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
              <div className="lg:col-span-3">
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

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getActiveChallenges().length > 0 ? (
                      getActiveChallenges().map((challenge, index) => (
                        <div
                          key={`${challenge._id}-${index}`}
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
                              {challenge.completed && (
                                <p className="mt-2 text-sm text-gray-500">
                                  Completed: {formatCompletionDate(challenge.completedAt || '')}
                                </p>
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

              <div className="space-y-6">
                <button
                  onClick={() => setShowInterestsModal(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-sm hover:from-purple-600 hover:to-indigo-700 flex items-center justify-center font-medium mb-6"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Update Your Interests
                </button>

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

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
                    <Crown className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="space-y-4">
                    {leaderboardUsers.length > 0 ? (
                      leaderboardUsers.map((user, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex-shrink-0 relative">
                            <img
                              src={user.avatar}
                              alt={user.username}
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
                            <h3 className="text-sm font-medium text-gray-900">{user.username}</h3>
                            <p className="text-xs text-gray-500">Level {user.level}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-indigo-600">{user.xp.toLocaleString()} XP</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No leaderboard data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {showLevelUpToast && (
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