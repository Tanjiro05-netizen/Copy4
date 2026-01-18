import React, { useState, useRef, useEffect } from "react";
import { BookOpen, Video, Users, FileText, Send, Bot, User, Sparkles, MessageSquare, Map, ChevronRight } from "lucide-react";

const dummyPath = [
  {
    step: 1,
    title: "基础理论",
    subtitle: "Foundational Theory",
    icon: <BookOpen className="w-5 h-5" />,
    suggestion: "Start with foundational texts: The Communist Manifesto."
  },
  {
    step: 2,
    title: "视频讲座",
    subtitle: "Video Lectures",
    icon: <Video className="w-5 h-5" />,
    suggestion: "Watch introductory video lectures on Marxist theory."
  },
  {
    step: 3,
    title: "概念分析",
    subtitle: "Concept Analysis",
    icon: <FileText className="w-5 h-5" />,
    suggestion: "Analyze key concepts: Historical Materialism, Class Struggle."
  },
  {
    step: 4,
    title: "社区讨论",
    subtitle: "Community Discussion",
    icon: <Users className="w-5 h-5" />,
    suggestion: "Participate in community Q&A for clarification."
  }
];

const StudyPathAI = () => {
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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let botResponse = "I can help you find resources on that topic. Would you like me to create a custom study path for you?";
      
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('path') || lowerInput.includes('plan')) {
        botResponse = "I've analyzed your request. Based on your interest, I recommend starting with 'Wage Labour and Capital' followed by 'Value, Price and Profit'.";
      } else if (lowerInput.includes('concept') || lowerInput.includes('explain') || lowerInput.includes('what is')) {
        botResponse = "That's a complex concept. In Marxist theory, it typically refers to the way material conditions influence social organization.";
      } else if (lowerInput.includes('book') || lowerInput.includes('read')) {
        botResponse = "For reading, I highly recommend 'Das Kapital' if you are ready for a deep dive, or 'The Principles of Communism' for a quicker overview.";
      }

      setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
      setIsTyping(false);
    }, 1500);
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
                Based on your recent activity, we recommend focusing on <strong className="text-white">Historical Materialism</strong> next to build a solid foundation.
              </p>
            </div>
            
            <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-red-900/50 before:via-red-900/30 before:to-transparent">
              {dummyPath.map((item, idx) => (
                <div key={item.step} className="relative pl-8 group">
                  <div className="absolute left-[-12px] top-1 w-6 h-6 rounded-full bg-[#13141c] border-2 border-red-900/50 flex items-center justify-center z-10 group-hover:border-red-500 group-hover:scale-110 transition-all duration-300">
                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-red-400">{item.step}</span>
                  </div>
                  
                  <div className="bg-white/5 border border-white/5 rounded-lg p-3 transition-all duration-300 hover:bg-white/10 hover:translate-x-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-bold text-gray-200 group-hover:text-red-400 transition-colors">{item.title}</h3>
                      <span className="text-[10px] text-gray-600 uppercase">{item.subtitle}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">{item.suggestion}</p>
                    <div className="flex items-center gap-2 text-[10px] text-red-400/80 font-medium">
                      {React.cloneElement(item.icon, { className: "w-3 h-3" })}
                      <span>Recommended Resource</span>
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
