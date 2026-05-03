import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Send, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chatbotQuickPrompts, createLocalChatbotReply } from '../data/chatbotKnowledge';

const robotIconUrl = 'https://cdn-icons-png.flaticon.com/128/18355/18355220.png';

const makeMessage = (role, payload) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  ...payload,
});

const ChatbotWidget = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const hidden = location.pathname.startsWith('/admin');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(() => [
    makeMessage('bot', createLocalChatbotReply('', user)),
  ]);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = (value) => {
    const content = value.trim();
    if (!content) return;

    const reply = createLocalChatbotReply(content, user);
    setMessages((current) => [
      ...current,
      makeMessage('user', { text: content }),
      makeMessage('bot', reply),
    ]);
    setDraft('');
    setOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(draft);
  };

  const handleAction = (action) => {
    if (action.href) {
      window.location.href = action.href;
      return;
    }

    if (action.to) {
      navigate(action.to);
      setOpen(false);
    }
  };

  const resetChat = () => {
    setMessages([makeMessage('bot', createLocalChatbotReply('', user))]);
    setDraft('');
  };

  if (hidden) return null;

  return (
    <div className="fixed bottom-5 left-5 right-5 z-[60] sm:left-auto sm:w-[390px]">
      {open && (
        <section className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-lift">
          <header className="flex items-center justify-between gap-4 border-b border-slate-100 bg-brand-950 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="relative grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm">
                <span className="absolute inset-0 rounded-full bg-accent-400/25 animate-chatbot-pulse-ring" />
                <img src={robotIconUrl} alt="Theo Assistant robot" className="relative h-8 w-8 animate-chatbot-float object-contain" />
              </span>
              <div>
                <h2 className="text-sm font-bold">Theo Assistant</h2>
                <p className="mt-1 text-xs text-slate-300">Local event help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                className="grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Reset chat"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <X size={17} />
              </button>
            </div>
          </header>

          <div ref={messagesRef} className="max-h-[430px] space-y-4 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((message) => (
              <article key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-accent-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700'
                }`}
                >
                  <p>{message.text}</p>
                  {message.bullets?.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {message.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {message.actions?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action) => (
                        <button
                          key={`${message.id}-${action.label}`}
                          type="button"
                          onClick={() => handleAction(action)}
                          className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-slate-100 bg-white p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {chatbotQuickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-accent-50 hover:text-accent-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about services, quotes, rentals..."
                className="h-11 rounded-md border-slate-200 bg-white py-0 text-sm text-slate-950 placeholder:text-slate-400"
                aria-label="Chat message"
              />
              <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-brand-950 text-white hover:bg-black" aria-label="Send message">
                <Send size={17} />
              </button>
            </form>
            <a
              href="https://www.flaticon.com/free-icon/robot_18355220"
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-[10px] font-medium text-slate-400 hover:text-slate-600"
            >
              
            </a>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="group ml-auto flex h-12 items-center gap-2 rounded-full border border-white/10 bg-brand-950 px-3 pr-4 text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-black"
        aria-label={open ? 'Close Theo Assistant' : 'Open Theo Assistant'}
        aria-expanded={open}
      >
        <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white shadow-sm">
          <span className="absolute inset-0 rounded-full bg-accent-400/30 animate-chatbot-pulse-ring" />
          <img src={robotIconUrl} alt="" className="relative h-6 w-6 animate-chatbot-float object-contain" />
        </span>
        <span className="text-sm font-bold leading-none">{open ? 'Close' : 'Chat'}</span>
      </button>
    </div>
  );
};

export default ChatbotWidget;
