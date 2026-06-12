import { Shield } from 'lucide-react';
import { RegisterForm } from '@/components/shared/LoginForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A6B] to-[#2563EB] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="h-8 w-8 text-blue-200" />
            <span className="text-2xl font-bold text-white">Nexum</span>
          </div>
          <p className="text-blue-200">Create your account to book accommodation</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
