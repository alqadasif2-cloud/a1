import React, { useState, useRef, useEffect } from 'react';
import { Conversation, ChatMessage, User } from '../types';
import {
  ArrowRight,
  Phone,
  Video,
  MoreVertical,
  Plus,
  Image as ImageIcon,
  Mic,
  Send,
  Play,
  Pause,
  CheckCheck,
  Check,
  Smile,
  Paperclip,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface ChatConversationScreenProps {
  conversation: Conversation;
  onBack: () => void;
  onStartAudioCall: (peer: User) => void;
  onStartVideoCall: (peer: User) => void;
  onSendMessage: (convId: string, message: Partial<ChatMessage>) => void;
}

export const ChatConversationScreen: React.FC<ChatConversationScreenProps> = ({
  conversation,
  onBack,
  onStartAudioCall,
  onStartVideoCall,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [showAttachmentsMenu, setShowAttachmentsMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  // Voice recording simulation
  useEffect(() => {
    let interval: number;
    if (isRecordingVoice) {
      interval = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  const handleSendText = () => {
    if (!inputText.trim()) return;

    soundEffects.playMessageSent();
    const newMsg: Partial<ChatMessage> = {
      senderId: 'user_me',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
      type: 'text',
    };

    onSendMessage(conversation.id, newMsg);
    setInputText('');

    // Simulate smart reply from friend after 1.5s
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        soundEffects.playMessageSent();
        onSendMessage(conversation.id, {
          senderId: conversation.peerUser.id,
          text: 'تم الاستلام بنجاح، شكراً لك! 👍',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          type: 'text',
        });
      }, 1600);
    }, 1000);
  };

  const handleSendSampleImage = () => {
    setShowAttachmentsMenu(false);
    soundEffects.playMessageSent();
    onSendMessage(conversation.id, {
      senderId: 'user_me',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
      type: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    });
  };

  const handleStopAndSendVoice = () => {
    setIsRecordingVoice(false);
    soundEffects.playMessageSent();
    const durationStr = `0:${recordSeconds < 10 ? '0' : ''}${recordSeconds || 15}`;
    onSendMessage(conversation.id, {
      senderId: 'user_me',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
      type: 'audio',
      audioDuration: durationStr,
    });
  };

  const toggleAudioPlay = (msgId: string) => {
    if (isPlayingAudio === msgId) {
      setIsPlayingAudio(null);
    } else {
      setIsPlayingAudio(msgId);
      // Auto pause after 5s simulation
      setTimeout(() => {
        setIsPlayingAudio((curr) => (curr === msgId ? null : curr));
      }, 5000);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-[#f4f2f7] dark:bg-[#110a1f] text-slate-800 dark:text-slate-100 select-none">
      {/* Top Header matching reference */}
      <div className="bg-gradient-to-r from-[#2a0b54] to-[#4c168e] text-white py-2.5 px-3 flex items-center justify-between shadow-md shrink-0 z-20">
        {/* Back and User info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-white/10 active:scale-95 transition-transform"
            title="رجوع"
          >
            <ArrowRight className="w-5 h-5 text-purple-200" />
          </button>

          <div className="relative">
            <img
              src={conversation.peerUser.avatar}
              alt={conversation.peerUser.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
              referrerPolicy="no-referrer"
            />
            {conversation.peerUser.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#2a0b54] rounded-full" />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate leading-tight">
              {conversation.isGroup ? conversation.groupName : conversation.peerUser.name}
            </span>
            <span className="text-[11px] text-purple-200/90 leading-tight">
              {isTyping ? 'يكتب الآن...' : conversation.peerUser.isOnline ? 'متصل الآن' : 'غير متصل'}
            </span>
          </div>
        </div>

        {/* Audio / Video Call Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartVideoCall(conversation.peerUser)}
            className="p-2 rounded-full hover:bg-white/15 active:scale-95 text-purple-100 transition-all"
            title="مكالمة فيديو"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            onClick={() => onStartAudioCall(conversation.peerUser)}
            className="p-2 rounded-full hover:bg-white/15 active:scale-95 text-purple-100 transition-all"
            title="مكالمة صوتية"
          >
            <Phone className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => alert(`خيارات محادثة ${conversation.peerUser.name}`)}
            className="p-1 rounded-full hover:bg-white/15 text-purple-200"
          >
            <MoreVertical className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-purple-50/20 via-transparent to-purple-50/30 dark:from-purple-950/20 dark:to-slate-950/60">
        {conversation.messages.map((msg) => {
          const isMe = msg.senderId === 'user_me';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${
                isMe ? 'mr-auto' : 'ml-auto'
              }`}
            >
              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-3.5 py-2.5 shadow-sm text-sm ${
                  isMe
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-700/60 rounded-bl-none'
                }`}
              >
                {/* 1. Text Message */}
                {msg.type === 'text' && (
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                )}

                {/* 2. Image Message */}
                {msg.type === 'image' && msg.mediaUrl && (
                  <div className="rounded-xl overflow-hidden my-0.5 max-w-xs border border-white/20">
                    <img
                      src={msg.mediaUrl}
                      alt="مرفق صورة"
                      className="w-full max-h-56 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* 3. Audio / Voice Message Waveform */}
                {msg.type === 'audio' && (
                  <div className="flex items-center gap-3 py-1 min-w-[200px]">
                    <button
                      onClick={() => toggleAudioPlay(msg.id)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                        isMe
                          ? 'bg-white text-purple-700'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {isPlayingAudio === msg.id ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current mr-0.5" />
                      )}
                    </button>

                    {/* Stylized Audio Waveform Bars */}
                    <div className="flex-1 flex items-center gap-0.5 h-6">
                      {[35, 60, 45, 90, 75, 40, 85, 95, 60, 30, 70, 80, 50, 40, 65, 80, 45].map(
                        (h, i) => (
                          <span
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`w-0.5 rounded-full transition-all ${
                              isPlayingAudio === msg.id && i % 2 === 0
                                ? 'bg-cyan-300 animate-pulse'
                                : isMe
                                ? 'bg-white/80'
                                : 'bg-purple-600 dark:bg-purple-400'
                            }`}
                          />
                        )
                      )}
                    </div>

                    <span className="text-[11px] font-mono opacity-90 shrink-0">
                      {msg.audioDuration || '0:22'}
                    </span>
                  </div>
                )}

                {/* Timestamp & read receipts */}
                <div
                  className={`flex items-center gap-1 justify-end text-[10px] mt-1 ${
                    isMe ? 'text-purple-200' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <span className="font-mono">{msg.timestamp}</span>
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-cyan-200" />
                      ) : (
                        <Check className="w-3.5 h-3.5 opacity-80" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Real-time typing bubble */}
        {isTyping && (
          <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-800 text-purple-600 border border-slate-200 dark:border-slate-700 w-20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachments popup menu */}
      {showAttachmentsMenu && (
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3 grid grid-cols-3 gap-2 shrink-0 animate-in slide-in-from-bottom-2">
          <button
            onClick={handleSendSampleImage}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-300 text-xs font-semibold"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span>إرسال صورة</span>
          </button>

          <button
            onClick={() => {
              setShowAttachmentsMenu(false);
              onStartAudioCall(conversation.peerUser);
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-300 text-xs font-semibold"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <span>اتصال صوتي</span>
          </button>

          <button
            onClick={() => {
              setShowAttachmentsMenu(false);
              onStartVideoCall(conversation.peerUser);
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-300 text-xs font-semibold"
          >
            <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-950/60 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <span>مكالمة فيديو</span>
          </button>
        </div>
      )}

      {/* Input Bar matching reference */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2.5 flex items-center gap-2 shrink-0 z-20">
        {/* + Add Attachment */}
        <button
          onClick={() => setShowAttachmentsMenu(!showAttachmentsMenu)}
          className="p-2 rounded-full text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="إضافة مرفق"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Image icon */}
        <button
          onClick={handleSendSampleImage}
          className="p-2 rounded-full text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="معرض الصور"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Voice recording button */}
        {!isRecordingVoice ? (
          <button
            onClick={() => setIsRecordingVoice(true)}
            className="p-2 rounded-full text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="تسجيل رسالة صوتية"
          >
            <Mic className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-between bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-full text-red-600 dark:text-red-400 animate-pulse text-xs">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              جاري التسجيل: {recordSeconds} ثانية
            </span>
            <button
              onClick={handleStopAndSendVoice}
              className="px-3 py-1 rounded-full bg-red-600 text-white font-bold text-[11px]"
            >
              إرسال
            </button>
          </div>
        )}

        {/* Text Input Field */}
        {!isRecordingVoice && (
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder="اكتب رسالتك..."
              className="w-full py-2 px-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {/* Purple Send Button */}
        {!isRecordingVoice && (
          <button
            onClick={handleSendText}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-purple-700 hover:bg-purple-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center shadow-md shadow-purple-900/30 transition-all shrink-0"
            title="إرسال"
          >
            <Send className="w-4.5 h-4.5 -rotate-45 ml-0.5" />
          </button>
        )}
      </div>
    </div>
  );
};
