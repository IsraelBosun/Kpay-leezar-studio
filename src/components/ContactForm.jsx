export default function ContactForm() {
  return (
    <form className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Full Name */}
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Full Name</label>
          <input 
            type="text" 
            placeholder="e.g. Alexander Reed"
            className="bg-transparent border-b border-gray-200 py-3 focus:border-primary focus:outline-none transition-colors text-black placeholder:text-gray-300 font-light"
          />
        </div>

        {/* Email Address */}
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email Address</label>
          <input 
            type="email" 
            placeholder="email@example.com"
            className="bg-transparent border-b border-gray-200 py-3 focus:border-primary focus:outline-none transition-colors text-black placeholder:text-gray-300 font-light"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Phone Number */}
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Phone Number</label>
          <input 
            type="tel" 
            placeholder="+234"
            className="bg-transparent border-b border-gray-200 py-3 focus:border-primary focus:outline-none transition-colors text-black placeholder:text-gray-300 font-light"
          />
        </div>

        {/* Photography Type */}
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Service Type</label>
          <select className="bg-transparent border-b border-gray-200 py-3 focus:border-primary focus:outline-none transition-colors text-black appearance-none cursor-pointer font-light">
            <option>Portrait Session</option>
            <option>Commercial / Brand</option>
            <option>Event / Wedding</option>
            <option>Editorial</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Project Details</label>
        <textarea 
          rows="4"
          placeholder="Tell us about your vision..."
          className="bg-transparent border-b border-gray-200 py-3 focus:border-primary focus:outline-none transition-colors text-black placeholder:text-gray-300 font-light resize-none"
        />
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        className="w-full bg-black text-white py-5 uppercase tracking-[0.3em] text-xs font-bold hover:bg-primary transition-all duration-500 shadow-xl shadow-black/5"
      >
        Send Inquiry
      </button>
    </form>
  );
}