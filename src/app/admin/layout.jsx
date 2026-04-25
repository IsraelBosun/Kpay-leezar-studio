import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase';
import { AdminThemeProvider } from '@/components/admin/AdminThemeContext';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = { title: 'Admin — photostudio.ng' };

export default async function AdminLayout({ children }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');
  if (user.email !== process.env.ADMIN_EMAIL) redirect('/studio/dashboard');

  return (
    <AdminThemeProvider userEmail={user.email}>
      <AdminSidebar userEmail={user.email} />
      <main className="flex-1 min-w-0 lg:ml-60 pt-16 lg:pt-0 overflow-x-hidden">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </AdminThemeProvider>
  );
}
