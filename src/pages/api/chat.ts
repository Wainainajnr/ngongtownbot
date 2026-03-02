import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { db } from "../../lib/db";
import { RegistrationFormData } from "../../types";

// Initialize OpenAI
// Initialize OpenAI with a safe fallback to prevent build-time/runtime crashes
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

interface ChatRequestBody {
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  formData?: RegistrationFormData;
  action?: string;
}

// Comprehensive response database for AA Kenya - Ngong Town Branch
const responseDatabase: { [key: string]: string } = {
  // ==================== GREETING TRIGGER ====================
  "greeting": `Hello! 👋 Welcome to AA Kenya - Ngong Town Branch! 🚗

We offer comprehensive driving courses with certified instructors right here in Ngong Town.

🚗 BEGINNER'S STARTING POINT:
If you're just getting started, you'll begin with a saloon car—either automatic or manual. The training fee is KSh 24,900, with an option to pay a deposit of KSh 15,000 and settle the balance after two weeks. Additionally, NTSA charges of KSh 2,450 apply, covering the PDL, driving test, and interim driving license.

The course runs for 5 weeks, with new intakes every Wednesday. You can choose between two time slots: 9:00–10:00 AM or 12:00–1:00 PM.

⚠️ Important: Check NTSA requirements before applying for any class.

📞 Contact AA Kenya - Ngong Town Branch:
• Phone: 0759963210  

Please choose an option:  
1️⃣ Course Information & Fees  
2️⃣ Registration Assistance  
3️⃣ Payment & NTSA Requirements  
4️⃣ Benefits of Training with AA`,

  // ==================== 1️⃣ COURSE INFORMATION & FEES ====================
  "course_info": `📚 STANDARD COURSES (5 Weeks Duration)
  
  🚗 Saloon Car (Category B) - Beginner's Course
  Course Fee: KSh 24,900  
  Deposit Option: KSh 15,000 (balance after 2 weeks)  
  NTSA Fee: KSh 2,450 (via eCitizen)  
  Duration: 5 weeks  
  Intake: Every Wednesday  
  Time Slots: 9:00–10:00 AM or 12:00–1:00 PM  
  Transmission: Automatic or Manual
  
  ⭐ Premier Driving (Beginner Course)
  Course Fee: KSh 50,000  
  NTSA Fee: KSh 2,450  
  Duration: 5 weeks  
  Private lessons
  
  🏍️ Motorcycle (Category A - Experienced Riders)
  Course Fee: KSh 3,000  
  NTSA Fee: KSh 2,450 (via eCitizen)  
  Duration: 3 weeks
  
  🏍️ Motorcycle (Category A - Beginner Course)
  Course Fee: KSh 5,780  
  NTSA Fee: KSh 2,450 (via eCitizen)  
  Duration: 5 weeks
  
  🚐 Passenger Light Vehicle (Category B3)
  Course Fee: KSh 10,000  
  NTSA Fee: KSh 2,350  
  Duration: 3 weeks  
  Requires Category B license with 2 years experience.
  
  🚚 Light & Medium Trucks (Category C1/C)
  Course Fee: KSh 10,000  
  NTSA Fee: KSh 2,350  
  Duration: 3 weeks  
  Requires Category B license with 2 years experience.
  
  🚌 Public Service Vehicle (Category D1/D)
  Course Fee: KSh 10,000  
  NTSA Fee: KSh 2,350  
  Duration: 3 weeks  
  Requires Category B and C license
  

  🔄 REFRESHER COURSES (3 Weeks)
  Light Vehicle: KSh 10,000  
  Light & Medium Truck: KSh 11,500  
  Premier Refresher: KSh 20,000
  
  📋 ASSESSMENT COURSES (1-2 Days)
  Class B (Saloon): KSh 5,000  
  Class C (Trucks): KSh 6,000
  
  💳 PAYMENT METHODS
  • Course Fees — M-Pesa / Bank Transfer ONLY  
  • NTSA Fees — via eCitizen  
  (Cash NOT accepted at branch)
  
  Choose another option:
  1️⃣ Course Information & Fees  
  2️⃣ Registration Assistance  
  3️⃣ Payment & NTSA Requirements
  4️⃣ Benefits of Training with AA`,

  // ==================== 2️⃣ REGISTRATION ASSISTANCE ====================
  "registration": `📝 REGISTRATION OPTIONS:
  
  a) Online Self-Registration (Fastest)
  ➡️ 🔗 Register directly here: 
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  https://edereva.aakenya.co.ke/students/
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  b) Contact AA Kenya - Ngong Town Branch Directly  
  📞 Phone: 0759963210  
  📧 Email: aangongtown@aakenya.co.ke  
  ☎️ AA Call Center: 0709 933 000 / 999  
  
  c) I Can Help You Get Started!  
  I'll open a registration form for you to fill out, and we'll contact you within 24 hours! 📋✨
  
  *(Type "form" or "start registration" to open the form)*
  
  Choose another option:
  1️⃣ Course Information & Fees  
  2️⃣ Registration Assistance  
  3️⃣ Payment & NTSA Requirements
  4️⃣ Benefits of Training with AA`,

  // ==================== 3️⃣ PAYMENT & NTSA REQUIREMENTS ====================
  "payment_ntsa": `💳 PAYMENT & NTSA REQUIREMENTS

Payment:
• Course Fees — via M-Pesa / Bank Transfer ONLY  
  (Cash NOT accepted at the branch)  
• NTSA Fees — Paid via eCitizen platform  

📋 NTSA REQUIREMENTS
✅ National ID or Passport Copy  
✅ Passport Photos softcopy

For help with NTSA setup, call 0759963210.

Choose another option:
1️⃣ Course Information & Fees  
2️⃣ Registration Assistance  
3️⃣ Payment & NTSA Requirements
4️⃣ Benefits of Training with AA`,

  // ==================== FORM TRIGGER RESPONSE ====================
  "start_registration": `📋 REGISTRATION FORM

Great! Let's get you started with the registration process. Please fill out the form below:

*(A registration form will appear where you can enter your details)*

Once you submit the form, we'll:
✅ Contact you within 24 hours  
✅ Guide you through the next steps  
✅ Answer any questions you have  
✅ Help with NTSA requirements

You can also continue browsing other options while the form is open.`,

  // ==================== 4️⃣ BENEFITS OF TRAINING ====================
  "benefits_info": `⭐ BENEFITS OF TRAINING WITH AA KENYA

1. Certificate of competency-Receive a globally recognised certification upon completion & licensing.
2. Access to 170 professionally-trained instructors who provide comprehensive training designed to build competent & confident drivers
3. Basic mechanics & vehicle maintenance training
4. Train from anywhere-Access training from any of our 95 branches countrywide. 
5. Driver employment opportunities-Learners benefits from AA Kenya’s driver recruitment bureau-connecting qualified drivers to employment
6. Access to learning materials- Learners receive road safety booklets & digital resorces
7. Exclusive FIA opportunities-With AA Kenyas affiliation to FIA, learners get access to participate in international Best Young Driver competition.
8. International mobility benefits-Learner get easy access to drive internationaly using AA International drivers permit.
9. Road safety & defensive driving-Receive foundational training in defensive driving principles & risk-avoidance driving strategies.

Choose another option:
1️⃣ Course Information & Fees  
2️⃣ Registration Assistance  
3️⃣ Payment & NTSA Requirements
4️⃣ Download Course Brochure`,

  "brochure_download": `📄 OFFICIAL AA KENYA BROCHURE

You can download our latest course brochure and fee structure using the button below.

The brochure contains:
✅ Full list of categories and requirements
✅ Detailed fee structure for all courses
✅ Branch locations and contacts
✅ Training schedules

Is there anything else I can help you with?`
};

// Function to generate WhatsApp URL
function generateWhatsAppURL(formData: RegistrationFormData): string {
  const message = `╔════════════════════════════╗
║  NEW STUDENT REGISTRATION  ║
╚════════════════════════════╝

👤 *PERSONAL INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Full Name: *${formData.fullName}*
• Date of Birth: ${formData.dateOfBirth}
• ID/Passport: ${formData.idNumber}
• Phone: ${formData.phoneNumber}
• Email: ${formData.email || 'Not provided'}

🆘 *EMERGENCY CONTACT*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Contact Name: *${formData.emergencyContactName}*
• Contact Phone: ${formData.emergencyContactPhone}

🎓 *COURSE DETAILS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Selected Course: *${formData.preferredCourse}*
• Preferred Intake: ${formData.preferredIntake}
${formData.additionalNotes ? `• Additional Notes:\n  ${formData.additionalNotes}` : '• Additional Notes: None'}

📅 *SUBMISSION INFO*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Date & Time: ${new Date().toLocaleString('en-KE', {
    dateStyle: 'full',
    timeStyle: 'short'
  })}

⏰ *ACTION REQUIRED*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Please contact within 24 hours
✅ Verify student information
✅ Provide next steps

🏫 *AA Kenya - Ngong Town Branch*`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/254759963210?text=${encodedMessage}`;
}

// Function to find the best matching response
function findBestResponse(userMessage: string): string | null {
  const lowerMessage = userMessage.toLowerCase().trim();

  // ==================== GREETING TRIGGERS ====================
  const greetingTriggers = [
    'hi', 'hello', 'hey', 'mambo', 'habari', 'good morning', 'good afternoon',
    'good evening', 'morning', 'afternoon', 'evening', 'start', 'begin'
  ];

  if (greetingTriggers.some(greet => lowerMessage === greet || (greet.length > 3 && lowerMessage.includes(greet)))) {
    return responseDatabase["greeting"];
  }

  // ==================== MENU OPTION 1 - COURSE INFO ====================
  const courseTriggers = [
    '1', 'course information & fees', 'course', 'fees', 'price', 'charges', 'cost', 'how much',
    'fee', 'pricing', 'tuition', 'course information'
  ];

  if (courseTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return responseDatabase["course_info"];
  }

  // ==================== MENU OPTION 2 - REGISTRATION ====================
  const registrationTriggers = [
    '2', 'registration assistance', 'register', 'join', 'apply', 'sign up', 'enroll', 'enrollment',
    'admission', 'admissions', 'how to join', 'how to apply'
  ];

  if (registrationTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return responseDatabase["registration"];
  }

  // ==================== MENU OPTION 3 - PAYMENT & NTSA ====================
  const paymentTriggers = [
    '3', 'payment & ntsa requirements', 'payment & ntsa', 'ntsa', 'payment method', 'how to pay', 'mpesa',
    'ecitizen', 'documents', 'what do i need', 'requirements',
    'prerequisites', 'documents needed', 'eye test'
  ];

  if (paymentTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return responseDatabase["payment_ntsa"];
  }

  // ==================== FORM TRIGGER ====================
  const formTriggers = [
    'form', 'help me get started', 'get started', 'fill form',
    'registration form', 'start registration', 'c)', 'option c'
  ];

  if (formTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return responseDatabase["start_registration"];
  }

  // ==================== MENU OPTION 4 - BENEFITS ====================
  const benefitTriggers = [
    '4', 'benefits of training with aa', 'benefits', 'why train', 'advantages', 'why choose aa', 'benefit'
  ];

  if (benefitTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return responseDatabase["benefits_info"];
  }

  // ==================== BROCHURE TRIGGER ====================
  const brochureTriggers = [
    'brochure', 'download brochure', 'pdf', 'pamphlet', 'leaflet', 'course list pdf'
  ];

  if (brochureTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return responseDatabase["brochure_download"];
  }

  // ==================== NO MATCH ====================
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method?.toUpperCase() ?? "UNKNOWN";

  // Log incoming requests for Vercel diagnostic visibility
  console.log(`[${new Date().toISOString()}] ${method} request to /api/chat`);

  // 1. Allow CORS preflight
  if (method === "OPTIONS") {
    res.setHeader("Allow", "POST, GET, OPTIONS");
    return res.status(200).end();
  }

  // 2. Health check / Verification
  if (method === "GET") {
    return res.status(200).json({
      status: "operational",
      version: "1.0.3" // Incremented to verify deployment
    });
  }

  // 3. Main chat & registration handling
  if (method === "POST") {
    try {
      const { messages, formData, action }: ChatRequestBody = req.body;

      // Handle form submission
      if (action === 'submitRegistration' && formData) {
        console.log("📝 Processing registration form...");

        // Save to Database
        try {
          await db.userLead.create({
            data: {
              fullName: formData.fullName,
              dateOfBirth: formData.dateOfBirth,
              idNumber: formData.idNumber,
              phoneNumber: formData.phoneNumber,
              email: formData.email || null,
              emergencyContactName: formData.emergencyContactName,
              emergencyContactPhone: formData.emergencyContactPhone,
              preferredCourse: formData.preferredCourse,
              preferredIntake: formData.preferredIntake,
              additionalNotes: formData.additionalNotes || null,
            }
          });
          console.log("✅ Lead saved to database");
        } catch (dbError) {
          console.error("❌ Failed to save lead to database:", dbError);
        }

        const whatsappUrl = generateWhatsAppURL(formData);
        return res.status(200).json({
          reply: `✅ Registration submitted successfully! We're opening WhatsApp to send your details to our team. Please click "Send" to complete the process.\n\nWe will contact you within 24 hours at **${formData.phoneNumber}**.\n\n📞 **Direct Contact:** 0759963210\n📍 **Location:** AA Kenya - Ngong Town Branch`,
          whatsappUrl: whatsappUrl
        });
      }

      // Handle regular chat messages
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
      }

      const userMessage = messages[messages.length - 1]?.content?.trim() ?? "";
      if (!userMessage) {
        return res.status(400).json({ message: "Empty message" });
      }

      console.log("💬 User asked:", userMessage);

      // 1. Try Hardcoded Responses
      const hardcodedReply = findBestResponse(userMessage);
      if (hardcodedReply) {
        console.log("✅ Sending hardcoded response");
        await new Promise(resolve => setTimeout(resolve, 500));
        return res.status(200).json({ reply: hardcodedReply });
      }

      // 2. Fallback to OpenAI
      if (!process.env.OPENAI_API_KEY) {
        console.warn("⚠️ OPENAI_API_KEY not set. Returning fallback greeting.");
        return res.status(200).json({ reply: responseDatabase["greeting"] });
      }

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are EricBot, a helpful assistant for AA Kenya - Ngong Town Branch. 
              Your goal is to answer questions about driving courses, fees, and requirements based on general knowledge of Kenyan driving schools, but prioritize the specific info provided below if relevant.
              
              Key Info:
              - Location: Ngong Town
              - Phone: 0759963210
              - Beginner Course (Saloon): KSh 24,900 (5 weeks)
              - Refresher: KSh 10,000
              - NTSA Fees: KSh 2,450
              
              Keep answers concise, friendly, and professional. Use emojis sparingly.
              If you don't know the answer, ask them to call 0759963210.`
            },
            ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
          ],
          max_tokens: 300,
        });

        const aiReply = completion.choices[0]?.message?.content || "I'm sorry, I didn't catch that. Please try again or call us at 0759963210.";
        return res.status(200).json({ reply: aiReply });

      } catch (aiError) {
        console.error("💥 OpenAI API Error:", aiError);
        return res.status(200).json({ reply: responseDatabase["greeting"] });
      }

    } catch (error: unknown) {
      console.error("💥 Error in chat handler:", error);
      return res.status(200).json({ reply: responseDatabase["greeting"] });
    }
  }

  // 4. Default 405 for unsupported methods
  res.setHeader("Allow", "POST, GET, OPTIONS");
  return res.status(405).json({
    error: "Method Not Allowed",
    message: `The method ${method} is not supported. Please use POST.`
  });
}