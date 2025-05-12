// app/admin/page.tsx (or .js)
import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/notifications');
}
