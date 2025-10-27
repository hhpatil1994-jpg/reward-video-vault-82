
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Volume2, VolumeX, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import VideoQuiz from './VideoQuiz';

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
  duration?: number;
}

interface VideoPlayerProps {
  ad: Ad;
  onAdComplete: (earned: boolean) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ ad, onAdComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [hasEarnedReward, setHasEarnedReward] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const { toast } = useToast();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleEnded = () => handleVideoEnd();
    const handleError = () => {
      setVideoError(true);
      toast({
        title: "Video Error",
        description: "Unable to load this video format. Please try a different video.",
        variant: "destructive"
      });
    };
    const handleLoadedData = () => setVideoError(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || videoError) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {
        setVideoError(true);
        toast({
          title: "Playback Error",
          description: "Unable to play this video. Please check the video format.",
          variant: "destructive"
        });
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoEnd = () => {
    setVideoCompleted(true);
    setIsPlaying(false);
    
    // If there are questions, show quiz
    if (ad.questions && ad.questions.length > 0) {
      setShowQuiz(true);
    } else {
      // No quiz, give reward directly
      handleRewardEarned(true);
    }
  };

  const handleQuizComplete = (passed: boolean) => {
    setShowQuiz(false);
    handleRewardEarned(passed);
  };

  const handleRewardEarned = (earned: boolean) => {
    setHasEarnedReward(earned);
    
    if (earned) {
      toast({
        title: "Reward Earned! 🎉",
        description: `You earned ${ad.reward_points} points!`,
      });
    } else {
      toast({
        title: "Better luck next time!",
        description: "You need to pass the quiz to earn rewards.",
        variant: "destructive"
      });
    }
    
    setTimeout(() => {
      onAdComplete(earned);
    }, 2000);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getYouTubeVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getVideoSources = (url: string) => {
    // Handle different video formats and sources
    const sources = [];
    
    if (!url) return null;
    
    if (isYouTubeUrl(url)) {
      return 'youtube';
    }
    
    // For direct video files, provide multiple format options
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'mp4':
        sources.push({ src: url, type: 'video/mp4' });
        break;
      case 'webm':
        sources.push({ src: url, type: 'video/webm' });
        break;
      case 'ogg':
        sources.push({ src: url, type: 'video/ogg' });
        break;
      default:
        sources.push({ src: url, type: 'video/mp4' });
        sources.push({ src: url, type: 'video/webm' });
        sources.push({ src: url, type: 'video/ogg' });
    }
    
    return sources;
  };

  // Show quiz if video is completed and quiz is available
  if (showQuiz && ad.questions) {
    return (
      <div className="space-y-6">
        <VideoQuiz
          adTitle={ad.title}
          questions={ad.questions}
          rewardPoints={ad.reward_points}
          onQuizComplete={handleQuizComplete}
        />
      </div>
    );
  }

  const videoSources = getVideoSources(ad.video_url);
  const youtubeVideoId = isYouTubeUrl(ad.video_url) ? getYouTubeVideoId(ad.video_url) : null;

  // Handle YouTube video end
  useEffect(() => {
    if (!youtubeVideoId) return;

    const handleYouTubeMessage = (event: MessageEvent) => {
      if (event.data === 'videoEnded') {
        handleVideoEnd();
      }
    };

    window.addEventListener('message', handleYouTubeMessage);
    return () => window.removeEventListener('message', handleYouTubeMessage);
  }, [youtubeVideoId]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{ad.title}</span>
          <motion.div 
            className="flex items-center gap-2 text-green-600"
            animate={hasEarnedReward ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Coins className="h-5 w-5" />
            <span className="font-bold">{ad.reward_points} points</span>
          </motion.div>
        </CardTitle>
        {ad.description && (
          <p className="text-sm text-muted-foreground">{ad.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden">
          {videoError ? (
            <div className="w-full aspect-video flex items-center justify-center bg-gray-800 text-white">
              <div className="text-center">
                <p className="mb-2">Unable to load video</p>
                <p className="text-sm text-gray-400">Please check the video URL or format</p>
              </div>
            </div>
          ) : youtubeVideoId ? (
            <div className="relative w-full aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1&rel=0`}
                title={ad.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              {!videoCompleted && (
                <Button
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
                  onClick={() => handleVideoEnd()}
                >
                  {ad.questions && ad.questions.length > 0 ? 'Start Quiz & Earn Rewards' : 'Claim Reward'}
                </Button>
              )}
            </div>
          ) : videoSources && Array.isArray(videoSources) ? (
            <>
              <video
                ref={videoRef}
                className="w-full aspect-video"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                crossOrigin="anonymous"
              >
                {videoSources.map((source, index) => (
                  <source key={index} src={source.src} type={source.type} />
                ))}
                Your browser does not support the video tag.
              </video>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                    disabled={videoError}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                    disabled={videoError}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>

                  <div className="flex-1 flex items-center gap-2 text-white text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <Progress value={progress} className="flex-1" />
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full aspect-video flex items-center justify-center bg-gray-800 text-white">
              <div className="text-center">
                <p className="mb-2">Unable to load video</p>
                <p className="text-sm text-gray-400">Please check the video URL or format</p>
              </div>
            </div>
          )}
        </div>

        {videoCompleted && !showQuiz && !videoError && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
            <p className="text-blue-700">
              {ad.questions && ad.questions.length > 0 
                ? "Video completed! Get ready for the quiz to earn your rewards."
                : "Video completed! Processing your rewards..."
              }
            </p>
          </div>
        )}

        {hasEarnedReward && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 border border-green-300 rounded-lg p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Coins className="h-6 w-6" />
              <span className="font-semibold text-lg">
                Congratulations! You earned {ad.reward_points} points! 🎉
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
