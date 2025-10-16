"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { useLanguage } from '../contexts/LanguageContext';

// Interfaces (keep your existing interfaces the same)
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

interface FormErrors {
  fullName?: string;
  dateOfBirth?: string;
  idNumber?: string;
  phoneNumber?: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredCourse?: string;
  preferredIntake?: string;
  additionalNotes?: string;
}

interface ChatResponse {
  reply: string;
  whatsappUrl?: string;
  error?: string;
  message?: string;
  errors?: string[];
  fieldErrors?: string[];
  rateLimit?: {
    remaining: number;
    reset: number;
  };
}

export default function ChatPage() {
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickOptions, setShowQuickOptions] = useState(false);
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
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [rateLimit, setRateLimit] = useState<{ remaining: number; reset: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Validation functions (keep your existing validation functions the same)
  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return t('fullName') + " is required";
        if (value.trim().length < 2) return t('fullName') + " must be at least 2 characters";
        if (value.trim().length > 100) return t('fullName') + " must be less than 100 characters";
        break;
      
      case 'phoneNumber':
        if (!value.trim()) return t('phoneNumber') + " is required";
        if (!/^(\+?254|0)?[17]\d{8}$/.test(value.trim().replace(/\s/g, ''))) {
          return "Please enter a valid Kenyan phone number";
        }
        break;
      
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address";
        }
        break;
      
      case 'idNumber':
        if (!value.trim()) return t('idNumber') + " is required";
        if (!/^[A-Z0-9]{5,20}$/i.test(value.trim())) {
          return "ID/Passport must be 5-20 alphanumeric characters";
        }
        break;
      
      case 'emergencyContactPhone':
        if (!value.trim()) return t('emergencyPhone') + " is required";
        if (!/^(\+?254|0)?[17]\d{8}$/.test(value.trim().replace(/\s/g, ''))) {
          return "Please enter a valid emergency contact phone number";
        }
        break;
      
      case 'preferredIntake':
        if (!value) return t('preferredIntake') + " is required";
        if (new Date(value) < new Date(new Date().toDateString())) {
          return "Intake date cannot be in the past";
        }
        break;
      
      default:
        // Check required fields
        const requiredFields: (keyof FormData)[] = [
          'fullName', 'dateOfBirth', 'idNumber', 'phoneNumber', 
          'emergencyContactName', 'emergencyContactPhone', 
          'preferredCourse', 'preferredIntake'
        ];
        
        if (requiredFields.includes(name) && !value.trim()) {
          const fieldName = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
          return fieldName + " is required";
        }
    }
    return "";
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      const error = validateField(field, value);
      setFormErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleFieldBlur = (field: keyof FormData, value: string) => {
    const error = validateField(field, value);
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (content: string, isQuickOption = false) => {
    if (!content.trim() || loading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post<ChatResponse>("/api/chat", {
        messages: updatedMessages,
        language
      });

      if (response.data.error) {
        throw new Error(response.data.message || response.data.error);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Update rate limit info
      if (response.data.rateLimit) {
        setRateLimit(response.data.rateLimit);
      }

      // Show form only for specific form triggers
      const formTriggers = [
        'form', 'get started', 'start registration', 'c)', 'option c', 
        'help me get started', 'registration form'
      ];
      
      if (formTriggers.some(trigger => content.toLowerCase().includes(trigger)) ||
          (content === '2' && response.data.reply.includes('Type "form"'))) {
        setShowRegistrationForm(true);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      
      let errorMessage = t('greeting');

      // Fixed axios error checking
      if (error.response) {
        const response = error.response.data as ChatResponse;
        if (error.response.status === 429) {
          errorMessage = "⏳ " + t('rateLimitExceeded');
        } else if (response?.message) {
          errorMessage = `❌ ${response.message}`;
        } else if (error.response.status === 400) {
          errorMessage = "❌ " + t('invalidMessage');
        }
      } else if (error.request) {
        // Network error
        errorMessage = "🌐 Network error. Please check your connection and try again.";
      }

      const fallbackMessage: Message = {
        role: "assistant",
        content: errorMessage,
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, language, t]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormErrors({});

    // Validate all fields before submission
    const errors: FormErrors = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof FormData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        errors[key] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFormErrors(errors);
      setFormSubmitting(false);
      
      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0] as keyof FormData;
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      errorElement?.focus();
      
      return;
    }

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
    } catch (error: any) {
      console.error("Form submission error:", error);
      
      let errorMessage = t('submissionFailed');

      // Fixed axios error checking
      if (error.response) {
        const response = error.response.data as ChatResponse;
        if (response?.errors) {
          errorMessage = `❌ ${t('validationFailed')}: ${response.errors.join(', ')}`;
        } else if (response?.message) {
          errorMessage = `❌ ${response.message}`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "🌐 Network error. Please check your connection and try again.";
      }

      const errorMessageObj: Message = {
        role: "assistant",
        content: errorMessage,
      };
      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setFormSubmitting(false);
    }
  };

  const quickOptions = [
    { label: "1️⃣ " + t('courses'), message: "1", description: t('courses') },
    { label: "2️⃣ " + t('register'), message: "2", description: t('register') },
    { label: "3️⃣ " + t('ntsa'), message: "3", description: t('ntsa') },
    { label: "4️⃣ " + t('license'), message: "4", description: t('license') },
    { label: "📋 " + t('startForm'), message: "start registration", description: t('startForm') },
  ];

  const handleLanguageChange = (newLanguage: 'en' | 'sw') => {
    setLanguage(newLanguage);
  };

  useEffect(() => {
    if (messages.length === 0) {
      sendMessage("hi");
    }
  }, [messages.length, sendMessage]);

  // Footer note with clickable link
  const footerNote = "Powered by <a href='https://ericwainaina.netlify.app/' target='_blank' rel='noopener noreferrer' class='text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200'>Nexeric Innovations</a> - AA Ngong Town Driving School";

  return (
    <>
      <Head>
        <title>EricBot Assistant - AA Ngong Town Driving School</title>
        <meta name="description" content={t('metaDescription')} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col h-[95vh] sm:h-[85vh] animate-fadeIn border border-gray-100 relative">
          
          {/* Header with properly spaced buttons */}
          <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-2xl relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <Image 
                    src="/ericbot.png" 
                    alt="EricBot Assistant Logo"
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

              {/* Header buttons container with proper spacing */}
              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm border">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        language === 'en' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => handleLanguageChange('sw')}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        language === 'sw' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      SW
                    </button>
                  </div>
                </div>

                {/* Clear Chat Button */}
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      setMessages([]);
                      setInput("");
                      setTimeout(() => sendMessage("hi"), 500);
                    }}
                    className="px-3 py-2 text-xs sm:text-sm bg-white text-blue-600 hover:bg-blue-50 border border-white border-opacity-30 rounded-xl transition-all duration-200 backdrop-blur-sm font-semibold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 whitespace-nowrap"
                  >
                    New Chat
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Registration Form Modal */}
          {showRegistrationForm && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[95vh] overflow-y-auto mx-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    📋 {t('registrationForm')}
                  </h2>
                  <button
                    onClick={() => setShowRegistrationForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close registration form"
                  >
                    ×
                  </button>
                </div>
                
                <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4" noValidate>
                  {/* Personal Information Section */}
                  <fieldset className="border-b border-gray-200 pb-4">
                    <legend className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                      {t('personalInfo')}
                    </legend>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fullName')}
                        </label>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => handleFieldChange('fullName', e.target.value)}
                          onBlur={(e) => handleFieldBlur('fullName', e.target.value)}
                          className={`w-full border rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                            formErrors.fullName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder={t('fullName')}
                        />
                        {formErrors.fullName && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('dateOfBirth')}
                        </label>
                        <input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                          onBlur={(e) => handleFieldBlur('dateOfBirth', e.target.value)}
                          className={`w-full border rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                            formErrors.dateOfBirth ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                        />
                        {formErrors.dateOfBirth && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.dateOfBirth}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('idNumber')}
                        </label>
                        <input
                          id="idNumber"
                          name="idNumber"
                          type="text"
                          required
                          value={formData.idNumber}
                          onChange={(e) => handleFieldChange('idNumber', e.target.value)}
                          onBlur={(e) => handleFieldBlur('idNumber', e.target.value)}
                          className={`w-full border rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                            formErrors.idNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder={t('idNumber')}
                        />
                        {formErrors.idNumber && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.idNumber}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('phoneNumber')}
                        </label>
                        <input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          required
                          value={formData.phoneNumber}
                          onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                          onBlur={(e) => handleFieldBlur('phoneNumber', e.target.value)}
                          className={`w-full border rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                            formErrors.phoneNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder="07XXXXXXXX"
                        />
                        {formErrors.phoneNumber && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('email')}
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          onBlur={(e) => handleFieldBlur('email', e.target.value)}
                          className={`w-full border rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                            formErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder="your@email.com (optional)"
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                        )}
                      </div>
                    </div>
                  </fieldset>

                  {/* Emergency Contact Section */}
                  <fieldset className="border-b border-gray-200 pb-4">
                    <legend className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                      {t('emergencyContact')}
                    </legend>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('emergencyName')}
                        </label>
                        <input
                          id="emergencyContactName"
                          name="emergencyContactName"
                          type="text"
                          required
                          value={formData.emergencyContactName}
                          onChange={(e) => handleFieldChange('emergencyContactName', e.target.value)}
                          onBlur={(e) => handleFieldBlur('emergencyContactName', e.target.value)}
                          className={`w-full border rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                            formErrors.emergencyContactName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder={t('emergencyName')}
                        />
                        {formErrors.emergencyContactName && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.emergencyContactName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('emergencyPhone')}
                        </label>
                        <input
                          id="emergencyContactPhone"
                          name="emergencyContactPhone"
                          type="tel"
                          required
                          value={formData.emergencyContactPhone}
                          onChange={(e) => handleFieldChange('emergencyContactPhone', e.target.value)}
                          onBlur={(e) => handleFieldBlur('emergencyContactPhone', e.target.value)}
                          className={`w-full border rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                            formErrors.emergencyContactPhone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder="07XXXXXXXX"
                        />
                        {formErrors.emergencyContactPhone && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.emergencyContactPhone}</p>
                        )}
                      </div>
                    </div>
                  </fieldset>

                  {/* Course Information Section */}
                  <fieldset>
                    <legend className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                      {t('courseInfo')}
                    </legend>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="preferredCourse" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('preferredCourse')}
                        </label>
                        <select
                          id="preferredCourse"
                          name="preferredCourse"
                          required
                          value={formData.preferredCourse}
                          onChange={(e) => handleFieldChange('preferredCourse', e.target.value)}
                          onBlur={(e) => handleFieldBlur('preferredCourse', e.target.value)}
                          className={`w-full border rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                            formErrors.preferredCourse ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                        >
                          <option value="">{t('preferredCourse')}</option>
                          <option value="Motorcycle (Category A)">Motorcycle (Category A)</option>
                          <option value="Saloon Car (Category B-Manual)">Saloon Car (Category B-Manual)</option>
                          <option value="Saloon Car (Category B-Automatic)">Saloon Car (Category B-Automatic)</option>
                          <option value="Passenger Vehicle (Category D1)">Passenger Vehicle (Category D1)</option>
                          <option value="Light Truck (Category C1)">Light Truck (Category C1)</option>
                          <option value="PSV (Category D1/D)">PSV (Category D1/D)</option>
                          <option value="Premier Driving">Premier Driving</option>
                          <option value="Refresher Course">Refresher Course</option>
                        </select>
                        {formErrors.preferredCourse && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.preferredCourse}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="preferredIntake" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('preferredIntake')}
                        </label>
                        <input
                          id="preferredIntake"
                          name="preferredIntake"
                          type="date"
                          required
                          value={formData.preferredIntake}
                          onChange={(e) => handleFieldChange('preferredIntake', e.target.value)}
                          onBlur={(e) => handleFieldBlur('preferredIntake', e.target.value)}
                          className={`w-full border rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                            formErrors.preferredIntake ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                        />
                        {formErrors.preferredIntake && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.preferredIntake}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('additionalNotes')}
                        </label>
                        <textarea
                          id="additionalNotes"
                          name="additionalNotes"
                          value={formData.additionalNotes}
                          onChange={(e) => handleFieldChange('additionalNotes', e.target.value)}
                          onBlur={(e) => handleFieldBlur('additionalNotes', e.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                          placeholder={t('additionalNotes')}
                        />
                      </div>
                    </div>
                  </fieldset>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRegistrationForm(false)}
                      className="flex-1 px-4 py-3 text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="flex-1 px-4 py-3 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {formSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('submitting')}
                        </span>
                      ) : t('submitRegistration')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gray-50">
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
                    <div className="text-gray-600 text-sm font-medium">{t('thinking')}</div>
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
          </main>

          {/* Quick Options */}
          <section aria-labelledby="quick-options-title">
            <div className="border-t border-gray-200 bg-white">
              <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-100">
                <h2 id="quick-options-title" className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                  {t('quickAccess')}
                </h2>
                <button
                  onClick={() => setShowQuickOptions(!showQuickOptions)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-expanded={showQuickOptions}
                  aria-controls="quick-options-content"
                >
                  {showQuickOptions ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                  <span className="sr-only">{showQuickOptions ? "Collapse" : "Expand"} quick options</span>
                </button>
              </div>

              {showQuickOptions && (
                <div id="quick-options-content" className="p-2 sm:p-3">
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {quickOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(option.message, true)}
                        disabled={loading}
                        className="flex flex-col items-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        title={option.description}
                      >
                        <span className="text-xs sm:text-sm font-medium text-gray-800 group-hover:text-blue-700 text-center mb-1">
                          {option.label.split(' ')[0]}
                        </span>
                        <span className="text-xs text-gray-600 group-hover:text-blue-600 text-center leading-tight">
                          {option.label.split(' ').slice(1).join(' ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Input Area */}
          <footer className="border-t border-gray-200 bg-white p-3 sm:p-4 rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex space-x-2 sm:space-x-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('typeMessage')}
                disabled={loading}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
                aria-label="Type your message"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 sm:px-6 py-3 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center justify-center min-w-[80px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                )}
                <span className="sr-only">Send message</span>
              </button>
            </form>

            {/* Rate Limit Info */}
            {rateLimit && (
              <div className="mt-2 text-center">
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg py-1 px-2 inline-block">
                  <span className="font-medium">Requests remaining:</span> {rateLimit.remaining}
                  {rateLimit.reset > 0 && (
                    <span className="ml-2">
                      • Resets in {Math.ceil(rateLimit.reset / 60)} minutes
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Footer Note with Clickable Link */}
            <div className="mt-3 text-center">
              <p 
                className="text-xs text-gray-500"
                dangerouslySetInnerHTML={{ __html: footerNote }}
              />
            </div>
          </footer>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Focus styles for accessibility */
        button:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}