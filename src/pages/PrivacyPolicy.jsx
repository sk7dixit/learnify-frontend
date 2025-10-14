import React from 'react';

function PrivacyPolicy() {
  return (
    <div className="max-w-4xl w-full">
      <h1 className="text-4xl font-extrabold text-cyan-400 mb-8 border-b-2 border-cyan-500 pb-4">Privacy Policy</h1>

      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p className="text-lg">Last updated: October 8, 2025</p>

        <p>Your privacy is important to us. It is Learnify's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.</p>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-cyan-300">1. Information We Collect</h2>
          <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We collect information such as your name, email address, age, and mobile number upon registration. We also track activity data, such as your last login date, to improve our services.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-cyan-300">2. How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Process your transactions and manage your subscriptions</li>
            <li>Communicate with you for customer service and for promotional purposes</li>
            <li>Prevent fraud and ensure the security of our platform</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-cyan-300">3. Log Files & Data Security</h2>
          <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use, or modification. Your notes are encrypted on our servers to protect your intellectual property.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-cyan-300">4. Third-Party Services</h2>
          <p>We use third-party services for payment processing (PayPal). We do not store your credit card or payment details on our servers. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-cyan-300">5. Your Consent</h2>
          <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;