import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Helper to extract API error message safely
function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error && 'response' in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    const msg = resp?.data?.message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

interface CommentsSectionProps {
  paletteId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ paletteId }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      const fetchedComments = await apiClient.getCommentsForPalette(paletteId);
      setComments(fetchedComments);
    } catch (error: unknown) {
      console.error('Failed to fetch comments:', error);
      toast.error(getApiErrorMessage(error, 'Failed to load comments.'));
    }
  }, [paletteId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    if (!newCommentContent.trim()) {
      toast.error('Comment cannot be empty.');
      return;
    }
    try {
      const addedComment = await apiClient.addCommentToPalette(paletteId, newCommentContent);
      setComments(prev => [...prev, addedComment]);
      setNewCommentContent('');
      toast.success('Comment added successfully!');
    } catch (error: unknown) {
      console.error('Failed to add comment:', error);
      toast.error(getApiErrorMessage(error, 'Failed to add comment.'));
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingCommentContent.trim()) {
      toast.error('Comment cannot be empty.');
      return;
    }
    try {
      const updatedComment = await apiClient.updateComment(commentId, editingCommentContent);
      setComments(prev => prev.map(c => (c.id === commentId ? updatedComment : c)));
      setEditingCommentId(null);
      setEditingCommentContent('');
      toast.success('Comment updated successfully!');
    } catch (error: unknown) {
      console.error('Failed to update comment:', error);
      toast.error(getApiErrorMessage(error, 'Failed to update comment.'));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    try {
      await apiClient.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted successfully!');
    } catch (error: unknown) {
      console.error('Failed to delete comment:', error);
      toast.error(getApiErrorMessage(error, 'Failed to delete comment.'));
    }
  };

  const getFullAvatarUrl = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return '';
    if (avatarUrl.startsWith('http')) return avatarUrl;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${avatarUrl}?t=${Date.now()}`;
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-neutral-800 mb-4">Comments ({comments.length})</h2>

      {isAuthenticated && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <Textarea
            placeholder="Add a comment..."
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            rows={3}
            className="mb-2"
          />
          <Button className='text-white' onClick={handleAddComment} disabled={!newCommentContent.trim()}>
            Post Comment
          </Button>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-neutral-500">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <Link href={`/users/${comment.author.id}`} className="flex items-center space-x-3 group">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getFullAvatarUrl(comment.author.avatarUrl)} alt={comment.author.name || 'User'} />
                  <AvatarFallback>{comment.author.name?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Link href={`/users/${comment.author.id}`} className="group">
                    <p className="text-sm font-semibold text-neutral-800 group-hover:underline">{comment.author.name || 'Anonymous'}</p>
                  </Link>
                  <span className="text-xs text-neutral-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {editingCommentId === comment.id ? (
                  <div>
                    <Textarea
                      value={editingCommentContent}
                      onChange={(e) => setEditingCommentContent(e.target.value)}
                      rows={2}
                      className="mb-2"
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleEditComment(comment.id)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-700">{comment.content}</p>
                )}
                {isAuthenticated && user?.id === comment.authorId && editingCommentId !== comment.id && (
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-neutral-500 hover:text-blue-600"
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditingCommentContent(comment.content);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-neutral-500 hover:text-red-600"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;