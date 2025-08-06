import { useEffect } from 'react';
import { useRouter } from 'expo-router';

/**
 * Redirect the auth root to the login page by default.
 */
export default function AuthIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);
  return null;
}