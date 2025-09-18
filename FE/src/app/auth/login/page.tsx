import { Metadata } from 'next';
import { AuthLayout } from '@/components/common/Layout';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your FinBoard account to access your dashboard and create posts.',
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}