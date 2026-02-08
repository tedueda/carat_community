import React, { useState, useEffect } from 'react';
import { API_URL } from '@/config';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchMessageWithTranslation } from '@/services/translationService';

type MessageBubbleProps = {
  isMe: boolean;
  avatarUrl?: string | null;
  myAvatarUrl?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  messageId?: number;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  isMe,
  avatarUrl,
  myAvatarUrl,
  body,
  imageUrl,
  createdAt,
  messageId,
}) => {
    const { currentLanguage } = useLanguage();
    const [displayText, setDisplayText] = useState<string>(body || '');
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
      const fetchTranslation = async () => {
        if (!messageId || !body || currentLanguage === 'ja') {
          setDisplayText(body || '');
          return;
        }

        setIsTranslating(true);
        try {
          const result = await fetchMessageWithTranslation(messageId, currentLanguage as any);
          if (result.is_translated && result.translated_text) {
            setDisplayText(result.translated_text);
          } else {
            setDisplayText(body);
          }
        } catch (error) {
          console.error('Failed to fetch message translation:', error);
          setDisplayText(body);
        } finally {
          setIsTranslating(false);
        }
      };

      fetchTranslation();
    }, [messageId, body, currentLanguage]);

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      // 24時間以内なら時刻のみ表示
      if (diffInHours < 24) {
        return date.toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      
      // 24時間以上なら日時表示
      return date.toLocaleString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <div className={`flex gap-2 mb-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isMe ? (
          myAvatarUrl ? (
            <img
              src={getImageUrl(myAvatarUrl)}
              alt="My Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">👤</span>
            </div>
          )
        ) : (
          avatarUrl ? (
            <img
              src={getImageUrl(avatarUrl)}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">👤</span>
            </div>
          )
        )}
      </div>

      {/* Message bubble */}
      <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isMe
              ? 'bg-black text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
          style={isMe ? {
            borderTopRightRadius: '4px'
          } : {
            borderTopLeftRadius: '4px'
          }}
        >
          {/* Image */}
          {imageUrl && (
            <div className="mb-2">
              <a href={getImageUrl(imageUrl)} target="_blank" rel="noopener noreferrer">
                <img
                  src={getImageUrl(imageUrl)}
                  alt="Attached"
                  className="max-w-full max-h-[40vh] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onLoad={() => {
                    // Scroll to bottom after image loads
                    setTimeout(() => {
                      const container = document.querySelector('[data-chat-messages]');
                      if (container) {
                        container.scrollTop = container.scrollHeight;
                      }
                    }, 100);
                  }}
                />
              </a>
            </div>
          )}

                    {/* Text */}
                    {body && (
                      <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                        {isTranslating ? (
                          <span className="opacity-70">{body}</span>
                        ) : (
                          displayText
                        )}
                      </div>
                    )}
        </div>

        {/* Timestamp */}
        <div className={`text-[11px] text-gray-400 mt-0.5 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
          {formatTime(createdAt)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
