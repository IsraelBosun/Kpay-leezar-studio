export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col space-y-2">
      {label && (
        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
          {label}
        </label>
      )}
      <input
        className={`bg-transparent border-b-2 py-3 focus:outline-none transition-all text-black placeholder:text-gray-300 font-light ${
          error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 italic">{error}</span>}
    </div>
  );
}
