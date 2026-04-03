import Link from 'next/link';

export const metadata = {
  title: 'Login | Chilav',
  description: 'Sign in to your expense tracker account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[var(--background)]">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-90" />
        <div className="absolute inset-0 noise" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <span className="font-black text-lg">C</span>
            </div>
            <span className="text-2xl font-black tracking-tight">chilav</span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-5xl font-black leading-tight mb-4">
              Money,<br />simplified.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Track expenses, manage investments, and understand your spending with your partner.
            </p>
          </div>

          <p className="text-white/30 text-sm">
            Your data stays private and secure.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center">
                <span className="text-white font-black text-sm">C</span>
              </div>
              <span className="text-xl font-black tracking-tight text-foreground">chilav</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
