import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { BookOpen, Video, Users, FileText, Send, Bot, User, Sparkles, MessageSquare, Map, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from '../../supabaseClient';

const TYPE_ICONS = { text: BookOpen, video: Video, audio: FileText, lecture: Video };

const StudyPathAI = ({ milestones = [], resources = [], userProgress = {} }) => {
  const incompleteMilestones = useMemo(
    () => milestones.filter((m) => !userProgress[m.id]?.completed),
    [milestones, userProgress]
  );

  const nextMilestone = incompleteMilestones[0] || null;
  const nextResource = nextMilestone?.resource_id
    ? resources.find((r) => r.id === nextMilestone.resource_id)
    : null;

  const recommendationText = nextMilestone
    ? `Based on your progress, we recommend completing "${nextMilestone.title}" next.`
    : milestones.length > 0
      ? 'Congratulations! You have completed all current milestones.'
      : 'No milestones are available yet. Check back soon!';

  const pathSteps = useMemo(() => {
    return milestones.map((m, idx) => {
      const linkedResource = resources.find((r) => r.id === m.resource_id);
      const completed = userProgress[m.id]?.completed === true;
      const IconComp = linkedResource ? (TYPE_ICONS[linkedResource.type] || BookOpen) : BookOpen;
      return {
        step: idx + 1,
        title: m.chinese_title || m.title,
        subtitle: m.chinese_title ? m.title : (m.description || ''),
        suggestion: m.description || (linkedResource ? `Resource: ${linkedResource.title}` : 'Complete this milestone.'),
        IconComp,
        completed,
      };
    });
  }, [milestones, resources, userProgress]);
  const [activeTab, setActiveTab] = useState('path'); // 'path' or 'chat'
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hello! I am your AI Study Assistant. How can I help you with your Marxist theory studies today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  const buildContext = useCallback(() => {
    const completedCount = milestones.filter((m) => userProgress[m.id]?.completed).length;
    return {
      milestones: milestones.map((m) => ({
        title: m.title,
        description: m.description,
        completed: !!userProgress[m.id]?.completed,
      })),
      resources: resources.map((r) => ({
        title: r.title,
        type: r.type,
        author: r.author,
      })),
      completedCount,
      totalCount: milestones.length,
      nextMilestone: nextMilestone?.title || null,
    };
  }, [milestones, resources, userProgress, nextMilestone]);

  const getLocalFallback = useCallback((userInput) => {
    const lower = userInput.toLowerCase();
    if (lower.includes('path') || lower.includes('plan') || lower.includes('next')) {
      return nextMilestone
        ? `Your next milestone is "${nextMilestone.title}". ${nextMilestone.description || ''}`
        : milestones.length > 0
          ? "You've completed all milestones! Great work, comrade."
          : "No milestones available yet. Try exploring the Study Resources section.";
    }
    if (lower.includes('progress') || lower.includes('done') || lower.includes('completed')) {
      const completed = milestones.filter((m) => userProgress[m.id]?.completed).length;
      return `You've completed ${completed} of ${milestones.length} milestones. ${completed < milestones.length ? 'Keep going!' : 'All done!'}`;
    }
    if (lower.includes('book') || lower.includes('read') || lower.includes('text')) {
      const textResources = resources.filter((r) => r.type === 'text');
      return textResources.length > 0
        ? `Available texts: ${textResources.map((r) => `"${r.title}"`).join(', ')}. I recommend starting with the featured ones.`
        : "No text resources are available yet. Check back soon!";
    }
    return "I can help you with study planning, understanding Marxist concepts, or finding resources. Try asking about your next steps, specific concepts, or recommended readings!";
  }, [milestones, resources, userProgress, nextMilestone]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Send only the last 10 messages for context window efficiency
      const recentMessages = updatedMessages.slice(-10);
      const { data, error } = await supabase.functions.invoke('study-ai-chat', {
        body: {
          messages: recentMessages,
          context: buildContext(),
        },
      });

      if (error) throw new Error(error.message);

      const reply = data?.reply;
      if (!reply) throw new Error('Empty response');

      setMessages((prev) => [...prev, { type: 'bot', content: reply }]);
    } catch (err) {
      console.warn('AI chat error, using fallback:', err);
      const fallback = getLocalFallback(input);
      setMessages((prev) => [...prev, { type: 'bot', content: fallback }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <section className="flex flex-col h-[500px]" onClick={(e) => e.stopPropagation()}>
      {/* Tabs */}
      <div className="flex p-1 bg-black/20 rounded-lg mb-4">
        <button
          onClick={(e) => { e.stopPropagation(); setActiveTab('path'); }}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-300 flex items-center justify-center gap-2
            ${activeTab === 'path' 
              ? 'bg-red-900/20 text-red-400 shadow-sm ring-1 ring-red-500/20' 
              : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Map className="w-3.5 h-3.5" />
          Study Path
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setActiveTab('chat'); }}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-300 flex items-center justify-center gap-2
            ${activeTab === 'chat' 
              ? 'bg-red-900/20 text-red-400 shadow-sm ring-1 ring-red-500/20' 
              : 'text-gray-500 hover:text-gray-300'}`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          AI Assistant
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
        {activeTab === 'path' ? (
          <div className="space-y-4 pb-4">
            <div className="p-4 bg-gradient-to-br from-red-900/10 to-transparent border border-red-500/10 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Sparkles className="w-12 h-12" />
              </div>
              <div className="flex items-center gap-2 text-red-400 mb-2 relative z-10">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wider">AI Insight</span>
              </div>
              <p className="text-sm text-gray-300 relative z-10 leading-relaxed">
                {recommendationText}
              </p>
            </div>
            
            <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-red-900/50 before:via-red-900/30 before:to-transparent">
              {pathSteps.length === 0 ? (
                <p className="text-xs text-gray-500 pl-8">No study path steps available yet.</p>
              ) : pathSteps.map((item) => (
                <div key={item.step} className="relative pl-8 group">
                  <div className={`absolute left-[-12px] top-1 w-6 h-6 rounded-full bg-[#13141c] border-2 flex items-center justify-center z-10 transition-all duration-300 ${
                    item.completed
                      ? 'border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                      : 'border-red-900/50 group-hover:border-red-500 group-hover:scale-110'
                  }`}>
                    {item.completed
                      ? <CheckCircle className="w-3 h-3 text-green-400" />
                      : <span className="text-[10px] font-bold text-gray-500 group-hover:text-red-400">{item.step}</span>
                    }
                  </div>
                  
                  <div className={`bg-white/5 border rounded-lg p-3 transition-all duration-300 hover:bg-white/10 hover:translate-x-1 ${
                    item.completed ? 'border-green-500/20' : 'border-white/5'
                  }`}>
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`text-sm font-bold transition-colors ${
                        item.completed ? 'text-green-300' : 'text-gray-200 group-hover:text-red-400'
                      }`}>{item.title}</h3>
                      <span className="text-[10px] text-gray-600 uppercase">{item.subtitle}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">{item.suggestion}</p>
                    <div className="flex items-center gap-2 text-[10px] text-red-400/80 font-medium">
                      <item.IconComp className="w-3 h-3" />
                      <span>{item.completed ? 'Completed' : 'Recommended Resource'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-4 overflow-y-auto mb-4 pr-1">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg
                      ${msg.type === 'user' ? 'bg-red-600 text-white' : 'bg-[#1a1b26] text-red-400 border border-red-900/20'}`}>
                      {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                      msg.type === 'user' 
                        ? 'bg-red-600 text-white rounded-tr-none' 
                        : 'bg-[#1a1b26] border border-white/5 text-gray-300 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1a1b26] border border-red-900/20 flex items-center justify-center flex-shrink-0 text-red-400">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-[#1a1b26] border border-white/5 p-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-red-500/5 rounded-xl blur transition-opacity duration-300 opacity-0 group-hover:opacity-100"></div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                placeholder="Ask about study plans..."
                className="w-full bg-[#0a0b10] border border-white/10 text-white rounded-xl pl-4 pr-12 py-3 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-sm shadow-inner placeholder-gray-600"
              />
              <button 
                onClick={(e) => { e.stopPropagation(); handleSend(); }}
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StudyPathAI;
