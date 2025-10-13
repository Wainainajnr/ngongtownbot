import type { NextApiRequest, NextApiResponse } from "next";

// Define proper interfaces for form data
interface RegistrationFormData {
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

interface ChatRequestBody {
  messages?: Array<{ role: string; content: string }>;
  formData?: RegistrationFormData;
  action?: string;
}

// Comprehensive response database for AA Ngong Town Driving School
const responseDatabase: { [key: string]: string } = {
  // ==================== GREETING TRIGGER ====================
  "greeting": `Hello! 👋 Welcome to AA Ngong Town Driving School! 🚗

We offer comprehensive driving courses (5 weeks for main courses, 3 weeks for refresher) with certified instructors right here in Ngong Town.

⚠️ Important: Check NTSA requirements before applying for any class.

📞 Contact AA Ngong Town:
• Phone: 0759963210  

Please choose an option:  
1️⃣ Course Information & Fees  
2️⃣ Registration Assistance  
3️⃣ Local Branch Services  
4️⃣ Payment & NTSA Requirements  
5️⃣ License Prerequisites`,

  // ==================== 1️⃣ COURSE INFORMATION & FEES ====================
  "course_info": `📚 STANDARD COURSES (5 Weeks Duration)

🏍️ Motorcycle (Category A)
Course Fee: KSh 5,780  
NTSA Fee: KSh 2,450 (via eCitizen)  
Duration: 5 weeks

🚗 Saloon Car (Category B)
Course Fee: KSh 18,780  
NTSA Fee: KSh 2,450 (via eCitizen)  
Duration: 5 weeks

🚐 Passenger Light Vehicle (Category D1)
Course Fee: KSh 10,780  
NTSA Fee: KSh 2,350  
Duration: 5 weeks  
Requires Category B license

🚚 Light & Medium Trucks (Category C1/C)
Course Fee: KSh 12,780  
NTSA Fee: KSh 2,350  
Duration: 5 weeks  
Requires Category B license

🚌 Public Service Vehicle (Category D1/D)
Course Fee: KSh 12,780  
NTSA Fee: KSh 2,350  
Duration: 5 weeks  
Requires Category B license

⭐ Premier Driving
Course Fee: KSh 50,000  
NTSA Fee: Included in fees + smart driving license  
Duration: 5 weeks  
Advanced training course

🔄 REFRESHER COURSES (3 Weeks)
Light Vehicle: KSh 10,000  
Light & Medium Truck: KSh 11,500  
Premier Refresher: KSh 20,000

📋 ASSESSMENT COURSES (1-2 Days)
Class B (Saloon): KSh 5,000  
Class C (Trucks): KSh 6,000

📅 INTAKE SCHEDULE
Every Wednesday  
Morning: 9:00 AM - 10:00 AM  
Afternoon: 12:00 PM - 1:00 PM

💳 PAYMENT METHODS
• Course Fees — M-Pesa / Bank Transfer ONLY  
• NTSA Fees — via eCitizen  
(Cash NOT accepted at branch)

Choose another option:
1️⃣ Course Information & Fees  
2️⃣ Registration Assistance  
3️⃣ Local Branch Services  
4️⃣ Payment & NTSA Requirements  
5️⃣ License Prerequisites`,

  // ==================== 2️⃣ REGISTRATION ASSISTANCE ====================
  "registration": `📝 REGISTRATION OPTIONS:

Option 1️⃣: Online Self-Registration (Fastest)
➡️ 🔗 Register directly here: 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
https://edereva.aakenya.co.ke/students/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option 2️⃣: Contact AA Ngong Town Directly  
📞 Phone: 0759963210  
📧 Email: aangongtown@aakenya.co.ke  
☎️ AA Call Center: 0709 933 000 / 999  

Option 3️⃣: I Can Help You Get Started!  
Click the "Start Registration" button below to fill out a simple form, and we'll contact you within 24 hours! 📋✨

Choose another option:
1️⃣ Course Information & Fees  
2️⃣ Registration Assistance  
3️⃣ Local Branch Services  
4️⃣ Payment & NTSA Requirements  
5️⃣ License Prerequisites`,

  // ==================== 3️⃣ LOCAL BRANCH SERVICES ====================
  "branch_services": `🏢 LOCAL NGONG TOWN BRANCH SERVICES

We offer:
✅ Certified experienced instructors  
✅ 5-week curriculum (3-week refresher)  
✅ Smart driving license processing  
✅ NTSA test booking assistance  
✅ Evening/weekend classes  
✅ All NTSA license categories  
✅ Well-maintained training vehicles  
✅ Personalized local attention  
✅ Part of AA Kenya's 60+ branch network  

📍 Branch Details:
AA Ngong Town Driving School  
Phone: 0759963210  
Email: aangongtown@aakenya.co.ke  
AA Call Center: 0709 933 000 / 999  

📅 Intakes every Wednesday:  
Morning: 9:00 AM - 10:00 AM  
Afternoon: 12:00 PM - 1:00 PM

Choose another option:
1️⃣ Course Information & Fees  
2️⃣ Registration Assistance  
3️⃣ Local Branch Services  
4️⃣ Payment & NTSA Requirements  
5️⃣ License Prerequisites`,

  // ==================== 4️⃣ PAYMENT & NTSA REQUIREMENTS ====================
  "payment_ntsa": `💳 PAYMENT & NTSA REQUIREMENTS

Payment:
• Course Fees — via M-Pesa / Bank Transfer ONLY  
  (Cash NOT accepted at the branch)  
• NTSA Fees — Paid via eCitizen platform  

📋 NTSA REQUIREMENTS
✅ National ID or Passport Copy  
✅ 2 Passport Photos  
✅ Eye Test Results (from AA or approved center)  
✅ NTSA TIMS Account  
✅ eCitizen login for NTSA payments  

For help with NTSA setup or eye test booking, call 0759963210.

Choose another option:
1️⃣ Course Information & Fees  
2️⃣ Registration Assistance  
3️⃣ Local Branch Services  
4️⃣ Payment & NTSA Requirements  
5️⃣ License Prerequisites`,

  // ==================== 5️⃣ LICENSE PREREQUISITES ====================
  "license_prerequisites": `📋 LICENSE PREREQUISITES

🚦 NO PREREQUISITES (Entry-Level):
✅ Category A – Motorcycles  
Minimum Age: 18 years  
No prior license needed  

✅ Category B – Saloon Cars  
Minimum Age: 18 years  
No prior license needed  

🧾 REQUIRES CATEGORY B FIRST:
🔹 Category C1 – Light Trucks  
Minimum Age: 18 years  
Must have: Category B license  

🔹 Category D1 – Small Passenger Vans (PSV)  
Minimum Age: 21 years  
Must have: Category B license  

🚚 REQUIRES LOWER TRUCK CATEGORY:
🔹 Category C – Medium Trucks  
Minimum Age: 21 years  
Must have: Category C1 license  

🔹 Category CE – Heavy Trucks/Articulated  
Minimum Age: 24 years  
Must have: Category C license  

🚌 REQUIRES LOWER PSV CATEGORY:
🔹 Category D – Large Passenger Vehicles  
Minimum Age: 24 years  
Must have: Category D1 license  

⚙️ SPECIAL VEHICLES:
🔹 Category G – Industrial/Construction Vehicles  
Minimum Age: 21 years  
Must have: Category B or C (depending on vehicle type)

Choose another option:
1️⃣ Course Information & Fees  
2️⃣ Registration Assistance  
3️⃣ Local Branch Services  
4️⃣ Payment & NTSA Requirements  
5️⃣ License Prerequisites`,

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

  // ==================== DEFAULT RESPONSE ====================
  "default": `Hello! 👋 Welcome to AA Ngong Town Driving School! 🚗

Please choose an option:  
1️⃣ Course Information & Fees  
2️⃣ Registration Assistance  
3️⃣ Local Branch Services  
4️⃣ Payment & NTSA Requirements  
5️⃣ License Prerequisites`
};

// Function to generate WhatsApp URL
function generateWhatsAppURL(formData: RegistrationFormData): string {
  const message = `🚗 NEW DRIVING SCHOOL REGISTRATION

👤 PERSONAL DETAILS:
Name: ${formData.fullName}
Date of Birth: ${formData.dateOfBirth}
ID/Passport: ${formData.idNumber}
Phone: ${formData.phoneNumber}
Email: ${formData.email || 'Not provided'}

🆘 EMERGENCY CONTACT:
Name: ${formData.emergencyContactName}
Phone: ${formData.emergencyContactPhone}

🎓 COURSE INFORMATION:
Course: ${formData.preferredCourse}
Intake: ${formData.preferredIntake}
Notes: ${formData.additionalNotes || 'None'}

📅 Submitted: ${new Date().toLocaleString('en-KE')}

Please contact within 24 hours!`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/254759963210?text=${encodedMessage}`;
}

// Function to find the best matching response
function findBestResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // ==================== GREETING TRIGGERS ====================
  const greetingTriggers = [
    'hi', 'hello', 'hey', 'mambo', 'habari', 'good morning', 'good afternoon', 
    'good evening', 'morning', 'afternoon', 'evening', 'start', 'begin'
  ];
  
  if (greetingTriggers.some(greet => lowerMessage.includes(greet))) {
    return responseDatabase["greeting"];
  }
  
  // ==================== MENU OPTION 1 - COURSE INFO ====================
  const courseTriggers = [
    '1', 'course', 'fees', 'price', 'charges', 'cost', 'how much', 
    'fee', 'pricing', 'charges', 'tuition', 'payment'
  ];
  
  if (courseTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return responseDatabase["course_info"];
  }
  
  // ==================== MENU OPTION 2 - REGISTRATION ====================
  const registrationTriggers = [
    '2', 'register', 'join', 'apply', 'sign up', 'enroll', 'enrollment',
    'admission', 'admissions', 'how to join', 'how to apply', 'start registration',
    'registration form', 'help me register'
  ];
  
  if (registrationTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return responseDatabase["registration"];
  }
  
  // ==================== MENU OPTION 3 - BRANCH SERVICES ====================
  const branchTriggers = [
    '3', 'branch', 'ngong', 'services', 'location', 'address', 'where',
    'contact', 'phone', 'email', 'office', 'facilities', 'instructors'
  ];
  
  if (branchTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return responseDatabase["branch_services"];
  }
  
  // ==================== MENU OPTION 4 - PAYMENT & NTSA ====================
  const paymentTriggers = [
    '4', 'ntsa', 'payment', 'requirements', 'documents', 'what do i need',
    'requirements', 'prerequisites', 'documents needed', 'eye test'
  ];
  
  if (paymentTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return responseDatabase["payment_ntsa"];
  }
  
  // ==================== MENU OPTION 5 - LICENSE PREREQUISITES ====================
  const licenseTriggers = [
    '5', 'license', 'prerequisite', 'requirement', 'eligibility', 
    'qualified', 'qualifications', 'what do i need for license',
    'license requirements', 'driving license', 'categories'
  ];
  
  if (licenseTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return responseDatabase["license_prerequisites"];
  }
  
  // ==================== FORM TRIGGER ====================
  const formTriggers = [
    'form', 'help me get started', 'option 3', 'get started', 'fill form',
    'registration form', 'start registration'
  ];
  
  if (formTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return responseDatabase["start_registration"];
  }
  
  // ==================== FALLBACK TO GREETING ====================
  return responseDatabase["greeting"];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { messages, formData, action }: ChatRequestBody = req.body;
      
      // Handle form submission
      if (action === 'submitRegistration' && formData) {
        console.log("📝 Processing registration form...");
        
        // Generate WhatsApp URL
        const whatsappUrl = generateWhatsAppURL(formData);
        
        console.log('📱 WHATSAPP NOTIFICATION READY:');
        console.log('🔗 URL:', whatsappUrl);
        console.log('📋 REGISTRATION DETAILS:');
        console.log('👤 Full Name:', formData.fullName);
        console.log('🎂 Date of Birth:', formData.dateOfBirth);
        console.log('🆔 ID Number:', formData.idNumber);
        console.log('📞 Phone:', formData.phoneNumber);
        console.log('📧 Email:', formData.email || 'Not provided');
        console.log('🆘 Emergency Contact:', formData.emergencyContactName);
        console.log('🆘 Emergency Phone:', formData.emergencyContactPhone);
        console.log('🎓 Course:', formData.preferredCourse);
        console.log('📅 Intake:', formData.preferredIntake);
        console.log('💬 Notes:', formData.additionalNotes || 'None');
        console.log('⏰ Submitted:', new Date().toLocaleString('en-KE'));
        
        return res.status(200).json({ 
          reply: `✅ Registration submitted successfully! We're opening WhatsApp to send your details to our team. Please click "Send" to complete the process.\n\nWe will contact you within 24 hours at **${formData.phoneNumber}**.\n\n📞 **Direct Contact:** 0759963210\n📍 **Location:** AA Ngong Town Driving School`,
          whatsappUrl: whatsappUrl
        });
      }
      
      // Handle regular chat messages
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
      }

      const userMessage = messages[messages.length - 1]?.content?.trim();
      if (!userMessage) {
        return res.status(400).json({ message: "Empty message" });
      }

      console.log("💬 User asked:", userMessage);
      
      // Find the best response
      const reply = findBestResponse(userMessage);
      
      console.log("✅ Sending menu response");
      
      // Simulate slight delay for natural feel
      await new Promise(resolve => setTimeout(resolve, 800));
      
      res.status(200).json({ reply });
      
    } catch (error: unknown) {
      console.error("💥 Error in chat handler:", error);
      
      res.status(200).json({ 
        reply: responseDatabase["greeting"]
      });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}