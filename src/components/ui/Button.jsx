export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-widest font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-primary text-white hover:bg-black',
    secondary: 'bg-black text-white hover:bg-primary',
    outline: 'border border-black text-black hover:bg-black hover:text-white',
    ghost: 'text-black hover:text-primary',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
