import { useState, type FormEvent } from 'react';
import { Card, Button, Textarea } from '../../common';
import { useAuth } from '../../../contexts/AuthContext';
import { ProtectedAction } from '../../auth/ProtectedAction';
import { supabase } from '../../../lib/supabase';
import type { Comment as DbComment } from '../../../types/database';

interface CommunityCommentsProps {
  propertyId: string;
  comments: DbComment[];
  onCommentAdded: () => void;
}

export function CommunityComments({ propertyId, comments, onCommentAdded }: CommunityCommentsProps) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !body.trim()) return;
    setSubmitting(true);
    setError('');

    const { error: err } = await supabase.from('comments').insert({
      property_id: propertyId,
      commenter_id: user.id,
      body: body.trim(),
      is_anonymous: isAnonymous,
    });

    if (err) {
      setError(err.message);
    } else {
      setBody('');
      onCommentAdded();
    }
    setSubmitting(false);
  };

  const handleVote = async (commentId: string) => {
    if (!user) return;
    await supabase.from('helpful_votes').insert({
      user_id: user.id,
      comment_id: commentId,
    });
    onCommentAdded();
  };

    return (
    <div className="space-y-6">
      <h3 className="text-3xl font-bold tracking-tight text-ink">Community Comments</h3>

      {comments.length === 0 ? (
        <p className="text-text-muted">No comments yet. Be the first to share your experience.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-xs text-text-muted">
                    {comment.is_anonymous ? 'Anonymous' : 'Community member'} &middot;{' '}
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                  {user && (
                    <button
                      onClick={() => handleVote(comment.id)}
                      className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-text-muted transition-colors hover:border-teal-300 hover:text-teal-600"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      {comment.helpful_count}
                    </button>
                  )}
                </div>
                <p className="text-text">{comment.body}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ProtectedAction>
        <Card className="bg-sand-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              label="Add a comment"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your experience with this property..."
              maxLength={2000}
              required
            />
            <p className="text-xs text-text-muted">{body.length}/2000 characters</p>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-text">Post anonymously</span>
            </label>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button type="submit" disabled={!body.trim() || submitting}>
              {submitting ? 'Posting...' : 'Post comment'}
            </Button>
          </form>
        </Card>
      </ProtectedAction>
    </div>
  );
}
