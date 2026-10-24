'use client';

import { useState, useEffect } from 'react';
import { Mail, Trash2, RefreshCw, MessageSquare, Clock, User, ExternalLink } from 'lucide-react';
import ClothesLoader from '@/components/ClothesLoader';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
      } else {
        alert(data.error || 'Failed to delete message');
      }
    } catch (err) {
      alert('Error deleting message');
    }
  };

  // Helper to open webmail directly in browser
  const openWebmail = (provider, msg) => {
    const subject = encodeURIComponent(`Re: ${msg.subject}`);
    const body = encodeURIComponent(`\n\n--- Original Message from ${msg.name} ---\n${msg.message}`);

    if (provider === 'gmail') {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(msg.email)}&su=${subject}&body=${body}`,
        '_blank'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-900">
      <div className="flex justify-between items-center pb-8 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Care Inbox</h1>
          <p className="text-gray-500 text-sm mt-1">Manage inquiries, feedback, and support emails from signed-in users.</p>
        </div>
        <button
          onClick={fetchMessages}
          className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition flex items-center space-x-2 text-sm font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Inbox</span>
        </button>
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <ClothesLoader text="Loading customer messages..." />
        ) : messages.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-600 font-bold text-sm">No customer messages received yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((msg) => (
              <div key={msg._id} className="p-6 hover:bg-gray-50/60 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-indigo-50 text-indigo-700 font-extrabold text-xs px-2.5 py-1 rounded-md border border-indigo-100 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {msg.name}
                    </span>
                    <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400" /> {msg.email}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(msg.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 pt-1">{msg.subject}</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100 whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 md:pt-1">
                  {/* Gmail Direct Webmail Link */}
                  <button
                    onClick={() => openWebmail('gmail', msg)}
                    className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm active:scale-95"
                    title="Open in Gmail Web"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Gmail</span>
                    <ExternalLink className="w-3 h-3 text-indigo-200" />
                  </button>

                  <button
                    onClick={() => handleDelete(msg._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}