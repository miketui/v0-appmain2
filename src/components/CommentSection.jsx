import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Reply, MoreHorizontal, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import UserAvatar from './UserAvatar';
import Modal from './Modal';

const CommentSection = ({ 
  postId, 
  currentUser,
  onCommentAdded,
  className = '' 
}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingComment, setReportingComment] = useState(null);

  // Mock comments data - replace with actual API calls
  const mockComments = [
    {
      id: '1',
      content: 'This routine was absolutely stunning! The precision and artistry were incredible. 🔥✨',
      author: {
        id: '1',
        display_name: 'Jordan Blake',
        avatar_url: null,
        house: { name: 'House of Mizrahi' },
        role: 'Member'
      },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      likes_count: 5,
      user_liked: false,
      replies: [
        {
          id: '2',
          content: 'Thank you so much! Been practicing this for months 💜',
          author: {
            id: '2',
            display_name: 'Alex Rivera',
            avatar_url: null,
            house: { name: 'House of Aviance' }
          },
          created_at: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          likes_count: 2,
          user_liked: true
        }
      ]
    },
    {
      id: '3',
      content: 'Category IS served! The way you hit every beat... pure perfection!',
      author: {
        id: '3',
        display_name: 'Sam Chen',
        avatar_url: null,
        house: { name: 'House of Ninja' }
      },
      created_at: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      likes_count: 8,
      user_liked: true,
      replies: []
    }
  ];

  // Load comments
  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      setTimeout(() => {
        setComments(mockComments);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setLoading(false);
    }
  };

  const addComment = async (content, parentId = null) => {
    if (!content.trim()) return;

    try {
      const newCommentObj = {
        id: Date.now().toString(),
        content: content.trim(),
        author: currentUser,
        created_at: new Date(),
        likes_count: 0,
        user_liked: false,
        replies: []
      };

      if (parentId) {
        // Add as reply
        setComments(prev => 
          prev.map(comment => 
            comment.id === parentId 
              ? { ...comment, replies: [...comment.replies, newCommentObj] }
              : comment
          )
        );
        setReplyText('');
        setReplyingTo(null);
      } else {
        // Add as top-level comment
        setComments(prev => [newCommentObj, ...prev]);
        setNewComment('');
      }

      onCommentAdded && onCommentAdded(newCommentObj);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const likeComment = async (commentId, isReply = false, parentId = null) => {
    try {
      if (isReply) {
        setComments(prev =>
          prev.map(comment =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: comment.replies.map(reply =>
                    reply.id === commentId
                      ? {
                          ...reply,
                          user_liked: !reply.user_liked,
                          likes_count: reply.user_liked
                            ? reply.likes_count - 1
                            : reply.likes_count + 1
                        }
                      : reply
                  )
                }
              : comment
          )
        );
      } else {
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  user_liked: !comment.user_liked,
                  likes_count: comment.user_liked
                    ? comment.likes_count - 1
                    : comment.likes_count + 1
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const reportComment = async (commentId, reason) => {
    try {
      console.log('Reporting comment:', commentId, 'Reason:', reason);
      // Replace with actual API call
      setShowReportModal(false);
      setReportingComment(null);
    } catch (error) {
      console.error('Failed to report comment:', error);
    }
  };

  const formatTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const renderComment = (comment, isReply = false, parentId = null) => {
    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : 'mb-4'}`}>
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <UserAvatar 
            user={comment.author} 
            size="sm" 
            showHouseIndicator={true}
          />

          {/* Comment content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {comment.author.display_name}
                </span>
                {comment.author.house && (
                  <span className="text-xs text-gray-500">
                    • {comment.author.house.name}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {formatTime(comment.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>

            {/* Comment actions */}
            <div className="flex items-center space-x-4 mt-2 ml-3">
              <button
                onClick={() => likeComment(comment.id, isReply, parentId)}
                className={`flex items-center space-x-1 text-xs transition-colors ${
                  comment.user_liked 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <Heart 
                  className={`w-4 h-4 ${comment.user_liked ? 'fill-current' : ''}`} 
                />
                <span>{comment.likes_count}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              )}

              <button
                onClick={() => {
                  setReportingComment(comment.id);
                  setShowReportModal(true);
                }}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Flag className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>

            {/* Reply input */}
            {replyingTo === comment.id && (
              <div className="mt-3 ml-3">
                <div className="flex items-start space-x-2">
                  <UserAvatar user={currentUser} size="xs" />
                  <div className="flex-1">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.author.display_name}...`}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => addComment(replyText, comment.id)}
                        disabled={!replyText.trim()}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3">
                {comment.replies.map(reply => 
                  renderComment(reply, true, comment.id)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`${className}`}>
        {/* Add comment form */}
        <div className="mb-4">
          <div className="flex items-start space-x-3">
            <UserAvatar user={currentUser} size="sm" />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  Be respectful and constructive in your comments
                </span>
                <button
                  onClick={() => addComment(newComment)}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments list */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => renderComment(comment))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No comments yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <Modal
          title="Report Comment"
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setReportingComment(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Why are you reporting this comment?
            </p>
            
            <div className="space-y-2">
              {[
                'Spam or misleading',
                'Harassment or bullying',
                'Inappropriate content',
                'Hate speech',
                'Violence or threats',
                'Other'
              ].map(reason => (
                <button
                  key={reason}
                  onClick={() => reportComment(reportingComment, reason)}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-gray-900">{reason}</div>
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default CommentSection;