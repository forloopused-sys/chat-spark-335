import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
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
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, including name, email, phone number,
              age, and username when you create an account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use your information to provide, maintain, and improve our services, to communicate
              with you, and to ensure the security of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Information Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. We may share information with service providers
              who assist us in operating our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information from
              unauthorized access, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, update, or delete your personal information at any time
              through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Changes to Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of any changes
              by posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us through the
              app's support channel.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
