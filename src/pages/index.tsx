"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { useLanguage } from '../contexts/LanguageContext';
import RegistrationForm from '../components/RegistrationForm';
import { Message, RegistrationFormData, ChatResponse } from '../types';

interface LocalAxiosError {
  response?: {
    data: ChatResponse;
    status: number;
  };
  request?: unknown;
}

const WelcomeCard = ({ onOptionSelect }: { onOptionSelect: (opt: string) => void }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-[95%] sm:max-w-[90%] w-full">
    <div className="bg-primary-blue/5 p-3 sm:p-4 border-b border-primary-blue/10">
      <h3 className="font-semibold text-primary-blue text-sm">Welcome to AA Kenya - Ngong Town Branch</h3>
    </div>
    <div className="p-2 sm:p-4">
      <ul className="space-y-1.5 sm:space-y-2 text-sm text-gray-600">
        {[
          "Course Information & Fees",
          "Registration Assistance",
          "Payment & NTSA Requirements"
        ].map((item, idx) => (
          <li key={idx}>
            <button
              onClick={() => onOptionSelect(item)}
              className="flex items-center gap-3 w-full text-left bg-gray-50/50 hover:bg-gray-100 p-3 sm:p-2.5 rounded-xl transition-all active:scale-[0.98] border border-gray-100/50 group touch-manipulation"
            >
              <div className="w-6 h-6 rounded-full bg-cta-green/10 flex items-center justify-center shrink-0">
                <span className="text-cta-green text-[10px] font-bold group-hover:scale-110 transition-transform">✓</span>
              </div>
              <span className="text-gray-700 font-medium group-hover:text-primary-blue transition-colors text-[13px] sm:text-[14px]">{item}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const CourseInfoCard = ({ onOptionSelect }: { onOptionSelect: (opt: string) => void }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-[95%] w-full">
    <div className="bg-primary-blue/5 p-4 border-b border-primary-blue/10">
      <h3 className="font-semibold text-primary-blue text-sm">Course Information & Fees</h3>
    </div>
    <div className="p-4 space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">

      {/* Saloon Car */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">🚗 Saloon Car (Category B) <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Beginner&apos;s Course</span></h4>
        <div className="space-y-1.5 text-xs">
          <p><span className="font-semibold">Course Fee:</span> KSh 18,780</p>
          <p><span className="font-semibold">Deposit Option:</span> KSh 12,000 (balance after 1 week)</p>
          <p><span className="font-semibold">NTSA Fee:</span> KSh 2,450 (via eCitizen)</p>
          <p><span className="font-semibold">Duration:</span> 5 weeks</p>
          <p><span className="font-semibold">Intake:</span> Every Wednesday</p>
          <p><span className="font-semibold">Time Slots:</span> 9:00–10:00 AM or 12:00–1:00 PM</p>
          <p><span className="font-semibold">Transmission:</span> Automatic or Manual</p>
        </div>
      </div>

      {/* Premier Driving */}
      <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
        <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-2">⭐ Premier Driving <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Beginner</span></h4>
        <div className="space-y-1 text-xs">
          <p className="text-amber-800"><span className="font-semibold">Course Fee:</span> KSh 50,000</p>
          <p className="text-amber-800"><span className="font-semibold">NTSA Fee:</span> Included in fees + smart driving license</p>
          <p className="text-amber-800"><span className="font-semibold">Duration:</span> 5 weeks</p>
          <p className="text-amber-800 italic">Private lessons</p>
        </div>
      </div>

      {/* Motorcycle */}
      <div className="grid grid-cols-1 gap-3">
        <div className="border border-gray-100 p-3 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-1">🏍️ Motorcycle (Category A-Riders who know how to ride)</h4>
          <div className="space-y-1 text-xs">
            <p><span className="font-semibold">Course Fee:</span> KSh 3,000</p>
            <p><span className="font-semibold">NTSA Fee:</span> KSh 2,450 (via eCitizen)</p>
            <p><span className="font-semibold">Duration:</span> 3 weeks</p>
          </div>
        </div>
        <div className="border border-gray-100 p-3 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-1">🏍️ Motorcycle (Category A)</h4>
          <div className="space-y-1 text-xs">
            <p><span className="font-semibold">Course Fee:</span> KSh 5,780</p>
            <p><span className="font-semibold">NTSA Fee:</span> KSh 2,450 (via eCitizen)</p>
            <p><span className="font-semibold">Duration:</span> 5 weeks</p>
          </div>
        </div>
      </div>

      {/* Other Categories */}
      <div className="space-y-3">
        <div className="border border-gray-100 p-3 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-1">🚐 Passenger Light Vehicle (Category B3)</h4>
          <div className="space-y-1 text-xs">
            <p><span className="font-semibold">Course Fee:</span> KSh 10,780</p>
            <p><span className="font-semibold">NTSA Fee:</span> KSh 2,350</p>
            <p><span className="font-semibold">Duration:</span> 3 weeks</p>
            <p className="text-amber-700 italic">Requires Category B license with 2 years experience.</p>
          </div>
        </div>

        <div className="border border-gray-100 p-3 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-1">🚚 Light & Medium Trucks (Category C1/C)</h4>
          <div className="space-y-1 text-xs">
            <p><span className="font-semibold">Course Fee:</span> KSh 12,780</p>
            <p><span className="font-semibold">NTSA Fee:</span> KSh 2,350</p>
            <p><span className="font-semibold">Duration:</span> 3 weeks</p>
            <p className="text-amber-700 italic">Requires Category B license with 2 years experience.</p>
          </div>
        </div>

        <div className="border border-gray-100 p-3 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-1">🚌 Public Service Vehicle (Category D1/D)</h4>
          <div className="space-y-1 text-xs">
            <p><span className="font-semibold">Course Fee:</span> KSh 12,780</p>
            <p><span className="font-semibold">NTSA Fee:</span> KSh 2,350</p>
            <p><span className="font-semibold">Duration:</span> 3 weeks</p>
            <p className="text-amber-700 italic">Requires Category B and C license</p>
          </div>
        </div>


      </div>

      {/* Refresher & Assessment */}
      <div className="grid grid-cols-1 gap-3 pt-2">
        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <h5 className="font-semibold text-xs mb-1.5">🔄 REFRESHER COURSES (3 Weeks)</h5>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <p>Light Vehicle: KSh 10,000</p>
            <p>Light & Medium Truck: KSh 11,500</p>
            <p className="col-span-2">Premier Refresher: KSh 20,000</p>
          </div>
        </div>
        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <h5 className="font-semibold text-xs mb-1.5">📋 ASSESSMENT COURSES (1-2 Days)</h5>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <p>Class B (Saloon): KSh 5,000</p>
            <p>Class C (Trucks): KSh 6,000</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-xs">
        <h4 className="font-bold text-green-800 mb-1">💳 PAYMENT METHODS</h4>
        <p>• Course Fees — M-Pesa / Bank Transfer ONLY</p>
        <p>• NTSA Fees — via eCitizen</p>
        <p className="text-green-700 italic mt-1">(Cash NOT accepted at branch)</p>
      </div>

    </div>
    <div className="bg-gray-50/50 p-4 border-t border-gray-100/50">
      <p className="text-[10px] text-gray-400 font-bold uppercase mb-3 tracking-widest pl-1">Choose another option</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          "Registration",
          "Payment & NTSA"
        ].map((opt, i) => (
          <button
            key={i}
            onClick={() => onOptionSelect(opt === "Registration" ? "Registration Assistance" : opt === "Payment & NTSA" ? "Payment & NTSA Requirements" : opt)}
            className="px-3 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-[12px] font-bold text-gray-600 hover:text-primary-blue active:bg-blue-50 active:scale-95 transition-all text-center whitespace-nowrap touch-manipulation"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const RegistrationOptionsCard = ({ onOptionSelect, onStartForm }: { onOptionSelect: (opt: string) => void, onStartForm: () => void }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-[90%] w-full">
    <div className="bg-primary-blue/5 p-4 border-b border-primary-blue/10">
      <h3 className="font-semibold text-primary-blue text-sm">Registration Assistance</h3>
    </div>
    <div className="p-4 space-y-4">

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-800">a) Online Self-Registration (Fastest)</h4>
        <a
          href="https://edereva.aakenya.co.ke/students/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2.5 bg-white border-2 border-cta-green text-cta-green rounded-xl text-sm font-bold shadow-sm hover:bg-green-50 transition-colors"
        >
          🔗 Register Online Here
        </a>
      </div>

      <div className="h-px bg-gray-100"></div>

      {/* Option B */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-800">b) Contact AA Kenya - Ngong Town Branch Directly</h4>
        <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-2 border border-slate-100">
          <a href="tel:0759963210" className="flex items-center gap-2 text-gray-600 hover:text-primary-blue transition-colors">
            <span>📞</span> <span className="font-medium">0759963210</span>
          </a>
          <a href="mailto:aangongtown@aakenya.co.ke" className="flex items-center gap-2 text-gray-600 hover:text-primary-blue transition-colors">
            <span>📧</span> <span className="font-medium">aangongtown@aakenya.co.ke</span>
          </a>
        </div>
      </div>

      <div className="h-px bg-gray-100"></div>

      {/* Option C */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-800">c) I Can Help You Get Started!</h4>
        <p className="text-xs text-gray-500">I&apos;ll open a form for you, and we&apos;ll contact you within 24 hours.</p>
        <button
          onClick={onStartForm}
          className="w-full py-2.5 border-2 border-primary-blue text-primary-blue rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors"
        >
          📋 Open Registration Form
        </button>
      </div>

    </div>
    {/* Navigation Footer */}
    <div className="bg-gray-50/50 p-4 border-t border-gray-100/50">
      <div className="grid grid-cols-2 gap-2">
        {[
          "Course Info",
          "Payment & NTSA"
        ].map((opt, i) => (
          <button
            key={i}
            onClick={() => onOptionSelect(opt === "Course Info" ? "Course Information & Fees" : opt === "Payment & NTSA" ? "Payment & NTSA Requirements" : opt)}
            className="px-3 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-[12px] font-bold text-gray-600 hover:text-primary-blue active:bg-blue-50 active:scale-95 transition-all text-center whitespace-nowrap touch-manipulation"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const PaymentInfoCard = ({ onOptionSelect }: { onOptionSelect: (opt: string) => void }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-[90%] w-full">
    <div className="bg-primary-blue/5 p-4 border-b border-primary-blue/10">
      <h3 className="font-semibold text-primary-blue text-sm">💳 Payment & NTSA Requirements</h3>
    </div>
    <div className="p-4 space-y-4">

      {/* Payment Methods */}
      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
        <h4 className="text-sm font-bold text-green-800 mb-3">💳 PAYMENT METHODS</h4>
        <div className="space-y-2 text-sm text-green-900">
          <p><span className="font-semibold">• Course Fees</span> — M-Pesa / Bank Transfer ONLY</p>
          <p><span className="font-semibold">• NTSA Fees</span> — via eCitizen</p>
          <p className="text-green-700 italic mt-2">(Cash NOT accepted at branch)</p>
        </div>
      </div>

      {/* NTSA Requirements */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <h4 className="text-sm font-bold text-blue-800 mb-3">📋 NTSA REQUIREMENTS</h4>
        <div className="space-y-2 text-sm text-blue-900">
          <p className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✅</span>
            <span>National ID or Passport Copy</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✅</span>
            <span>Passport Photos softcopy</span>
          </p>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Need help with NTSA setup?</span> Call us at{' '}
          <a href="tel:0759963210" className="text-primary-blue font-bold">0759963210</a>
        </p>
      </div>

    </div>
    <div className="bg-gray-50/50 p-4 border-t border-gray-100/50">
      <p className="text-[10px] text-gray-400 font-bold uppercase mb-3 tracking-widest pl-1">Choose another option</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          "Course Info",
          "Registration"
        ].map((opt, i) => (
          <button
            key={i}
            onClick={() => onOptionSelect(opt === "Course Info" ? "Course Information & Fees" : opt === "Registration" ? "Registration Assistance" : opt)}
            className="px-3 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-[12px] font-bold text-gray-600 hover:text-primary-blue active:bg-blue-50 active:scale-95 transition-all text-center whitespace-nowrap touch-manipulation"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  </div>
);


const BeginnerCourseCard = ({ onAction }: { onAction: () => void }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-[90%] w-full">
    <div className="bg-primary-blue p-4">
      <h3 className="font-semibold text-white text-sm">Beginner Driving Course</h3>
    </div>
    <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
      <div>
        <span className="block text-xs text-gray-400 uppercase tracking-wide">Duration</span>
        <span className="font-medium text-gray-800">5 Weeks</span>
      </div>
      <div>
        <span className="block text-xs text-gray-400 uppercase tracking-wide">Fee</span>
        <span className="font-medium text-gray-800">KSh 18,780</span>
      </div>
      <div>
        <span className="block text-xs text-gray-400 uppercase tracking-wide">Deposit</span>
        <span className="font-medium text-gray-800">KSh 12,000</span>
      </div>
      <div>
        <span className="block text-xs text-gray-400 uppercase tracking-wide">NTSA</span>
        <span className="font-medium text-gray-800">KSh 2,450</span>
      </div>
    </div>
    <div className="p-4 pt-0">
      <button onClick={onAction} className="w-full py-2 border border-primary-blue text-primary-blue rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
        View Full Details
      </button>
    </div>
  </div>
);

export default function ChatPage() {
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (content: string, type: Message['type'] = 'text') => {
    if (!content.trim() && type === 'text') return;
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    try {
      const response = await axios.post<ChatResponse>("/api/chat", {
        messages: updatedMessages,
        language
      });

      if (response.data.error) {
        throw new Error(response.data.message || response.data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.reply,
        type: 'text'
      };
      setMessages((prev) => [...prev, assistantMessage]);

      const formTriggers = [
        'fill form', 'get started', 'start registration', 'c)', 'option c',
        'help me get started', 'registration form', 'open form'
      ];

      if (formTriggers.some(trigger => content.toLowerCase().includes(trigger)) ||
        content.toLowerCase() === 'form' ||
        (content === '2' && response.data.reply.includes('Type "form"'))) {
        setShowRegistrationForm(true);
      }
    } catch (error: unknown) {
      console.error("Chat error:", error);
      let errorMessage = t('greeting');
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as LocalAxiosError;
        if (axiosError.response?.status === 429) {
          errorMessage = "⏳ " + t('rateLimitExceeded');
        } else if (axiosError.response?.data?.message) {
          errorMessage = `❌ ${axiosError.response.data.message}`;
        }
      }
      const fallbackMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: errorMessage,
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [messages, language, t]);

  const handleFormSubmit = async (formData: RegistrationFormData) => {
    setFormSubmitting(true);
    try {
      const response = await axios.post<ChatResponse>("/api/chat", {
        action: 'submitRegistration',
        formData: formData,
        language
      });

      if (response.data.error) {
        throw new Error(response.data.message || response.data.error);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: t('registrationSuccess', { phoneNumber: formData.phoneNumber }),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (response.data.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      }

      setShowRegistrationForm(false);
    } catch (error) {
      console.error("Form submission error:", error);
      const errorMessageObj: Message = {
        role: "assistant",
        content: t('submissionFailed'),
      };
      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleLanguageChange = (newLanguage: 'en' | 'sw') => {
    setLanguage(newLanguage);
  };

  useEffect(() => {
    if (!initializedRef.current && messages.length === 0) {
      initializedRef.current = true;
      sendMessage("hi");
    }
  }, [messages.length, sendMessage]);

  const primaryActions = [
    { label: t('courses'), message: "1" },
    { label: t('register'), message: "2" },
    { label: t('ntsa'), message: "3" },
  ];

  return (
    <>
      <Head>
        <title>EricBot Assistant - AA Kenya - Ngong Town Branch</title>
        <meta name="description" content={t('metaDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      <div className="min-h-screen bg-bg-slate flex items-center justify-center p-0 sm:p-4 font-sans text-gray-900">
        <div className="w-full max-w-[480px] bg-white sm:rounded-2xl shadow-xl flex flex-col h-[100dvh] sm:h-[85vh] border-x sm:border border-gray-200 relative overflow-hidden">

          {/* Header */}
          <header className="bg-gradient-to-r from-primary-blue to-indigo-600 text-white p-3 sm:p-4 shadow-md z-10 shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                  <Image
                    src="/ericbot.png"
                    alt="EricBot"
                    width={40}
                    height={40}
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute w-2 h-2 bg-green-500 rounded-full bottom-0 right-0 border-2 border-white"></div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-[14px] sm:text-[16px] font-semibold leading-tight">EricBot Assistant</h1>
                  <span className="text-[10px] sm:text-[11px] text-white/90 font-medium whitespace-nowrap">AA Kenya - Ngong Town Branch</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-white/10 rounded-full p-0.5 backdrop-blur-sm border border-white/20">
                  <button onClick={() => handleLanguageChange('en')} className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${language === 'en' ? 'bg-white text-primary-blue' : 'text-white hover:bg-white/10'}`}>EN</button>
                  <button onClick={() => handleLanguageChange('sw')} className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${language === 'sw' ? 'bg-white text-primary-blue' : 'text-white hover:bg-white/10'}`}>SW</button>
                </div>
                <button
                  onClick={() => {
                    setMessages([]);
                    setInput("");
                    initializedRef.current = false;
                    loadingRef.current = false;
                  }}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title="New Chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>
            </div>
          </header>

          {/* Registration Form Modal */}
          {showRegistrationForm && (
            <RegistrationForm
              onSubmit={handleFormSubmit}
              onCancel={() => setShowRegistrationForm(false)}
              isSubmitting={formSubmitting}
            />
          )}

          {/* Messages */}
          <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {messages.map((message, index) => {
              // Formatting Logic
              const isUser = message.role === "user";
              let Content = (
                <div className={`max-w-[85%] text-sm leading-relaxed shadow-sm ${isUser
                  ? "bg-blue-600 text-white font-medium rounded-2xl rounded-tr-none px-4 py-3"
                  : "bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3"
                  }`}>
                  <div className="whitespace-pre-wrap font-regular">{message.content}</div>
                </div>
              );

              if (!isUser) {
                const lowerContent = message.content.toLowerCase();
                // Broader matching for Welcome
                if (lowerContent.includes("welcome to aa kenya") || lowerContent.includes("driving school!")) {
                  Content = <WelcomeCard onOptionSelect={(opt) => sendMessage(opt, 'text')} />;
                }
                // Custom Card for Course Info
                else if (lowerContent.includes("standard courses (5 weeks duration)")) {
                  Content = <CourseInfoCard onOptionSelect={(opt) => sendMessage(opt, 'text')} />;
                }
                // Custom Card for Registration
                else if (lowerContent.includes("registration options")) {
                  Content = <RegistrationOptionsCard
                    onOptionSelect={(opt) => sendMessage(opt, 'text')}
                    onStartForm={() => { sendMessage('start registration', 'text'); }}
                  />;
                }
                // Custom Card for Payment & NTSA
                else if (lowerContent.includes("payment & ntsa requirements") || lowerContent.includes("payment methods")) {
                  Content = <PaymentInfoCard onOptionSelect={(opt) => sendMessage(opt, 'text')} />;
                }
                // Broader matching for Beginner Course - matching "18,780" which is in the backend response "KSh 18,780"
                else if (lowerContent.includes("beginner's course") || lowerContent.includes("18,780")) {
                  Content = <BeginnerCourseCard onAction={() => sendMessage('Tell me more about the fee structure', 'text')} />;
                }
              }

              return (
                <div key={message.id || index} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mr-2 shrink-0 self-end mb-1 overflow-hidden">
                      <Image src="/ericbot.png" alt="Bot" width={32} height={32} className="object-cover" />
                    </div>
                  )}
                  {Content}
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start w-full">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mr-2 shrink-0 self-end mb-1 overflow-hidden">
                  <Image src="/ericbot.png" alt="Bot" width={32} height={32} className="object-cover" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5 h-10">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          {/* Primary Action Buttons */}
          <div className="bg-white border-t border-gray-100 p-3 pb-0 shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {primaryActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(action.message, 'text')}
                  disabled={loading}
                  className="flex-1 min-w-[110px] bg-gradient-to-r from-emerald-500 to-green-600 active:from-emerald-600 active:to-green-700 text-white text-[11px] font-bold py-3 px-2 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap text-center disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <footer className="bg-white border-t border-gray-100 shrink-0 z-50 p-3 pb-[env(safe-area-inset-bottom,12px)]">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex items-center gap-2 w-full"
            >
              <div className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-full flex items-center px-4 focus-within:ring-2 focus-within:ring-primary-blue/20 focus-within:bg-white transition-all shadow-inner">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  disabled={loading}
                  className="w-full bg-transparent text-gray-900 font-medium text-[16px] py-3.5 outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all active:scale-95 ${!input.trim() || loading
                  ? 'bg-gray-100 text-gray-400 opacity-50'
                  : 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-green-100 ring-2 ring-emerald-500 ring-offset-2'
                  }`}
                aria-label="Send"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </footer>

        </div>
      </div>
    </>
  );
}