import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, Image } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { PageLoader } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  message_content: string;
  attachment_url?: string;
  product_id?: number;
  product_name?: string;
  product_image?: string;
  send_date: string;
  message_status: string;
  sender: { full_name: string; role: string };
}

interface Conversation {
  partner: { user_id: number; full_name: string; email: string; role: string };
  lastMessage: Message | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    searchParams.get('to') ? parseInt(searchParams.get('to')!) : null
  );
  const [newMessage, setNewMessage] = useState('');
  const productId = searchParams.get('product_id');
  const productName = searchParams.get('product_name')
    ? decodeURIComponent(searchParams.get('product_name')!)
    : null;
  const productImage = searchParams.get('product_image')
    ? decodeURIComponent(searchParams.get('product_image')!)
    : null;
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: inboxData, isLoading: inboxLoading } = useQuery({
    queryKey: ['inbox'],
    queryFn: () => api.get('/messages/inbox').then((r) => r.data),
    refetchInterval: 10000,
  });

  const { data: conversationData, isLoading: convLoading } = useQuery({
    queryKey: ['conversation', selectedUserId],
    queryFn: () =>
      api.get(`/messages/conversation/${selectedUserId}`).then((r) => r.data),
    enabled: !!selectedUserId,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (payload: { content: string; attachment_url?: string }) =>
      api.post('/messages', {
        receiver_id: Number(selectedUserId),
        message_content: payload.content,
        attachment_url: payload.attachment_url,
        product_id: productId,
        product_name: productName,
        product_image: productImage,
      }),
    onMutate: async (payload: { content: string; attachment_url?: string }) => {
      await queryClient.cancelQueries({
        queryKey: ['conversation', selectedUserId],
      });
      const previousData = queryClient.getQueryData<any>([
        'conversation',
        selectedUserId,
      ]);
      const tempMessage = {
        message_id: Date.now() * -1,
        sender_id: user?.user_id,
        receiver_id: selectedUserId,
        message_content: payload.content,
        attachment_url: payload.attachment_url,
        send_date: new Date().toISOString(),
        message_status: 'SENT',
        sender: { full_name: user?.full_name ?? '', role: user?.role ?? '' },
      };
      queryClient.setQueryData(
        ['conversation', selectedUserId],
        (old: any) => ({
          ...old,
          messages: [...(old?.messages || []), tempMessage],
        })
      );
      return { previousData };
    },
    onError: (_err, _content, context: any) => {
      queryClient.setQueryData(
        ['conversation', selectedUserId],
        context?.previousData
      );
      toast.error('Failed to send message');
    },
    onSettled: () => {
      setNewMessage('');
      queryClient.invalidateQueries({
        queryKey: ['conversation', selectedUserId],
      });
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationData, selectedUserId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;
    sendMutation.mutate({ content: newMessage.trim() });
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUserId) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const uploadResponse = await api.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const attachment_url = uploadResponse.data.url;
      sendMutation.mutate({ content: newMessage.trim(), attachment_url });
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const conversations: Conversation[] = inboxData?.conversations || [];
  const messages: Message[] = conversationData?.messages || [];
  const selectedPartner =
    conversations.find((c) => c.partner.user_id === selectedUserId)?.partner ??
    (selectedUserId
      ? {
          user_id: selectedUserId,
          full_name: productName || 'New chat',
          email: '',
          role: 'seller',
        }
      : null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Messages</h1>

      <div className="card flex h-[600px] overflow-hidden">
        {/* Inbox sidebar */}
        <div className="w-72 border-r border-slate-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-100">
            <p className="font-semibold text-slate-800 text-sm">
              Conversations
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {inboxLoading ? (
              <PageLoader />
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.partner.user_id}
                  onClick={() => setSelectedUserId(conv.partner.user_id)}
                  className={`w-full p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 ${
                    selectedUserId === conv.partner.user_id
                      ? 'bg-primary-50 border-l-2 border-l-primary-600'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                      {conv.partner.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-slate-800 truncate">
                          {conv.partner.full_name}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate capitalize">
                        {conv.partner.role.toLowerCase()}
                      </p>
                      {conv.lastMessage && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {conv.lastMessage.message_content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedUserId ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                    {selectedPartner?.full_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {selectedPartner?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {selectedPartner?.role?.toLowerCase()}
                    </p>
                  </div>
                </div>
                {productName && (
                  <div className="flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500">
                        📦
                      </div>
                    )}
                    <div>
                      <p className="text-slate-800 font-semibold">
                        Inquiry about
                      </p>
                      <p className="text-slate-700 truncate max-w-[240px]">
                        {productName}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {convLoading ? (
                  <PageLoader />
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm py-8">
                    Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.user_id;
                    return (
                      <div
                        key={msg.message_id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                            isOwn
                              ? 'bg-primary-600 text-white rounded-br-sm'
                              : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                          }`}
                        >
                          {msg.product_name && (
                            <div className="mb-2 rounded-lg bg-slate-200 px-3 py-2 text-xs text-slate-700">
                              Inquiry about:{' '}
                              <span className="font-semibold">
                                {msg.product_name}
                              </span>
                            </div>
                          )}
                          <p>{msg.message_content}</p>
                          {msg.attachment_url && (
                            <img
                              src={msg.attachment_url}
                              alt="Message attachment"
                              className="mt-2 w-full rounded-xl object-cover"
                            />
                          )}
                          <p
                            className={`text-xs mt-1 ${isOwn ? 'text-primary-200' : 'text-slate-400'}`}
                          >
                            {new Date(msg.send_date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="p-4 border-t border-slate-100 flex gap-2 items-center"
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleAttachClick}
                  disabled={isUploading}
                  className="btn-secondary px-4 flex items-center gap-2"
                >
                  <Image size={16} />
                  {isUploading ? 'Uploading...' : 'Image'}
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendMutation.isPending}
                  className="btn-primary px-4 flex items-center gap-2"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageSquare
                  size={48}
                  className="text-slate-200 mx-auto mb-4"
                />
                <p className="text-slate-500 font-medium">
                  Select a conversation
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Choose from your inbox to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
