import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VideoPlayer from './VideoPlayer';
import AddVideoForm from './AddVideoForm';
import { useToast } from '@/hooks/use-toast';
import { 
  Coins, 
  Play, 
  TrendingUp, 
  Video,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Ad {
  id: string;
  title: string;
  description: string;
  video_url: string;
  reward_points: number;
  questions?: Question[];
  created_at: string;
}

interface UserStats {
  totalPoints: number;
  adsWatched: number;
  totalEarnings: number;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    adsWatched: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved ads from localStorage
    const savedAds = localStorage.getItem('userAds');
    let initialAds: Ad[] = [];
    
    if (savedAds) {
      initialAds = JSON.parse(savedAds);
    } else {
      // Default mock ads with questions
      initialAds = [
        {
          id: '1',
          title: 'Summer Sale Advertisement',
          description: 'Watch this exciting summer sale ad and earn 2 points!',
          video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
          reward_points: 2,
          created_at: new Date().toISOString(),
          questions: [
            {
              id: '1',
              question: 'What season is featured in this advertisement?',
              options: ['Spring', 'Summer', 'Fall', 'Winter'],
              correctAnswer: 1
            },
            {
              id: '2',
              question: 'What type of event is being advertised?',
              options: ['Sale', 'Contest', 'Launch', 'Review'],
              correctAnswer: 0
            }
          ]
        },
        {
          id: '2',
          title: 'Tech Product Launch',
          description: 'Discover the latest tech innovation and earn 2 points!',
          video_url: 'https://www.w3schools.com/html/movie.mp4',
          reward_points: 2,
          created_at: new Date().toISOString(),
          questions: [
            {
              id: '1',
              question: 'What type of content is this video about?',
              options: ['Sports', 'Technology', 'Food', 'Travel'],
              correctAnswer: 1
            }
          ]
        }
      ];
    }
    
    setTimeout(() => {
      setAds(initialAds);
      setLoading(false);
    }, 1000);

    // Load saved stats
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const handleAdComplete = (earned: boolean) => {
    if (selectedAd && earned) {
      const newStats = {
        totalPoints: stats.totalPoints + selectedAd.reward_points,
        adsWatched: stats.adsWatched + 1,
        totalEarnings: stats.totalEarnings + selectedAd.reward_points
      };
      
      setStats(newStats);
      localStorage.setItem('userStats', JSON.stringify(newStats));
      
      toast({
        title: "Rewards Earned!",
        description: `You've earned ${selectedAd.reward_points} points for completing this ad!`,
      });
    }
    setSelectedAd(null);
  };

  const handleVideoAdded = (newVideo: Ad) => {
    const updatedAds = [...ads, newVideo];
    setAds(updatedAds);
    localStorage.setItem('userAds', JSON.stringify(updatedAds));
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowAddForm(false)}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <AddVideoForm 
            onVideoAdded={handleVideoAdded}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      </div>
    );
  }

  if (selectedAd) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedAd(null)}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <VideoPlayer ad={selectedAd} onAdComplete={handleAdComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RewardAd Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome to the rewards platform</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
            >
              Admin Panel
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <Coins className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
                <p className="text-xs text-green-100">
                  Points earned
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ads Watched</CardTitle>
                <Video className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.adsWatched}</div>
                <p className="text-xs text-blue-100">
                  Videos completed
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                <TrendingUp className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEarnings.toLocaleString()}</div>
                <p className="text-xs text-purple-100">
                  Points lifetime
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Available Ads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Available Advertisements
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Watch ads and complete quizzes to earn reward points
              </p>
            </CardHeader>
            <CardContent>
              {ads.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No ads available
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first video advertisement to get started!
                  </p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ads.map((ad, index) => (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
                            <Play className="h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            {ad.title}
                          </h3>
                          
                          {ad.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {ad.description}
                            </p>
                          )}
                          
                          {ad.questions && ad.questions.length > 0 && (
                            <p className="text-xs text-blue-600 mb-2">
                              📝 Quiz required ({ad.questions.length} questions)
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-green-600">
                              <Coins className="h-4 w-4" />
                              <span className="font-medium">+{ad.reward_points} points</span>
                            </div>
                            
                            <Button
                              onClick={() => setSelectedAd(ad)}
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Watch
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};

export default UserDashboard;
