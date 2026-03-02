"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'sw';
export type TranslationKey =
  | 'greeting'
  | 'menuOptions'
  | 'option1'
  | 'option2'
  | 'option3'
  | 'option4'
  | 'quickAccess'
  | 'courses'
  | 'register'
  | 'ntsa'
  | 'license'
  | 'startForm'
  | 'personalInfo'
  | 'emergencyContact'
  | 'courseInfo'
  | 'fullName'
  | 'dateOfBirth'
  | 'idNumber'
  | 'phoneNumber'
  | 'email'
  | 'emergencyName'
  | 'emergencyPhone'
  | 'preferredCourse'
  | 'preferredIntake'
  | 'additionalNotes'
  | 'thinking'
  | 'sending'
  | 'submitRegistration'
  | 'submitting'
  | 'cancel'
  | 'typeMessage'
  | 'send'
  | 'tip'
  | 'registrationSuccess'
  | 'rateLimitExceeded'
  | 'invalidMessage'
  | 'offlineMessage'
  | 'offlineSubmission'
  | 'submissionFailed'
  | 'validationFailed'
  | 'offlineMode'
  | 'registrationForm'
  | 'metaDescription'
  | 'footerNote'; // This is included in the type

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, values?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// English translations
const enTranslations: Record<TranslationKey, string> = {
  greeting: `Hello! 👋 Welcome to AA Kenya - Ngong Town Branch! 🚗

We offer comprehensive driving courses with certified instructors right here in Ngong Town.

🚗 BEGINNER'S STARTING POINT:
If you're just getting started, you'll begin with a saloon car—either automatic or manual. The training fee is KSh 24,900, with an option to pay a deposit of KSh 15,000 and settle the balance after two weeks. Additionally, NTSA charges of KSh 2,450 apply, covering the PDL, driving test, and interim driving license.

The course runs for 5 weeks, with new intakes every Wednesday. You can choose between two time slots: 9:00–10:00 AM or 12:00–1:00 PM.

⚠️ Important: Check NTSA requirements before applying for any class.

📞 Contact AA Kenya - Ngong Town Branch:
• Phone: 0759963210`,

  menuOptions: "Please choose an option:",
  option1: "1️⃣ Course Information & Fees",
  option2: "2️⃣ Registration Assistance",
  option3: "3️⃣ Payment & NTSA Requirements",
  option4: "4️⃣ License Prerequisites",

  quickAccess: "Quick Access",
  courses: "Courses",
  register: "Register",
  ntsa: "NTSA",
  license: "License",
  startForm: "Start Form",

  personalInfo: "👤 Personal Information",
  emergencyContact: "🆘 Emergency Contact",
  courseInfo: "🎓 Course Information",
  fullName: "Full Name *",
  dateOfBirth: "Date of Birth *",
  idNumber: "ID/Passport Number *",
  phoneNumber: "Phone Number *",
  email: "Email Address",
  emergencyName: "Emergency Contact Name *",
  emergencyPhone: "Emergency Contact Phone *",
  preferredCourse: "Preferred Course *",
  preferredIntake: "Preferred Intake Date *",
  additionalNotes: "Additional Notes",

  thinking: "Thinking",
  sending: "Sending",
  submitRegistration: "Submit Registration",
  submitting: "Submitting...",
  cancel: "Cancel",
  typeMessage: "Ask about driving courses...",
  send: "Send",
  tip: "💡 Tip: Type numbers 1–4 for instant access",

  registrationSuccess: "Great! Your registration is all set! 🎉\n\nWe're opening WhatsApp now to send your details over to our team. Just hit \"Send\" when it opens and you're done!\n\nYou'll hear from us within the next 24 hours on 0759963210.\n\nNeed to reach us sooner? Give us a call at 0759963210 or swing by our office at AA Kenya - Ngong Town Branch.",

  rateLimitExceeded: "Too many requests. Please wait a moment before sending another message.",
  invalidMessage: "Invalid message. Please try again.",
  offlineMessage: "You are currently offline. Your message will be sent when connection is restored.",
  offlineSubmission: "You are offline. Your registration has been saved and will be submitted when you're back online.",
  submissionFailed: "Failed to submit registration. Please call us directly at 0759963210 or try again later.",
  validationFailed: "Validation failed",
  offlineMode: "Offline Mode",
  registrationForm: "Registration Form",
  metaDescription: "AI assistant for AA Kenya - Ngong Town Branch - Get information about driving courses, fees, registration, and NTSA requirements.",

  // ADD THIS MISSING KEY:
  footerNote: "Powered by EricBot Assistant - AA Kenya - Ngong Town Branch"
};

// Swahili translations (simplified for now)
const swTranslations: Record<TranslationKey, string> = {
  ...enTranslations, // Use English as fallback for now

  // Override with Swahili translations:
  greeting: `Hujambo! 👋 Karibu AA Kenya - Ngong Town Branch! 🚗

Tunatoa kozi kamili za udereva na walimu walioidhinishwa hapa Ngong Town.

🚗 Mwanzo wa Kuanzia:
Ikiwa unaanza tu, utaanza na gari ya saloon — ama ya automatic au manual. Ada ya mafunzo ni KSh 24,900, na chaguo la kulipa akiba ya KSh 15,000 na kulipa mabaki baada ya wiki mbili. Zaidi ya hayo, malipo ya NTSA ya KSh 2,450, yanajumuisha PDL, mtihani wa kuendesha, na leseni ya muda wa kuendesha.

Kozi inaendelea kwa majuma 5, na usajili mpya kila Jumatano. Unaweza kuchagua kati ya vipindi viwili vya muda: 9:00–10:00 AM au 12:00–1:00 PM.

⚠️ Muhimu: Angalia mahitaji ya NTSA kabla ya kutumia kozi yoyote.

📞 Wasiliana na AA Kenya - Ngong Town Branch:
• Simu: 0759963210`,

  menuOptions: "Tafadhali chagua chaguo:",
  option1: "1️⃣ Taarifa za Kozi & Ada",
  option2: "2️⃣ Usaidizi wa Usajili",
  option3: "3️⃣ Malipo & Mahitaji ya NTSA",
  option4: "4️⃣ Mahitaji ya Leseni",

  quickAccess: "Ufikiaji wa Haraka",
  courses: "Kozi",
  register: "Jisajili",
  ntsa: "NTSA",
  license: "Leseni",
  startForm: "Anza Fomu",

  personalInfo: "👤 Taarifa Binafsi",
  emergencyContact: "🆘 Mawasiliano ya Dharura",
  courseInfo: "🎓 Taarifa za Kozi",
  fullName: "Jina Kamili *",
  dateOfBirth: "Tarehe ya Kuzaliwa *",
  idNumber: "Nambari ya Kitambulisho *",
  phoneNumber: "Nambari ya Simu *",
  email: "Barua Pepe",
  emergencyName: "Jina la Mtu wa Dharura *",
  emergencyPhone: "Simu ya Mtu wa Dharura *",
  preferredCourse: "Kozi Unayopendelea *",
  preferredIntake: "Tarehe Unayopendelea Kuanza *",
  additionalNotes: "Maelezo ya Ziada",

  thinking: "Inafikiri",
  sending: "Inatuma",
  submitRegistration: "Wasilisha Usajili",
  submitting: "Inawasilisha...",
  cancel: "Ghairi",
  typeMessage: "Uliza kuhusu kozi za udereva...",
  send: "Tuma",
  tip: "💡 Kidokezo: Andika nambari 1–4 kwa ufikiaji wa haraka",

  registrationSuccess: "✅ Usajili umewasilishawa kwa mafanikio! Tunafungua WhatsApp kutuma maelezo yako kwa timu yetu. Tafadhali bofya \"Tuma\" kukamilisha mchakato.\n\nTutawasiliana nawe ndani ya masaa 24 kwa **{phoneNumber}**.\n\n📞 **Mawasiliano ya Moja kwa Moja:** 0759963210\n📍 **Eneo:** AA Kenya - Ngong Town Branch",

  // ADD THIS MISSING KEY:
  footerNote: "Inaendeshwa na EricBot Assistant - AA Kenya - Ngong Town Branch"
};

const translations = {
  en: enTranslations,
  sw: swTranslations
};

function interpolate(text: string, values: Record<string, string>): string {
  return text.replace(/{(\w+)}/g, (match, key) => values[key] || match);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferred-language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'sw')) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', language);
    }
  }, [language]);

  const t = (key: TranslationKey, values?: Record<string, string>) => {
    let text = translations[language][key] || translations.en[key] || key;
    if (values) {
      text = interpolate(text, values);
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}