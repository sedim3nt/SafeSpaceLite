import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../common';
import { Textarea } from '../../common/Form';
import { useLocalStorage } from '../../../hooks';
import type { PropertyComment } from '../../../types';

interface CommunityCommentsProps {
  propertyAddress: string;
  comments: PropertyComment[];
}

export const CommunityComments: React.FC<CommunityCommentsProps> = ({
  propertyAddress,
  comments: seedComments,
}) => {
  const storageKey = `safespace-comments-${propertyAddress.toLowerCase().replace(/[,.\s]+/g, '-')}`;
  const [storedComments, setStoredComments] = useLocalStorage<PropertyComment[] | null>(
    storageKey,
    null
  );

  // Use stored comments if available, otherwise use seed data
  const comments = storedComments ?? seedComments;
  const setComments = (updated: PropertyComment[]) => setStoredComments(updated);

  // Sync seed comments into storage on first load for this property
  useEffect(() => {
    if (storedComments === null && seedComments.length > 0) {
      setStoredComments(seedComments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showAddComment, setShowAddComment] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment: PropertyComment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        date: new Date().toISOString(),
        helpful: 0,
        anonymous: isAnonymous,
      };
      setComments([comment, ...comments]);
      setNewComment('');
      setShowAddComment(false);
    }
  };

  const handleHelpful = (commentId: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, helpful: comment.helpful + 1 } : comment
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Community Feedback</h3>
        {!showAddComment && (
          <Button onClick={() => setShowAddComment(true)} size="sm">
            Add Comment
          </Button>
        )}
      </div>

      {showAddComment && (
        <Card className="bg-surface-muted">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              label="Share your health/safety experience at this property"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Describe any mold, heating, plumbing, or other health issues you've experienced..."
              rows={4}
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="text-brand-600 focus:ring-brand-500 h-4 w-4 rounded border-border"
              />
              <label htmlFor="anonymous" className="text-sm text-text">
                Hide my display name
              </label>
              <span className="block text-xs text-text-muted ml-6">
                Your name won't be shown, but comment content is publicly visible.
              </span>
            </div>

            <div className="flex gap-3">
              <Button type="submit">Post Comment</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddComment(false);
                  setNewComment('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {comments.length === 0 ? (
        <Card className="py-8 text-center">
          <p className="text-gray-500">No community feedback yet for this property</p>
          <p className="mt-2 text-sm text-gray-400">Be the first to share your experience</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <div className="space-y-3">
                <p className="text-gray-900">{comment.text}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-500">
                    <span>{comment.anonymous ? 'Anonymous' : 'Verified Tenant'}</span>
                    <span>{new Date(comment.date).toLocaleDateString()}</span>
                  </div>

                  <button
                    onClick={() => handleHelpful(comment.id)}
                    className="hover:text-brand-600 flex items-center gap-1 text-text-muted"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    <span>Helpful ({comment.helpful})</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
