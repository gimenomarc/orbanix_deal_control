import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('orbanix_auth_session');

  if (session?.value) {
    redirect('/inicio');
  }

  redirect('/login');
}

