import { Metadata } from 'next';
import { AuthLayout } from '@/components/common/Layout';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your FinBoard account and join our community of finance professionals.',
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}