import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border-b border-border p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Terms and Conditions</h1>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using ChatNow, you agree to be bound by these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. User Accounts</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account and password.
              You must be at least 13 years old to use this service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. User Conduct</h2>
            <p className="text-muted-foreground">
              You agree not to use the service for any unlawful purpose or to violate any laws.
              Harassment, abuse, or inappropriate content is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Privacy</h2>
            <p className="text-muted-foreground">
              Your use of ChatNow is also governed by our Privacy Policy. Please review it to
              understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to terminate or suspend your account at any time for violations
              of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may modify these terms at any time. Continued use of the service after changes
              constitutes acceptance of the new terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
