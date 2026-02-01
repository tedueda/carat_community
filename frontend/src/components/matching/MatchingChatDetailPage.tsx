import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';
import { useChatThread } from '@/hooks/useChatThread';
import MessageBubble from './chat/MessageBubble';
import { ArrowLeft } from 'lucide-react';

interface ChatMeta {
  with_user_id: number;
  with_display_name: string;
  with_avatar_url?: string | null;
}

interface MatchingChatDetailPageProps {
  embedded?: boolean;
}

const MatchingChatDetailPage: React.FC<MatchingChatDetailPageProps> = ({ embedded = false }) => {
  const { id } = useParams<{ id: string }>();
  const chatId = id ? Number(id) : null;
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [chatMeta, setChatMeta] = useState<ChatMeta | null>(null);
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, loading, error, sending, sendMessage: sendTextMessage } = useChatThread(
    chatId,
    token,
    user?.id || null
  );

  const fetchChatMeta = async () => {
    if (!token || !chatId) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/chats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const chat = (data.items || []).find((c: any) => c.chat_id === chatId);
      if (chat) {
        setChatMeta({
          with_user_id: chat.with_user_id,
          with_display_name: chat.with_display_name,
          with_avatar_url: chat.with_avatar_url,
        });
      }
    } catch (e: any) {
      console.error('Failed to fetch chat meta:', e);
    }
  };

  const fetchMyAvatar = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/profiles/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        setMyAvatarUrl(data.images[0].image_url);
      } else if (data.avatar_url) {
        setMyAvatarUrl(data.avatar_url);
      }
    } catch (e: any) {
      console.error('Failed to fetch my avatar:', e);
    }
  };


  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('画像サイズは10MB以下にしてください');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !token) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const res = await fetch(`${API_URL}/api/media/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return data.url || data.path || null;
    } catch (e: any) {
      alert(`画像アップロードに失敗しました: ${e?.message || ''}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!token || !chatId) return;
    
    const text = body.trim();
    let imageUrl: string | null = null;
    
    if (imageFile) {
      imageUrl = await uploadImage();
      if (!imageUrl) return;
    }

    if (!text && !imageUrl) return;

    try {
      // テキストのみの場合はsendTextMessage（WebSocket経由で受信）
      if (text && !imageUrl) {
        await sendTextMessage(text);
        setBody('');
      } else {
        // 画像がある場合は直接API呼び出し（WebSocketで重複受信しないように）
        const res = await fetch(`${API_URL}/api/matching/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ body: text || null, image_url: imageUrl }),
        });
        
        if (!res.ok) throw new Error(await res.text());
        
        // 送信成功後、フォームをクリア
        setBody('');
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // メッセージはWebSocketで受信されるので、ここでは追加しない
      }
      
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e: any) {
      alert(`送信に失敗しました: ${e?.message || ''}`);
    }
  };

  useEffect(() => {
    fetchChatMeta();
    fetchMyAvatar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, chatId]);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages]);

  return (
    <div className="flex flex-col h-full pb-20 md:pb-0">
      {!embedded && (
        <div className="pb-3 border-b mb-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/matching/chats')}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {chatMeta?.with_display_name || 'チャット'}
          </h2>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto px-4 bg-white"
        data-chat-messages
      >
        {loading && <div className="text-center py-4">読み込み中...</div>}
        {error && <div className="text-red-600 text-sm text-center py-4">{error}</div>}
        <div className="py-4">
                    {messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        messageId={msg.id}
                        isMe={msg.sender_id === user?.id}
                        avatarUrl={msg.sender_id !== user?.id ? chatMeta?.with_avatar_url : null}
                        myAvatarUrl={msg.sender_id === user?.id ? myAvatarUrl : null}
                        body={msg.body}
                        imageUrl={null}
                        createdAt={msg.created_at}
                      />
                    ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {imagePreview && (
        <div className="mt-2 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-20 rounded border"
          />
          <button
            onClick={() => {
              setImageFile(null);
              setImagePreview(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      <div className="mt-2 flex gap-2 items-end bg-white border-t border-gray-200 pt-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || sending}
          className="px-3 py-2 bg-gray-100 text-gray-600 rounded-full text-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center"
          title="画像を添付"
        >
          📎
        </button>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm resize-none focus:outline-none focus:border-gray-400 transition-colors"
          placeholder="メッセージを入力"
          rows={1}
        />
        <button
          onClick={handleSendMessage}
          disabled={uploading || sending || (!body.trim() && !imageFile)}
          className="px-5 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {uploading || sending ? '送信中...' : '送信'}
        </button>
      </div>
    </div>
  );
};

export default MatchingChatDetailPage;
