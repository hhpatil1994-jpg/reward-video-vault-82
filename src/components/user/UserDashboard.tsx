import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VideoPlayer from './VideoPlayer';
import AddVideoForm from './AddVideoForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
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
    fetchAds();
    loadStats();
  }, []);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match Ad interface
      const transformedAds = (data || []).map(ad => ({
        ...ad,
        description: ad.description || '',
        video_url: ad.video_url || '',
        questions: Array.isArray(ad.questions) 
          ? (ad.questions as any[]).map((q: any) => ({
              ...q,
              options: Array.isArray(q.options) ? q.options : []
            }))
          : []
      }));

      setAds(transformedAds);
    } catch (error: any) {
      toast({
        title: "Error loading ads",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = () => {
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  };

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
    setAds(prev => [newVideo, ...prev]);
    setShowAddForm(false);
    fetchAds(); // Refresh the list
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
            {user?.role === 'admin' && (
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
              >
                Admin Panel
              </Button>
            )}
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
