"use client";
import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceType: 'Portrait Session',
    eventDate: '',
    budget: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return value.trim().length < 2 ? 'Please enter your full name' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Please enter a valid email' : '';
      case 'phone':
        return value.trim().length < 10 ? 'Please enter a valid phone number' : '';
      case 'message':
        return value.trim().length < 10 ? 'Please provide more details (min 10 characters)' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        serviceType: 'Portrait Session',
        eventDate: '',
        budget: '',
        message: ''
      });
      setTouched({});
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  return (
    <div className="bg-gray-50 p-8 md:p-12 relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative">
        <h3 className="text-2xl font-serif mb-2 text-black">Booking Request</h3>
        <p className="text-sm text-neutral-gray mb-8 italic">Fill in your details and we'll be in touch shortly</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div className="flex flex-col space-y-2 group">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-focus-within:text-primary transition-colors">
                Full Name *
              </label>
              <input 
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Alexander Reed"
                className={`bg-transparent border-b-2 py-3 focus:outline-none transition-all text-black placeholder:text-gray-300 font-light ${
                  errors.fullName && touched.fullName 
                    ? 'border-red-400 focus:border-red-500' 
                    : 'border-gray-200 focus:border-primary'
                }`}
              />
              {errors.fullName && touched.fullName && (
                <span className="text-xs text-red-500 italic">{errors.fullName}</span>
              )}
            </div>

            {/* Email Address */}
            <div className="flex flex-col space-y-2 group">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-focus-within:text-primary transition-colors">
                Email Address *
              </label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="email@example.com"
                className={`bg-transparent border-b-2 py-3 focus:outline-none transition-all text-black placeholder:text-gray-300 font-light ${
                  errors.email && touched.email 
                    ? 'border-red-400 focus:border-red-500' 
                    : 'border-gray-200 focus:border-primary'
                }`}
              />
              {errors.email && touched.email && (
                <span className="text-xs text-red-500 italic">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Phone Number */}
            <div className="flex flex-col space-y-2 group">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-focus-within:text-primary transition-colors">
                Phone Number *
              </label>
              <input 
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="+234 XXX XXX XXXX"
                className={`bg-transparent border-b-2 py-3 focus:outline-none transition-all text-black placeholder:text-gray-300 font-light ${
                  errors.phone && touched.phone 
                    ? 'border-red-400 focus:border-red-500' 
                    : 'border-gray-200 focus:border-primary'
                }`}
              />
              {errors.phone && touched.phone && (
                <span className="text-xs text-red-500 italic">{errors.phone}</span>
              )}
            </div>

            {/* Service Type */}
            <div className="flex flex-col space-y-2 group">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-focus-within:text-primary transition-colors">
                Service Type
              </label>
              <select 
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="bg-transparent border-b-2 border-gray-200 py-3 focus:border-primary focus:outline-none transition-all text-black appearance-none cursor-pointer font-light bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
              >
                <option>Portrait Session</option>
                <option>Commercial / Brand</option>
                <option>Event / Wedding</option>
                <option>Editorial</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Event Date */}
            <div className="flex flex-col space-y-2 group">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-focus-within:text-primary transition-colors">
                Preferred Date
              </label>
              <input 
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="bg-transparent border-b-2 border-gray-200 py-3 focus:border-primary focus:outline-none transition-all text-black font-light cursor-pointer"
              />
            </div>

            {/* Budget Range */}
            <div className="flex flex-col space-y-2 group">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-focus-within:text-primary transition-colors">
                Budget Range
              </label>
              <select 
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="bg-transparent border-b-2 border-gray-200 py-3 focus:border-primary focus:outline-none transition-all text-black appearance-none cursor-pointer font-light bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
              >
                <option value="">Select budget range</option>
                <option>₦500,000 - ₦1,000,000</option>
                <option>₦1,000,000 - ₦2,500,000</option>
                <option>₦2,500,000 - ₦5,000,000</option>
                <option>₦5,000,000+</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col space-y-2 group">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-focus-within:text-primary transition-colors">
              Project Details *
            </label>
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="5"
              placeholder="Tell us about your vision, timeline, and any specific requirements..."
              className={`bg-transparent border-b-2 py-3 focus:outline-none transition-all text-black placeholder:text-gray-300 font-light resize-none ${
                errors.message && touched.message 
                  ? 'border-red-400 focus:border-red-500' 
                  : 'border-gray-200 focus:border-primary'
              }`}
            />
            {errors.message && touched.message && (
              <span className="text-xs text-red-500 italic">{errors.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-5 uppercase tracking-[0.3em] text-xs font-bold transition-all duration-500 shadow-xl relative overflow-hidden group ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-black hover:bg-primary text-white shadow-black/5'
              }`}
            >
              <span className={`relative z-10 flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-50' : ''}`}>
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Inquiry
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </span>
              
              {/* Hover effect */}
              {!isSubmitting && (
                <span className="absolute inset-0 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              )}
            </button>

            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm italic animate-fade-in">
                ✓ Thank you! Your inquiry has been received. We'll be in touch within 24 hours.
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm italic animate-fade-in">
                ✗ Something went wrong. Please try again or contact us directly.
              </div>
            )}
          </div>

          <p className="text-xs text-neutral-gray italic text-center pt-4">
            * Required fields. By submitting this form, you agree to be contacted about your inquiry.
          </p>
        </form>
      </div>
    </div>
  );
}