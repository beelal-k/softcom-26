import { Metadata } from 'next';
import ForgotPasswordViewPage from '@/features/auth/components/forgot-password-view';

export const metadata: Metadata = {
  title: 'Authentication | Forgot Password',
  description: 'Forgot Password page for account recovery.'
};

export default function Page() {
  return <ForgotPasswordViewPage />;
}
