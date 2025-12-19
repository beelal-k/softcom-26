import { Metadata } from 'next';
import ResetPasswordViewPage from '@/features/auth/components/reset-password-view';

export const metadata: Metadata = {
  title: 'Authentication | Reset Password',
  description: 'Reset Password page for account recovery.'
};

export default function Page() {
  return <ResetPasswordViewPage />;
}
