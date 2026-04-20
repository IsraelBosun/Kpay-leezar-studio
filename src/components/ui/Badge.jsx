const variants = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  danger:  'bg-red-50 text-red-700 border-red-200',
  default: 'bg-gray-50 text-gray-700 border-gray-200',
  primary: 'bg-red-50 text-primary border-red-200',
};

export default function Badge({ children, variant = 'default' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-bold border ${variants[variant]}`}>
      {children}
    </span>
  );
}
