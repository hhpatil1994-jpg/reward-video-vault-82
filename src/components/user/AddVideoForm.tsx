
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface AddVideoFormProps {
  onVideoAdded: (video: any) => void;
  onCancel: () => void;
}

const AddVideoForm: React.FC<AddVideoFormProps> = ({ onVideoAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    rewardPoints: 100
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      question: '',
      options: ['', '', '', ''], // 4 options (A, B, C, D)
      correctAnswer: 0
    },
    {
      id: '2',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    },
    {
      id: '3',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    },
    {
      id: '4',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    },
    {
      id: '5',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }
  ]);
  const { toast } = useToast();

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''], // 4 options by default (A, B, C, D)
      correctAnswer: 0
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const updateQuestion = (questionId: string, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId && q.options.length < 4
        ? { ...q, options: [...q.options, ''] }
        : q
    ));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId && q.options.length > 2
        ? { 
            ...q, 
            options: q.options.filter((_, idx) => idx !== optionIndex),
            correctAnswer: q.correctAnswer > optionIndex ? q.correctAnswer - 1 : q.correctAnswer
          }
        : q
    ));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, videoUrl: publicUrl }));
      
      toast({
        title: "Success!",
        description: "Video uploaded successfully!",
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Error",
        description: "Failed to upload video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    
    // Check for common video file extensions
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    
    // Check for YouTube, Vimeo, or other video platforms
    const isVideoService = /youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com/i.test(url);
    
    return hasVideoExtension || isVideoService || url.startsWith('blob:') || url.startsWith('data:video');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.videoUrl) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Validate video URL
    if (!isVideoUrl(formData.videoUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid video URL (mp4, webm, YouTube, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate questions
    const invalidQuestions = questions.some(q => 
      !q.question || q.options.filter(opt => opt.trim()).length < 2
    );
    
    if (invalidQuestions) {
      toast({
        title: "Error",
        description: "Please complete all questions with at least 2 options each.",
        variant: "destructive"
      });
      return;
    }

    // Clean up empty options
    const cleanedQuestions = questions.map(q => ({
      ...q,
      options: q.options.filter(opt => opt.trim() !== '')
    }));

    const newVideo = {
      id: Date.now().toString(),
      ...formData,
      questions: cleanedQuestions,
      created_at: new Date().toISOString()
    };

    onVideoAdded(newVideo);
    
    toast({
      title: "Success!",
      description: "Video advertisement added successfully!",
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Add New Video Advertisement
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter video title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="points">Reward Points *</Label>
              <Input
                id="points"
                type="number"
                min="10"
                max="1000"
                value={formData.rewardPoints}
                onChange={(e) => setFormData(prev => ({ ...prev, rewardPoints: parseInt(e.target.value) }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL *</Label>
            <div className="flex gap-2">
              <Input
                id="videoUrl"
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                required
                className="flex-1"
              />
              <div className="relative">
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="video-file-upload"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('video-file-upload')?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports: MP4, WebM, OGG, AVI, MOV, YouTube, Vimeo and other video formats
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter video description"
              rows={3}
            />
          </div>

          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quiz Questions</h3>
              <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
            
            {questions.map((question, questionIndex) => (
              <Card key={question.id} className="border-2 border-dashed">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Question {questionIndex + 1}</h4>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Question Text *</Label>
                    <Input
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                      placeholder="Enter your question"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Answer Options * (2-4 options)</Label>
                      {question.options.length < 4 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(question.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Option
                        </Button>
                      )}
                    </div>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                        />
                        <Button
                          type="button"
                          variant={question.correctAnswer === optionIndex ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateQuestion(question.id, 'correctAnswer', optionIndex)}
                        >
                          {question.correctAnswer === optionIndex ? 'Correct' : 'Mark Correct'}
                        </Button>
                        {question.options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(question.id, optionIndex)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              Add Video Advertisement
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddVideoForm;
