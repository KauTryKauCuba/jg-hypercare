import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';

interface Attachment {
  name: string;
  size: string;
  type: 'image' | 'doc';
  url: string;
}

interface Bubble {
  type: 'grey' | 'light-teal' | 'solid-teal' | 'outline-teal' | 'card-box';
  text: string;
  isClickablePrompt?: boolean;
}

interface Message {
  id: string;
  sender: 'user' | 'contact';
  senderName: string;
  senderTitle: string;
  senderAvatar: string;
  bubbles: Bubble[];
  attachments?: Attachment[];
  timestamp: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  status: 'Online' | 'Offline';
  avatar: string;
  unreadCount?: number;
  isRead?: boolean;
}

export default function ChatgigaPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'read' | 'unread' | 'faq'>('all');
  const [selectedContactId, setSelectedContactId] = useState<string>('amir');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [activePopupAttachment, setActivePopupAttachment] = useState<Attachment | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);

  // Close emoji picker on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Initial contacts matching screenshot
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 'amir',
      name: 'Amir Khan',
      role: 'Graphic Designer',
      status: 'Online',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      isRead: true,
    },
    {
      id: 'siti',
      name: 'Siti Nabila',
      role: 'Graphic Designer',
      status: 'Offline',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      isRead: true,
    },
    {
      id: 'firdaus',
      name: 'Ahmad Firdaus',
      role: 'Graphic Designer',
      status: 'Online',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      unreadCount: 1,
      isRead: false,
    },
  ]);

  // Initial chat threads per contact
  const [chatThreads, setChatThreads] = useState<Record<string, Message[]>>({
    amir: [
      {
        id: 'msg-1',
        sender: 'contact',
        senderName: 'Amir Khan',
        senderTitle: 'Graphic Designer',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        bubbles: [{ type: 'grey', text: 'Hello, Ahmad Yusuf..' }],
        timestamp: 'Mon 11:00 AM',
      },
      {
        id: 'msg-2',
        sender: 'user',
        senderName: 'Ahmad Yusuf',
        senderTitle: 'HR Manager',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
        bubbles: [
          { type: 'light-teal', text: 'What can we help you with today?' },
          { type: 'solid-teal', text: 'What Are The Main Responsibilities For This Role?' },
          { type: 'outline-teal', text: 'What Is The Working Schedule And Location?', isClickablePrompt: true },
          { type: 'outline-teal', text: 'What Is The Salary Range And Benefits Offered?', isClickablePrompt: true },
        ],
        timestamp: 'Mon 11:45 AM',
      },
      {
        id: 'msg-3',
        sender: 'contact',
        senderName: 'Amir Khan',
        senderTitle: 'Graphic Designer',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        bubbles: [{ type: 'outline-teal', text: 'What Are The Main Responsibilities For This Role?' }],
        timestamp: 'Mon 11:50 AM',
      },
      {
        id: 'msg-4',
        sender: 'user',
        senderName: 'Ahmad Yusuf',
        senderTitle: 'HR Manager',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
        bubbles: [
          {
            type: 'card-box',
            text: 'This position is full-time, Monday to Friday, from 9:00 AM to 6:00 PM. The role is based at our office, with flexible arrangements such as hybrid or remote work depending on performance and project needs.',
          },
          { type: 'light-teal', text: 'Anything else I can help you with?' },
          { type: 'outline-teal', text: 'What Is The Working Schedule And Location?', isClickablePrompt: true },
        ],
        timestamp: 'Mon 11:52 AM',
      },
    ],
    siti: [
      {
        id: 'msg-siti-1',
        sender: 'contact',
        senderName: 'Siti Nabila',
        senderTitle: 'Graphic Designer',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        bubbles: [{ type: 'grey', text: 'Hi Mr. Ahmad, I submitted my updated portfolio for review.' }],
        attachments: [
          {
            name: 'Portfolio_Design_2026.pdf',
            size: '2.4 MB',
            type: 'doc',
            url: '#',
          },
        ],
        timestamp: 'Yesterday 3:15 PM',
      },
    ],
    firdaus: [
      {
        id: 'msg-fird-1',
        sender: 'contact',
        senderName: 'Ahmad Firdaus',
        senderTitle: 'Graphic Designer',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        bubbles: [{ type: 'grey', text: 'Good morning! Could you clarify the interview location details?' }],
        timestamp: 'Today 9:30 AM',
      },
    ],
  });

  // Auto scroll to bottom of messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatThreads, selectedContactId]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Handle multiple file selections (docs or images)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => {
      const isImg = file.type.startsWith('image/');
      return {
        name: file.name,
        size: formatFileSize(file.size),
        type: isImg ? 'image' : 'doc',
        url: URL.createObjectURL(file),
      };
    });

    setPendingAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const removePendingAttachment = (indexToRemove: number) => {
    setPendingAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle emoji click from emoji-picker-react
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setChatInput((prev) => prev + emojiData.emoji);
  };

  // Send message handler
  const handleSendMessage = (customText?: string) => {
    const textToSend = customText !== undefined ? customText : chatInput.trim();
    if (!textToSend && pendingAttachments.length === 0) return;

    const currentContact = contacts.find((c) => c.id === selectedContactId);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      senderName: 'Ahmad Yusuf',
      senderTitle: 'HR Manager',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
      bubbles: textToSend ? [{ type: 'light-teal', text: textToSend }] : [],
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
      timestamp: `Today ${timeStr}`,
    };

    setChatThreads((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), newMsg],
    }));

    setChatInput('');
    setPendingAttachments([]);

    // Simulate automated contact response if user asked a question or sent a prompt
    if (textToSend.toLowerCase().includes('schedule') || textToSend.toLowerCase().includes('location')) {
      setTimeout(() => {
        const replyMsg: Message = {
          id: 'reply-' + Date.now(),
          sender: 'contact',
          senderName: currentContact?.name || 'Contact',
          senderTitle: currentContact?.role || 'Applicant',
          senderAvatar: currentContact?.avatar || '',
          bubbles: [
            {
              type: 'card-box',
              text: 'Thanks for asking! Work hours are 9:00 AM - 6:00 PM (Monday-Friday) at our main Kuala Lumpur office, with flexible hybrid options.',
            },
          ],
          timestamp: `Today ${timeStr}`,
        };
        setChatThreads((prev) => ({
          ...prev,
          [selectedContactId]: [...(prev[selectedContactId] || []), replyMsg],
        }));
      }, 1000);
    } else if (textToSend.toLowerCase().includes('salary') || textToSend.toLowerCase().includes('benefits')) {
      setTimeout(() => {
        const replyMsg: Message = {
          id: 'reply-' + Date.now(),
          sender: 'contact',
          senderName: currentContact?.name || 'Contact',
          senderTitle: currentContact?.role || 'Applicant',
          senderAvatar: currentContact?.avatar || '',
          bubbles: [
            {
              type: 'card-box',
              text: 'The offered salary range is RM 3,500 - RM 5,000 based on experience, including medical coverage and performance bonuses.',
            },
          ],
          timestamp: `Today ${timeStr}`,
        };
        setChatThreads((prev) => ({
          ...prev,
          [selectedContactId]: [...(prev[selectedContactId] || []), replyMsg],
        }));
      }, 1000);
    }
  };

  // Click on a prompt option pill to send it
  const handlePromptClick = (promptText: string) => {
    handleSendMessage(promptText);
  };

  // Delete contact / clear conversation
  const handleDeleteContact = (contactId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat conversation?')) {
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      if (selectedContactId === contactId) {
        const remaining = contacts.filter((c) => c.id !== contactId);
        if (remaining.length > 0) setSelectedContactId(remaining[0].id);
      }
    }
  };

  // Filter contacts by search query & active sub-tab
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'unread') return contact.unreadCount && contact.unreadCount > 0;
    if (activeTab === 'read') return contact.isRead;
    return true;
  });

  const activeMessages = chatThreads[selectedContactId] || [];

  return (
    <div className="jobgiga-dashboard">
      {/* Hidden inputs for multiple document & image upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,.pdf,.doc,.docx"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Attachment Viewer Popup Modal */}
      {activePopupAttachment && (
        <div className="cg-modal-overlay" onClick={() => setActivePopupAttachment(null)}>
          <div className="cg-modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              className="cg-modal-close-btn"
              title="Close preview"
              onClick={() => setActivePopupAttachment(null)}
            >
              ✕
            </button>

            <div className="cg-modal-header">
              <div>
                <h3 className="cg-modal-title">{activePopupAttachment.name}</h3>
                <span className="cg-modal-sub">{activePopupAttachment.size} • Click outside or ✕ to exit</span>
              </div>
            </div>

            {activePopupAttachment.type === 'image' ? (
              <div className="cg-modal-img-wrapper">
                <img
                  src={activePopupAttachment.url}
                  alt={activePopupAttachment.name}
                  className="cg-modal-full-img"
                />
              </div>
            ) : (
              <div className="cg-modal-doc-box">
                <div className="cg-modal-doc-icon">📄</div>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '16px', color: '#0f172a' }}>
                    {activePopupAttachment.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Document attachment ready for viewing or download ({activePopupAttachment.size})
                  </p>
                </div>
                {activePopupAttachment.url !== '#' ? (
                  <a
                    href={activePopupAttachment.url}
                    download={activePopupAttachment.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cg-modal-action-btn"
                  >
                    ⬇️ Download / Open Document
                  </a>
                ) : (
                  <button className="cg-modal-action-btn" onClick={() => alert(`Downloading ${activePopupAttachment.name}`)}>
                    ⬇️ Download / Open Document
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon-svg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="#009698" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="logo-text">JobGiga</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <span className="group-label">Main</span>
            <div className="nav-item">
              <span className="nav-icon-svg">📊</span>
              <span>Dashboard</span>
            </div>
          </div>

          <div className="nav-group">
            <span className="group-label">Recruitment</span>
            <div className="nav-item">
              <span className="nav-icon-svg">💼</span>
              <span>Manage Jobs</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">👥</span>
              <span>Applicants</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">🗓️</span>
              <span>Interview</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">🔍</span>
              <span>Search Talent</span>
            </div>
          </div>

          <div className="nav-group">
            <span className="group-label">Communication</span>
            <div className="nav-item active">
              <span className="nav-icon-svg">💬</span>
              <span>ChatGiga</span>
            </div>
          </div>

          <div className="nav-group">
            <span className="group-label">Management</span>
            <div className="nav-item">
              <span className="nav-icon-svg">👤</span>
              <span>Employees</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">📄</span>
              <span>Forms</span>
            </div>
          </div>

          <div className="nav-group">
            <span className="group-label">Growth</span>
            <div className="nav-item">
              <span className="nav-icon-svg">📈</span>
              <span>Analytics</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">📢</span>
              <span>Ads Management</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">🏷️</span>
              <span>Pricing</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">💳</span>
              <span>Billing</span>
            </div>
          </div>

          <div className="nav-group">
            <span className="group-label">Support</span>
            <div className="nav-item">
              <span className="nav-icon-svg">🎧</span>
              <span>Support</span>
            </div>
          </div>
        </nav>

        {/* Sidebar Ad Card */}
        <div className="sidebar-ad-card">
          <div className="ad-illustration">
            <span className="ad-badge-text">Jobs/Company Ads</span>
          </div>
          <button className="ad-btn-action">Try Now for Free!</button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="main-panel">
        {/* Top Navbar */}
        <header className="navbar">
          <div className="nav-left">
            <button className="sidebar-toggle-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="company-select-badge">
              <div className="company-avatar-img">
                <img src="https://api.iconify.design/lucide:building-2.svg" alt="" width="16" />
              </div>
              <span className="company-name-text">companytestC1</span>
              <span className="caret-icon">ˆ</span>
            </div>

            <button className="my-company-outline-btn">
              <span className="icon-building">🏢</span> My Company
            </button>
          </div>

          <div className="nav-right">
            <button className="icon-circle-btn">
              🔔
              <span className="dot-notification"></span>
            </button>
            
            <button className="gigapremium-btn">GigaPremium</button>
            
            <div className="lang-dropdown">
              <span className="flag-icon">🇺🇸</span>
              <span>EN</span>
              <span className="caret-icon">ˆ</span>
            </div>
            
            <div className="user-profile-block">
              <div className="user-text">
                <span className="user-handle">emp-mudd-01</span>
                <span className="user-title">HR Manager</span>
              </div>
              <div className="user-avatar-circle">
                <span>m</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="content-container">
          {/* Header Title */}
          <div className="content-header-title" style={{ marginBottom: '16px' }}>
            <button className="back-arrow-circle" onClick={() => navigate('/')} title="Back to Home">
              ←
            </button>
            <h1>ChatGiga</h1>
          </div>

          {/* Filter Sub-Tabs */}
          <div className="cg-tabs">
            <div className={`cg-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              All ({contacts.length})
            </div>
            <div className={`cg-tab ${activeTab === 'read' ? 'active' : ''}`} onClick={() => setActiveTab('read')}>
              Read (7)
            </div>
            <div className={`cg-tab ${activeTab === 'unread' ? 'active' : ''}`} onClick={() => setActiveTab('unread')}>
              Unread (1)
            </div>
            <div className={`cg-tab ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => setActiveTab('faq')}>
              Chat FAQ (3)
            </div>
          </div>

          {/* Main Card Split Panel */}
          <div className="cg-main-card">
            {/* Left Contact List Sidebar */}
            <div className="cg-contact-sidebar">
              <select className="cg-filter-dropdown" defaultValue="All">
                <option value="All">All</option>
                <option value="Graphic Designer">Graphic Designer</option>
                <option value="Unread">Unread</option>
              </select>

              <div className="cg-search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="cg-chat-header-row">
                <span className="cg-chat-header-title">Chat</span>
                <span className="cg-online-badge">
                  <span className="cg-online-dot"></span> Online
                </span>
              </div>

              {/* Contact Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`cg-contact-card ${selectedContactId === contact.id ? 'selected' : ''}`}
                      onClick={() => setSelectedContactId(contact.id)}
                    >
                      <button
                        className="cg-trash-btn"
                        title="Delete conversation"
                        onClick={(e) => handleDeleteContact(contact.id, e)}
                      >
                        🗑️
                      </button>
                      
                      <div className="cg-contact-top-row">
                        <img src={contact.avatar} alt={contact.name} className="cg-avatar" />
                        <div className="cg-contact-info">
                          <span className="cg-contact-name">{contact.name}</span>
                          <span className="cg-contact-role">{contact.role}</span>
                        </div>
                      </div>

                      <div>
                        {contact.status === 'Online' ? (
                          <span className="cg-online-badge">
                            <span className="cg-online-dot"></span> Online
                          </span>
                        ) : (
                          <span className="cg-offline-badge">
                            <span className="cg-offline-dot"></span> Offline
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>
                    No contacts found
                  </div>
                )}
              </div>
            </div>

            {/* Right Chat Conversation Window */}
            <div className="cg-chat-window">
              <div className="cg-messages-list">
                {activeMessages.map((msg) => (
                  <div key={msg.id} className={`cg-msg-group ${msg.sender === 'user' ? 'right' : 'left'}`}>
                    <div className="cg-sender-header">
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="cg-avatar"
                        style={{ width: '36px', height: '36px' }}
                      />
                      <div className="cg-sender-info">
                        <span className="cg-sender-name">{msg.senderName}</span>
                        <span className="cg-sender-title">{msg.senderTitle}</span>
                      </div>
                    </div>

                    {/* Render text message bubbles */}
                    {msg.bubbles &&
                      msg.bubbles.map((bubble, idx) => {
                        if (bubble.type === 'grey') {
                          return (
                            <div key={idx} className="cg-bubble-grey">
                              {bubble.text}
                            </div>
                          );
                        }
                        if (bubble.type === 'light-teal') {
                          return (
                            <div key={idx} className="cg-bubble-light-teal">
                              {bubble.text}
                            </div>
                          );
                        }
                        if (bubble.type === 'solid-teal') {
                          return (
                            <div key={idx} className="cg-bubble-solid-teal">
                              {bubble.text}
                            </div>
                          );
                        }
                        if (bubble.type === 'outline-teal') {
                          return (
                            <div
                              key={idx}
                              className="cg-bubble-outline-teal"
                              onClick={() => bubble.isClickablePrompt && handlePromptClick(bubble.text)}
                              style={{ cursor: bubble.isClickablePrompt ? 'pointer' : 'default' }}
                            >
                              {bubble.text}
                            </div>
                          );
                        }
                        if (bubble.type === 'card-box') {
                          return (
                            <div key={idx} className="cg-bubble-card-box">
                              {bubble.text}
                            </div>
                          );
                        }
                        return null;
                      })}

                    {/* Render Multiple Attachments (Standardized & Clickable) */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                        {msg.attachments.map((att, attIdx) => (
                          <div
                            key={attIdx}
                            className="cg-msg-attachment-card"
                            onClick={() => setActivePopupAttachment(att)}
                            title={att.type === 'image' ? 'Click to expand image preview' : 'Click to view document details'}
                          >
                            {att.type === 'image' ? (
                              <img
                                src={att.url}
                                alt={att.name}
                                className="cg-attachment-thumb"
                                style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="cg-attachment-icon-box" style={{ width: '44px', height: '44px', borderRadius: '10px', fontSize: '20px' }}>
                                📄
                              </div>
                            )}

                            <div className="cg-attachment-details">
                              <span className="cg-attachment-name">{att.name}</span>
                              <span className="cg-attachment-size">{att.size}</span>
                            </div>

                            <span className="cg-file-type-badge">
                              {att.type === 'image'
                                ? (att.name.split('.').pop()?.toUpperCase() || 'IMAGE')
                                : (att.name.split('.').pop()?.toUpperCase() || 'PDF')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <span className="cg-timestamp">{msg.timestamp}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Multiple Attachment Previews Container above Input */}
              {pendingAttachments.length > 0 && (
                <div className="cg-attachment-previews-container">
                  {pendingAttachments.map((att, index) => (
                    <div key={index} className="cg-attachment-preview-box">
                      {att.type === 'image' ? (
                        <img
                          src={att.url}
                          alt={att.name}
                          className="cg-attachment-thumb"
                        />
                      ) : (
                        <div className="cg-attachment-icon-box">📄</div>
                      )}
                      <div className="cg-attachment-details">
                        <span className="cg-attachment-name">{att.name}</span>
                        <span className="cg-attachment-size">{att.size}</span>
                      </div>
                      <button
                        className="cg-attachment-remove-btn"
                        title="Remove attachment"
                        onClick={() => removePendingAttachment(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Input Area with Emoji Picker Popover */}
              <div style={{ position: 'relative' }}>
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    style={{
                      position: 'absolute',
                      bottom: '60px',
                      right: '40px',
                      zIndex: 1000,
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                    }}
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={320}
                      height={380}
                      searchDisabled={false}
                      skinTonesDisabled
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}

                <div className="cg-input-bar">
                  <button
                    className="cg-icon-btn"
                    title="Attach multiple documents or images (.pdf, .doc, images)"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📎
                  </button>

                  <input
                    type="text"
                    placeholder="Enter Chat"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                  />

                  <button
                    className="cg-icon-btn"
                    title="Open Emoji Picker"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  >
                    😊
                  </button>

                  <button
                    className="cg-icon-btn"
                    title="Attach photos"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    📷
                  </button>

                  <button
                    className="cg-send-button"
                    title="Send message"
                    onClick={() => handleSendMessage()}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
