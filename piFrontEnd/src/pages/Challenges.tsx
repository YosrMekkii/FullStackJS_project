import React, { useState } from 'react';
import {
  Trophy,
  Star,
  Zap,
  Award,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  Code,
  Languages,
  Flame,
  Crown,
  Medal,
  TrendingUp
} from 'lucide-react';
import ActiveChallenge from '../components/ActiveChallenge';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'quiz' | 'interactive';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp: number;
  timeLimit: number;
  completed: boolean;
  category: string;
  content?: ChallengeContent;
}

interface ChallengeContent {
  question?: string;
  options?: string[];
  code?: string;
  correctAnswer?: string | string[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  achieved: boolean;
}

const Challenges = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'completed'>('daily');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userLevel, setUserLevel] = useState(5);
  const [userXP, setUserXP] = useState(2750);
  const [streak, setStreak] = useState(7);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);

  const xpToNextLevel = 5000;
  const progress = (userXP / xpToNextLevel) * 100;

  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'Debug the React Component',
      description: 'Find and fix bugs in a React component with TypeScript integration.',
      type: 'coding',
      difficulty: 'intermediate',
      xp: 150,
      timeLimit: 30,
      completed: false,
      category: 'programming',
      content: {
        code: `
interface Props {
  name: string;
  age: number;
}

const UserProfile: React.FC<Props> = (props) => {
  const [isActive, setIsActive] = useState();
  
  useEffect(() => {
    setIsActive(true);
  });

  return (
    <div>
      <h1>{props.name}</h1>
      <p>Age: {props.ages}</p>
      <button onClick={setIsActive(!isActive)}>
        {isActive ? 'Active' : 'Inactive'}
      </button>
    </div>
  );
};`,
        correctAnswer: `
interface Props {
  name: string;
  age: number;
}

const UserProfile: React.FC<Props> = (props) => {
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    setIsActive(true);
  }, []);

  return (
    <div>
      <h1>{props.name}</h1>
      <p>Age: {props.age}</p>
      <button onClick={() => setIsActive(!isActive)}>
        {isActive ? 'Active' : 'Inactive'}
      </button>
    </div>
  );
};`
      }
    },
    {
      id: '2',
      title: 'JavaScript Array Methods Quiz',
      description: 'Test your knowledge of JavaScript array methods and their use cases.',
      type: 'quiz',
      difficulty: 'beginner',
      xp: 100,
      timeLimit: 15,
      completed: false,
      category: 'programming',
      content: {
        question: 'Which array method would you use to transform each element of an array into a new value?',
        options: [
          'Array.prototype.map()',
          'Array.prototype.filter()',
          'Array.prototype.reduce()',
          'Array.prototype.forEach()'
        ],
        correctAnswer: 'Array.prototype.map()'
      }
    },
    {
      id: '3',
      title: 'Spanish Sentence Formation',
      description: 'Arrange words to form grammatically correct Spanish sentences.',
      type: 'interactive',
      difficulty: 'intermediate',
      xp: 120,
      timeLimit: 20,
      completed: false,
      category: 'language',
      content: {
        question: 'Translate: "I want to learn Spanish"',
        correctAnswer: 'Quiero aprender español'
      }
    },
    {
      id: '4',
      title: 'Python Algorithm Challenge',
      description: 'Implement a sorting algorithm in Python with optimal time complexity.',
      type: 'coding',
      difficulty: 'advanced',
      xp: 200,
      timeLimit: 45,
      completed: false,
      category: 'programming'
    },
    {
      id: '5',
      title: 'French Vocabulary Match',
      description: 'Match French words with their English translations.',
      type: 'interactive',
      difficulty: 'beginner',
      xp: 80,
      timeLimit: 10,
      completed: false,
      category: 'language'
    }
  ];

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

  const leaderboard = [
    { name: 'Sarah Chen', xp: 12500, level: 15, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
    { name: 'Michael Smith', xp: 11200, level: 14, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop' },
    { name: 'Emma Garcia', xp: 10800, level: 13, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop' }
  ];

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

  const handleStartChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
  };

  const handleChallengeComplete = (success: boolean) => {
    if (success) {
      setUserXP(prev => prev + (activeChallenge?.xp || 0));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
                    {userLevel}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Level Progress</span>
                    <span className="text-sm font-medium text-indigo-600">{userXP}/{xpToNextLevel} XP</span>
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
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Current Streak</p>
                  <p className="text-3xl font-bold">{streak} Days</p>
                </div>
                <Flame className="h-12 w-12 opacity-90" />
              </div>
            </div>

            {/* Daily Goal */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Daily Goal</p>
                  <p className="text-3xl font-bold">3/5</p>
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
              {challenges
                .filter(challenge => 
                  selectedCategory === 'all' || challenge.category === selectedCategory
                )
                .map((challenge) => (
                  <div
                    key={challenge.id}
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
                      <button 
                        onClick={() => handleStartChallenge(challenge)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Start Challenge
                      </button>
                    </div>
                  </div>
                ))}
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
          onComplete={handleChallengeComplete}
          onClose={() => setActiveChallenge(null)}
        />
      )}
    </div>
  );
};

export default Challenges;