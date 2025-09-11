import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import UserAvatar from './UserAvatar';
import Modal from './Modal';

const PostCard = ({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  currentUser,
  className = '' 
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onLike(post.id, !post.user_liked);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyPostLink = () => {
    const postUrl = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    setShowShareModal(false);
  };

  const formatTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const renderMedia = () => {
    if (!post.media_urls || post.media_urls.length === 0) return null;

    return (
      <div className="mt-3">
        {post.media_urls.length === 1 ? (
          <img
            src={post.media_urls[0]}
            alt="Post media"
            className="w-full rounded-lg max-h-96 object-cover"
          />
        ) : (
          <div className={`grid gap-2 rounded-lg overflow-hidden ${
            post.media_urls.length === 2 ? 'grid-cols-2' :
            post.media_urls.length === 3 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}>
            {post.media_urls.slice(0, 4).map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Post media ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                {index === 3 && post.media_urls.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      +{post.media_urls.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getVisibilityBadge = () => {
    switch (post.visibility) {
      case 'house_only':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            House Only
          </span>
        );
      case 'members_only':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Members Only
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <article className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
        {/* Post Header */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserAvatar
                user={post.author}
                size="md"
                showHouseIndicator={true}
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">
                    {post.author?.display_name || 'Unknown User'}
                  </h3>
                  {post.author?.house?.name && (
                    <span className="text-sm text-gray-500">
                      • {post.author.house.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <time className="text-sm text-gray-500">
                    {formatTime(post.created_at)}
                  </time>
                  {getVisibilityBadge()}
                </div>
              </div>
            </div>
            
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Post Content */}
          {post.content && (
            <div className="mt-3">
              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            </div>
          )}

          {/* Media */}
          {renderMedia()}
        </div>

        {/* Post Actions */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center space-x-2 transition-colors ${
                  post.user_liked 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                <Heart 
                  className={`w-5 h-5 ${post.user_liked ? 'fill-current' : ''}`} 
                />
                <span className="text-sm font-medium">
                  {post.likes_count || 0}
                </span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {post.comments_count || 0}
                </span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>

          {/* Comments Preview */}
          {(post.comments_count > 0 || showComments) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              {!showComments ? (
                <button
                  onClick={() => setShowComments(true)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  View {post.comments_count} comment{post.comments_count !== 1 ? 's' : ''}
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Comments will be loaded here */}
                  <div className="text-sm text-gray-500">Comments loading...</div>
                  
                  {/* Comment Input */}
                  <div className="flex items-center space-x-3">
                    <UserAvatar user={currentUser} size="sm" />
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="w-full px-3 py-2 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            onComment && onComment(post.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </article>

      {/* Share Modal */}
      {showShareModal && (
        <Modal
          title="Share Post"
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        >
          <div className="space-y-4">
            <p className="text-gray-600">Share this post with others:</p>
            
            <div className="space-y-2">
              <button
                onClick={copyPostLink}
                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-gray-900">Copy Link</div>
                <div className="text-sm text-gray-500">Copy post URL to clipboard</div>
              </button>
              
              <button
                onClick={() => {
                  const shareData = {
                    title: 'Haus of Basquiat Post',
                    text: post.content || 'Check out this post from Haus of Basquiat',
                    url: `${window.location.origin}/posts/${post.id}`
                  };
                  navigator.share && navigator.share(shareData);
                  setShowShareModal(false);
                }}
                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-gray-900">Share via Device</div>
                <div className="text-sm text-gray-500">Use your device's share menu</div>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default PostCard;