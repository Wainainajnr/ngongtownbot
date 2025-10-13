"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FormData {
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  phoneNumber: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferredCourse: string;
  preferredIntake: string;
  additionalNotes: string;
}

interface ChatResponse {
  reply: string;
  whatsappUrl?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickOptions, setShowQuickOptions] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    dateOfBirth: "",
    idNumber: "",
    phoneNumber: "",
    email: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    preferredCourse: "",
    preferredIntake: "",
    additionalNotes: ""
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post<ChatResponse>("/api/chat", {
        messages: updatedMessages,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Show form when user triggers registration via option 3 or other triggers
      if (content.toLowerCase().includes('form') || 
          content.toLowerCase().includes('get started') || 
          content === '3' || 
          content.toLowerCase().includes('registration form') ||
          content.toLowerCase().includes('option 3') ||
          (content === '2' && response.data.reply.includes('Opening registration form'))) {
        setShowRegistrationForm(true);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const fallbackMessage: Message = {
        role: "assistant",
        content: `👋 Welcome to **AA Ngong Town Driving School** 🚗  
Please choose an option:  
1️⃣ Course Information & Fees  
2️⃣ Registration Assistance  
3️⃣ Payment & NTSA Requirements  
4️⃣ License Prerequisites`,
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const response = await axios.post<ChatResponse>("/api/chat", {
        action: 'submitRegistration',
        formData: formData
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Open WhatsApp with pre-filled message
      if (response.data.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      }
      
      setShowRegistrationForm(false);
      
      // Reset form
      setFormData({
        fullName: "",
        dateOfBirth: "",
        idNumber: "",
        phoneNumber: "",
        email: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        preferredCourse: "",
        preferredIntake: "",
        additionalNotes: ""
      });
    } catch (error) {
      console.error("Form submission error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "❌ Failed to submit registration. Please call us directly at 0759963210 or try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setFormSubmitting(false);
    }
  };

  const quickOptions = [
    { label: "1️⃣ Courses", message: "1", description: "Course Info & Fees" },
    { label: "2️⃣ Register", message: "2", description: "Registration Help" },
    { label: "3️⃣ NTSA", message: "3", description: "Requirements" },
    { label: "4️⃣ License", message: "4", description: "Prerequisites" },
    { label: "📋 Start Form", message: "start registration", description: "Begin Registration" },
  ];

  useEffect(() => {
    if (messages.length === 0) {
      sendMessage("hi");
    }
  }, [messages.length, sendMessage]);

  return (
    <>
      <Head>
        <title>EricBot Assistant - AA Ngong Town Driving School</title>
        <meta name="description" content="AI assistant for AA Ngong Town Driving School - Get information about driving courses, fees, registration, and NTSA requirements." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        
        {/* Favicon Configuration */}
        <link rel="icon" href="/ericbot.png" type="image/png" />
        <link rel="shortcut icon" href="/ericbot.png" type="image/png" />
        <link rel="apple-touch-icon" href="/ericbot.png" />
        
        {/* Additional meta tags for better display */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileImage" content="/ericbot.png" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col h-[95vh] sm:h-[85vh] animate-fadeIn border border-gray-100 relative">
          
          {/* Registration Form Modal */}
          {showRegistrationForm && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[95vh] overflow-y-auto mx-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">📋 Registration Form</h2>
                  <button
                    onClick={() => setShowRegistrationForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Personal Information Section */}
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">👤 Personal Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID/Passport Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.idNumber}
                          onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter ID or passport number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="07XXXXXXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="your@email.com (optional)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">🆘 Emergency Contact</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Emergency Contact Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.emergencyContactName}
                          onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Full name of emergency contact"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Emergency Contact Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.emergencyContactPhone}
                          onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="07XXXXXXXX"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Course Information Section */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">🎓 Course Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Course *
                        </label>
                        <select
                          required
                          value={formData.preferredCourse}
                          onChange={(e) => setFormData({...formData, preferredCourse: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select a course</option>
                          <option value="Motorcycle (Category A)">Motorcycle (Category A)</option>
                          <option value="Saloon Car (Category B-Manual)">Saloon Car (Category B-Manual)</option>
                          <option value="Saloon Car (Category B-Automatic)">Saloon Car (Category B-Automatic)</option>
                          <option value="Passenger Vehicle (Category D1)">Passenger Vehicle (Category D1)</option>
                          <option value="Light Truck (Category C1)">Light Truck (Category C1)</option>
                          <option value="PSV (Category D1/D)">PSV (Category D1/D)</option>
                          <option value="Premier Driving">Premier Driving</option>
                          <option value="Refresher Course">Refresher Course</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Intake Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.preferredIntake}
                          onChange={(e) => setFormData({...formData, preferredIntake: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Notes
                        </label>
                        <textarea
                          value={formData.additionalNotes}
                          onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Any questions or specific requirements..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRegistrationForm(false)}
                      className="flex-1 px-4 py-3 text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="flex-1 px-4 py-3 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {formSubmitting ? "Submitting..." : "Submit Registration"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* EricBot Logo */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <Image 
                    src="/ericbot.png" 
                    alt="EricBot Assistant"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="flex space-x-1">
                          <div class="w-2 h-2 bg-white rounded-full opacity-80"></div>
                          <div class="w-2 h-2 bg-white rounded-full opacity-80"></div>
                          <div class="w-2 h-2 bg-white rounded-full opacity-80"></div>
                        </div>
                      `;
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold">EricBot Assistant</h1>
                  <p className="text-blue-100 text-xs sm:text-sm opacity-90">
                    AA Ngong Town Driving School
                  </p>
                </div>
              </div>

              {messages.length > 0 && (
                <button
                  onClick={() => {
                    setMessages([]);
                    setInput("");
                    setTimeout(() => sendMessage("hi"), 500);
                  }}
                  className="px-3 py-2 text-xs sm:text-sm bg-white text-blue-600 hover:bg-blue-50 border border-white border-opacity-30 rounded-xl transition-all duration-200 backdrop-blur-sm font-semibold shadow-sm hover:shadow-md"
                >
                  New Chat
                </button>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 mr-2 sm:mr-3 self-end mb-1 sm:mb-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden shadow-sm">
                      <Image 
                        src="/ericbot.png" 
                        alt="EricBot"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class="text-white text-xs font-bold">EB</div>
                          `;
                        }}
                      />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 rounded-2xl whitespace-pre-wrap shadow-sm text-sm sm:text-base ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
                      : "bg-white border border-gray-200 rounded-bl-none shadow-md"
                  }`}
                >
                  {message.content}
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 ml-2 sm:ml-3 self-end mb-1 sm:mb-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold">You</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex-shrink-0 mr-2 sm:mr-3 self-end mb-1 sm:mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden shadow-sm">
                    <Image 
                      src="/ericbot.png" 
                      alt="EricBot"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="text-white text-xs font-bold">EB</div>
                        `;
                      }}
                    />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 shadow-sm rounded-bl-none">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="text-gray-600 text-sm font-medium">Thinking</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Options */}
          {(messages.length === 0 || messages[messages.length - 1]?.role === "assistant") && (
            <div className="border-t border-gray-200 bg-white">
              <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-100">
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                  Quick Access
                </p>
                <button
                  onClick={() => setShowQuickOptions(!showQuickOptions)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                >
                  {showQuickOptions ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>

              {showQuickOptions && (
                <div className="p-2 sm:p-3">
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 sm:gap-2">
                    {quickOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (option.message === "start registration") {
                            setShowRegistrationForm(true);
                            sendMessage("start registration");
                          } else {
                            sendMessage(option.message);
                          }
                        }}
                        disabled={loading}
                        className="p-2 text-center bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                        title={option.description}
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                            {option.label}
                          </div>
                          <div className="text-[10px] text-gray-500 group-hover:text-blue-500 transition-colors leading-tight">
                            {option.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input Form */}
          <div className="p-3 sm:p-6 border-t border-gray-200 bg-white rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2 sm:gap-4"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about driving courses..."
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-3 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed min-w-[80px] sm:min-w-[120px] shadow-md hover:shadow-lg disabled:shadow-none text-sm sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs sm:text-sm">Sending</span>
                  </div>
                ) : (
                  "Send"
                )}
              </button>
            </form>

            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                💡 <span className="font-semibold">Tip:</span> Type numbers 1–4 for instant access
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}