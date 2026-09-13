import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

const APP_NAME = 'Poshaniq';
const CONTACT_EMAIL = 'support@nutrivision.app';
const LAST_UPDATED = 'September 11, 2026';

function LegalShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] px-4 sm:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/pricing" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h1>
        <p className="text-xs text-[var(--text-muted)] mb-8">Last updated: {LAST_UPDATED}</p>
        <div className="space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">{children}</div>
        <p className="text-xs text-[var(--text-muted)] mt-12 pt-6 border-t border-[var(--border-color)]">
          Questions about this policy? Contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">{CONTACT_EMAIL}</a>.
        </p>
      </div>
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-[var(--text-primary)] mb-2">{heading}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function TermsPage() {
  return (
    <LegalShell title="Terms & Conditions" subtitle={`Please read these terms carefully before using ${APP_NAME}.`}>
      <Section heading="1. About the Service">
        <p>
          {APP_NAME} is a nutrition tracking application that helps users log meals, track macros and water intake,
          monitor weight and exercise, and receive AI-assisted diet plans and coaching. The service is provided via
          our website and mobile application.
        </p>
      </Section>
      <Section heading="2. Acceptance of Terms">
        <p>
          By creating an account or using {APP_NAME} in any way, you agree to these Terms & Conditions and our
          Privacy Policy. If you do not agree, please do not use the service.
        </p>
      </Section>
      <Section heading="3. Not Medical Advice">
        <p>
          <b className="text-[var(--text-primary)]">Important:</b> {APP_NAME} provides general nutrition and fitness
          information generated with the help of artificial intelligence. It is <b className="text-[var(--text-primary)]">not medical advice</b> and is not a
          substitute for consultation with a qualified doctor, registered dietitian, or healthcare professional.
          Always consult a healthcare provider before making significant changes to your diet, exercise routine,
          or if you have a medical condition, are pregnant, or are under medical treatment.
        </p>
      </Section>
      <Section heading="4. Eligibility & Accounts">
        <p>
          You must be at least 13 years old to use {APP_NAME}. You are responsible for keeping your login credentials
          confidential and for all activity that occurs under your account. You may sign in using Google or an email
          and password issued to you.
        </p>
      </Section>
      <Section heading="5. Subscriptions & Payments">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Pro is offered as a Monthly subscription (₹99/month) or Yearly subscription (₹799/year), inclusive of applicable taxes unless stated otherwise.</li>
          <li>Payments are processed securely by our payment partner Razorpay. We do not store your card or UPI details on our servers.</li>
          <li>With auto-payment enabled, your subscription renews automatically at the end of each billing cycle until cancelled.</li>
          <li>Cancellation and refund terms are described in our <Link to="/refund-policy" className="text-accent hover:underline">Refund &amp; Cancellation Policy</Link>.</li>
        </ul>
      </Section>
      <Section heading="6. Acceptable Use">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Do not attempt to access another user's data or disrupt the service.</li>
          <li>Do not use automated tools to scrape, spam, or abuse the service or its AI features.</li>
          <li>Fair-use limits apply to AI features (meal photo analysis and coaching) to keep the service fast and reliable for everyone.</li>
        </ul>
      </Section>
      <Section heading="7. Intellectual Property">
        <p>
          All content, branding, and software in {APP_NAME} are owned by us or our licensors. You may not copy,
          modify, or redistribute any part of the service without permission. Meal data and photos you upload remain
          yours; you grant us a limited license to process them solely to provide the service to you.
        </p>
      </Section>
      <Section heading="8. Limitation of Liability">
        <p>
          The service is provided "as is" without warranties of any kind. To the maximum extent permitted by law,
          our total liability to you for any claim relating to the service is limited to the amount you paid us in
          the 12 months preceding the claim, or ₹100, whichever is greater.
        </p>
      </Section>
      <Section heading="9. Changes & Termination">
        <p>
          We may update these terms from time to time and will note the last-updated date above. We may suspend or
          terminate accounts that violate these terms. You may stop using the service and delete your account at any time.
        </p>
      </Section>
      <Section heading="10. Contact">
        <p>For any questions about these terms, contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">{CONTACT_EMAIL}</a>.</p>
      </Section>
    </LegalShell>
  );
}

export function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" subtitle={`How ${APP_NAME} collects, uses, and protects your data.`}>
      <Section heading="1. Information We Collect">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><b className="text-[var(--text-primary)]">Account data:</b> your name, email address, and profile details (weight, height, age, gender, goal, diet preference).</li>
          <li><b className="text-[var(--text-primary)]">Health & nutrition data:</b> meals you log (including photos of your food), calories and macros, water intake, exercise, steps, and weight entries.</li>
          <li><b className="text-[var(--text-primary)]">Usage data:</b> basic technical logs needed to run and secure the service.</li>
          <li><b className="text-[var(--text-primary)]">Payment data:</b> handled entirely by Razorpay. We store only your subscription status and payment references — never your card, UPI, or bank details.</li>
        </ul>
      </Section>
      <Section heading="2. How We Use Your Data">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>To provide core features: logging, analytics, and personalized targets calculated from your profile.</li>
          <li>To analyze meal photos and generate diet plans/coach responses. Meal photos may be processed by our AI provider (Google Gemini) solely to extract nutrition information.</li>
          <li>To process subscriptions through Razorpay and enforce fair-use limits.</li>
        </ul>
      </Section>
      <Section heading="3. What We Never Do">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>We never sell your personal data.</li>
          <li>We never share your meal photos or health data with advertisers.</li>
          <li>We never use your data to train public AI models.</li>
        </ul>
      </Section>
      <Section heading="4. Data Storage & Security">
        <p>
          Your data is stored on Supabase infrastructure with row-level security so that only you can access your own
          records. All traffic is encrypted in transit (HTTPS). Access to production data is restricted to the
          operator of the service.
        </p>
      </Section>
      <Section heading="5. Your Rights">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>You can export your meal and weight data anytime from the app.</li>
          <li>You can request deletion of your account and all associated data by emailing <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">{CONTACT_EMAIL}</a>. We will delete your data within 30 days.</li>
          <li>You can revoke Google account access anytime from your Google Account settings (Security → Third-party access).</li>
        </ul>
      </Section>
      <Section heading="6. Children's Privacy">
        <p>{APP_NAME} is not intended for children under 13, and we do not knowingly collect their data.</p>
      </Section>
      <Section heading="7. Changes to This Policy">
        <p>We may update this policy from time to time. The last-updated date at the top of this page always reflects the current version.</p>
      </Section>
    </LegalShell>
  );
}

export function RefundPolicyPage() {
  return (
    <LegalShell title="Refund & Cancellation Policy" subtitle="Simple and transparent: full refund within 24 hours of any charge.">
      <Section heading="1. 24-Hour Full Refund Window">
        <p>
          You may cancel your subscription and receive a <b className="text-[var(--text-primary)]">100% refund</b> within
          <b className="text-[var(--text-primary)]"> 24 hours</b> of any payment (first purchase or renewal).
          Cancel from the Pro page inside the app (tap the Pro badge), and the refund is processed automatically
          to your original payment method. Refunds typically reflect in 5–7 working days depending on your bank.
        </p>
      </Section>
      <Section heading="2. After 24 Hours">
        <p>
          Cancellation after the 24-hour window stops all <b className="text-[var(--text-primary)]">future renewals</b>, and you keep Pro
          access until the end of the current billing period. The amount for the current period is non-refundable
          after 24 hours, in line with standard digital subscription practice.
        </p>
      </Section>
      <Section heading="3. How to Cancel">
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Open {APP_NAME} and sign in.</li>
          <li>Tap the <b className="text-[var(--text-primary)]">Pro</b> badge at the top of the dashboard to open the subscription page.</li>
          <li>Tap <b className="text-[var(--text-primary)]">Cancel subscription</b> (visible within 24 hours of your last charge) and confirm.</li>
          <li>Your refund is initiated immediately and your Pro access is removed. Auto-renewal stops.</li>
        </ol>
      </Section>
      <Section heading="4. Auto-Payment">
        <p>
          Auto-payment (auto-renewal) is optional and shown as a checkbox at checkout. If enabled, your plan renews
          automatically every month/year until cancelled. Every renewal charge also carries its own 24-hour
          full-refund window. You may also cancel auto-renewal anytime by contacting us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">{CONTACT_EMAIL}</a>.
        </p>
      </Section>
      <Section heading="5. Failed or Duplicate Charges">
        <p>
          If you were charged twice for the same plan, or believe a charge was made in error, contact us within
          7 days and we will refund the duplicate charge in full.
        </p>
      </Section>
      <Section heading="6. Contact for Refunds">
        <p>
          Refund and cancellation questions: <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">{CONTACT_EMAIL}</a>.
          We respond within 48 hours on working days.
        </p>
      </Section>
    </LegalShell>
  );
}

export function ContactPage() {
  return (
    <LegalShell title="Contact Us" subtitle="We're happy to help with anything about your account, data, or subscription.">
      <Section heading="Support">
        <p>
          Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">{CONTACT_EMAIL}</a><br />
          We typically respond within 48 hours on working days.
        </p>
      </Section>
      <Section heading="What to Include">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>The email address you signed up with</li>
          <li>A short description of the issue or question</li>
          <li>For payment issues: the date and amount of the charge (no card details, ever)</li>
        </ul>
      </Section>
      <Section heading="In-App Feedback">
        <p>
          You can also send feedback directly from the app using the Feedback option in the menu — it reaches us
          with helpful context attached automatically.
        </p>
      </Section>
    </LegalShell>
  );
}
