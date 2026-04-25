"use client";
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const HIDDEN_ON = ['/contact', '/auth/login', '/auth/signup', '/auth/onboarding'];

export default function ConditionalNavbar() {
  const pathname = usePathname();
  if (HIDDEN_ON.some(p => pathname.startsWith(p)) || pathname.startsWith('/studio') || pathname.startsWith('/studio-site') || pathname.startsWith('/gallery') || pathname.startsWith('/admin')) return null;
  return <Navbar />;
}
