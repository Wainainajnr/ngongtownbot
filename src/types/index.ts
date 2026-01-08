export interface Message {
    id?: string;
    role: "user" | "assistant";
    content: string;
    type?: "text" | "welcome" | "course_beginner" | "info_cards";
}

export interface RegistrationFormData {
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

export interface FormErrors {
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

export interface ChatResponse {
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
