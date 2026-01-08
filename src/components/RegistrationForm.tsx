import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { RegistrationFormData, FormErrors } from '../types';

interface RegistrationFormProps {
    onSubmit: (data: RegistrationFormData) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

export default function RegistrationForm({ onSubmit, onCancel, isSubmitting }: RegistrationFormProps) {
    const { t } = useLanguage();
    const formRef = useRef<HTMLFormElement>(null);

    const [formData, setFormData] = useState<RegistrationFormData>({
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

    // Validation functions
    const validateField = (name: keyof RegistrationFormData, value: string): string => {
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
                const requiredFields: (keyof RegistrationFormData)[] = [
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

    const handleFieldChange = (field: keyof RegistrationFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (formErrors[field]) {
            const error = validateField(field, value);
            setFormErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    const handleFieldBlur = (field: keyof RegistrationFormData, value: string) => {
        const error = validateField(field, value);
        setFormErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        // Validate all fields before submission
        const errors: FormErrors = {};
        let hasErrors = false;

        (Object.keys(formData) as Array<keyof RegistrationFormData>).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                errors[key] = error;
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setFormErrors(errors);

            // Focus on first error field
            const firstErrorField = Object.keys(errors)[0] as keyof RegistrationFormData;
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
            errorElement?.focus();

            return;
        }

        await onSubmit(formData);
    };

    return (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95dvh] sm:max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
                {/* Header */}
                <div className="bg-primary-blue/5 p-3 sm:p-4 border-b border-primary-blue/10 flex justify-between items-center shrink-0">
                    <h2 className="text-sm sm:text-lg font-bold text-primary-blue flex items-center gap-2">
                        📋 {t('registrationForm')}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-white transition-all transition-colors"
                        aria-label="Close registration form"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-gray-200">
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 sm:space-y-6" noValidate>
                        {/* Personal Information Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
                                👤 {t('personalInfo')}
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="fullName" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
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
                                        className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all ${formErrors.fullName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary-blue'}`}
                                        placeholder="Enter your full name"
                                    />
                                    {formErrors.fullName && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.fullName}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="dateOfBirth" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
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
                                            className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all ${formErrors.dateOfBirth ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary-blue'}`}
                                        />
                                        {formErrors.dateOfBirth && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.dateOfBirth}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="idNumber" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
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
                                            className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all ${formErrors.idNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary-blue'}`}
                                            placeholder="ID or Passport No."
                                        />
                                        {formErrors.idNumber && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.idNumber}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
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
                                            className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all ${formErrors.phoneNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary-blue'}`}
                                            placeholder="07XXXXXXXX"
                                        />
                                        {formErrors.phoneNumber && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.phoneNumber}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
                                            {t('email')} <span className="text-gray-400 font-normal lowercase">(optional)</span>
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleFieldChange('email', e.target.value)}
                                            onBlur={(e) => handleFieldBlur('email', e.target.value)}
                                            className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all ${formErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary-blue'}`}
                                            placeholder="name@email.com"
                                        />
                                        {formErrors.email && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.email}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact Section */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
                                🆘 {t('emergencyContact')}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="emergencyContactName" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
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
                                        className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all ${formErrors.emergencyContactName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary-blue'}`}
                                        placeholder="Contact Person Name"
                                    />
                                    {formErrors.emergencyContactName && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.emergencyContactName}</p>}
                                </div>

                                <div>
                                    <label htmlFor="emergencyContactPhone" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
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
                                        className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all ${formErrors.emergencyContactPhone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary-blue'}`}
                                        placeholder="07XXXXXXXX"
                                    />
                                    {formErrors.emergencyContactPhone && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.emergencyContactPhone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Course Information Section */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
                                🎓 {t('courseInfo')}
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="preferredCourse" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
                                        {t('preferredCourse')}
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="preferredCourse"
                                            name="preferredCourse"
                                            required
                                            value={formData.preferredCourse}
                                            onChange={(e) => handleFieldChange('preferredCourse', e.target.value)}
                                            onBlur={(e) => handleFieldBlur('preferredCourse', e.target.value)}
                                            className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all appearance-none cursor-pointer ${formErrors.preferredCourse ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary-blue'}`}
                                        >
                                            <option value="">Select a course...</option>
                                            <option value="Motorcycle (Category A)">Motorcycle (Category A)</option>
                                            <option value="Saloon Car (Category B-Manual)">Saloon Car (Category B-Manual)</option>
                                            <option value="Saloon Car (Category B-Automatic)">Saloon Car (Category B-Automatic)</option>
                                            <option value="Passenger Vehicle (Category D1)">Passenger Vehicle (Category D1)</option>
                                            <option value="Light Truck (Category C1)">Light Truck (Category C1)</option>
                                            <option value="PSV (Category D1/D)">PSV (Category D1/D)</option>
                                            <option value="Premier Driving">Premier Driving</option>
                                            <option value="Refresher Course">Refresher Course</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    {formErrors.preferredCourse && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.preferredCourse}</p>}
                                </div>

                                <div>
                                    <label htmlFor="preferredIntake" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
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
                                        className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all ${formErrors.preferredIntake ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary-blue'}`}
                                    />
                                    {formErrors.preferredIntake && <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.preferredIntake}</p>}
                                </div>

                                <div>
                                    <label htmlFor="additionalNotes" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
                                        {t('additionalNotes')}
                                    </label>
                                    <textarea
                                        id="additionalNotes"
                                        name="additionalNotes"
                                        value={formData.additionalNotes}
                                        onChange={(e) => handleFieldChange('additionalNotes', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('additionalNotes', e.target.value)}
                                        rows={3}
                                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
                                        placeholder="Any specific requests or questions?"
                                    />
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-primary-blue hover:border-primary-blue/30 transition-all shadow-sm active:scale-95 touch-manipulation"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 text-sm font-bold text-white bg-cta-green rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm flex justify-center items-center active:scale-95 touch-manipulation"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('submitting')}
                            </>
                        ) : t('submitRegistration')}
                    </button>
                </div>
            </div>
        </div>
    );
}
