
import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Video, 
  Users, 
  TrendingUp, 
  Settings,
  Trash2,
  Edit,
  Eye,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Ad {
  id: string;
  title: string;
  description: string;
  video_url: string;
  reward_points: number;
  created_at: string;
}

interface AdminStats {
  totalAds: number;
  totalUsers: number;
  totalViews: number;
  totalPointsDistributed: number;
}

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalAds: 0,
    totalUsers: 0,
    totalViews: 0,
    totalPointsDistributed: 0
  });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    rewardPoints: 10
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAds();
    fetchStats();
  }, []);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast({
        title: "Error",
        description: "Failed to load advertisements.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total ads
      const { count: adsCount } = await supabase
        .from('ads')
        .select('*', { count: 'exact' });

      // Get total users
      const { count: usersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'user');

      // Get total views and points distributed
      const { data: viewsData } = await supabase
        .from('ad_views')
        .select('points_earned');

      const totalViews = viewsData?.length || 0;
      const totalPointsDistributed = viewsData?.reduce((sum, view) => sum + view.points_earned, 0) || 0;

      setStats({
        totalAds: adsCount || 0,
        totalUsers: usersCount || 0,
        totalViews,
        totalPointsDistributed
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUploadAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const { error } = await supabase
        .from('ads')
        .insert({
          title: uploadData.title,
          description: uploadData.description,
          video_url: uploadData.videoUrl,
          reward_points: uploadData.rewardPoints,
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Advertisement uploaded successfully.",
      });

      setUploadData({
        title: '',
        description: '',
        videoUrl: '',
        rewardPoints: 10
      });
      setShowUploadForm(false);
      fetchAds();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload advertisement.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Advertisement deleted successfully.",
      });

      fetchAds();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete advertisement.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage advertisements and monitor performance</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
                <Video className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAds}</div>
                <p className="text-xs text-blue-100">Active advertisements</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-green-100">Registered users</p>
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
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <p className="text-xs text-purple-100">Ad completions</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Points Distributed</CardTitle>
                <TrendingUp className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPointsDistributed.toLocaleString()}</div>
                <p className="text-xs text-orange-100">Total rewards given</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload New Advertisement
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add new video advertisements for users to watch and earn rewards
                  </p>
                </div>
                <Button 
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Ad
                </Button>
              </div>
            </CardHeader>
            
            {showUploadForm && (
              <CardContent>
                <form onSubmit={handleUploadAd} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Advertisement Title</Label>
                      <Input
                        id="title"
                        value={uploadData.title}
                        onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter ad title"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="points">Reward Points</Label>
                      <Input
                        id="points"
                        type="number"
                        min="1"
                        value={uploadData.rewardPoints}
                        onChange={(e) => setUploadData(prev => ({ ...prev, rewardPoints: parseInt(e.target.value) }))}
                        placeholder="Points to award"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      type="url"
                      value={uploadData.videoUrl}
                      onChange={(e) => setUploadData(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="Enter video URL (MP4, WebM, MOV supported)"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported formats: MP4, WebM, MOV, AVI. Make sure the video is publicly accessible.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadData.description}
                      onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter ad description (optional)"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" disabled={uploading}>
                      {uploading ? "Uploading..." : "Upload Advertisement"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowUploadForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Ads Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manage Advertisements
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                View, edit, and delete existing advertisements
              </p>
            </CardHeader>
            <CardContent>
              {ads.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No advertisements yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your first advertisement to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ads.map((ad, index) => (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{ad.title}</h3>
                              {ad.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {ad.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Reward: {ad.reward_points} points</span>
                                <span>•</span>
                                <span>Created: {new Date(ad.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(ad.video_url, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAd(ad.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

export default AdminDashboard;
