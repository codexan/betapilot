import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import TableOfContents from './components/TableOfContents';
import PolicySection from './components/PolicySection';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'scope', title: '1. Scope', level: 1 },
    { id: 'data-collection', title: '2. Data We Collect', level: 1 },
    { id: 'info-provided', title: '2.1 Information you provide', level: 2 },
    { id: 'oauth-info', title: '2.2 Information obtained via OAuth', level: 2 },
    { id: 'technical-info', title: '2.3 Technical and usage information', level: 2 },
    { id: 'data-usage', title: '3. How We Use Your Information', level: 1 },
    { id: 'sharing', title: '4. Sharing and Disclosure', level: 1 },
    { id: 'retention', title: '5. Data Retention', level: 1 },
    { id: 'security', title: '6. Security', level: 1 },
    { id: 'controls', title: '7. User Controls and Choices', level: 1 },
    { id: 'cookies', title: '8. Cookies and Tracking', level: 1 },
    { id: 'transfers', title: '9. International Data Transfers', level: 1 },
    { id: 'children', title: '10. Children\'s Privacy', level: 1 },
    { id: 'changes', title: '11. Changes to this Privacy Policy', level: 1 },
    { id: 'contact', title: '12. Contact Us', level: 1 }
  ];

  const effectiveDate = new Date()?.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Privacy Policy - PilotBeta</title>
        <meta name="description" content="PilotBeta's Privacy Policy - Learn how we collect, use, and protect your personal information." />
      </Helmet>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8">
              <TableOfContents 
                sections={sections} 
                activeSection={activeSection}
                onSectionClick={setActiveSection}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  PilotBeta — Privacy Policy
                </h1>
                <p className="text-gray-600">
                  Effective date: {effectiveDate}
                </p>
                <p className="text-gray-700 mt-4 leading-relaxed">
                  Welcome to PilotBeta ("PilotBeta", "we", "us", or "our"). This Privacy Policy explains how we collect, use, disclose, and protect personal information when you use our website, products, and services (the "Services"), including when you authenticate via third-party identity providers such as Google OAuth.
                </p>
              </div>

              {/* Policy Sections */}
              <div className="space-y-8">
                <PolicySection 
                  id="scope"
                  title="1. Scope"
                  content={
                    <p className="text-gray-700 leading-relaxed">
                      This Privacy Policy applies to people who visit or use the Services at https://pilotbeta.com and any subdomains. By using our Services you accept the practices described in this policy.
                    </p>
                  }
                />

                <PolicySection 
                  id="data-collection"
                  title="2. Data We Collect"
                  content={
                    <div className="space-y-6">
                      <div id="info-provided">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Information you provide</h3>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                          <li><strong>Account profile data:</strong> name, email address, and profile picture when you sign in with Google OAuth or otherwise register.</li>
                          <li>Information you explicitly add within PilotBeta (messages, preferences, or content you choose to store).</li>
                        </ul>
                      </div>

                      <div id="oauth-info">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Information obtained via OAuth</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          When you sign in using Google OAuth, PilotBeta requests only the minimal scopes required for the features you enable. The scopes currently used are:
                        </p>
                        <ul className="list-disc pl-6 space-y-3 text-gray-700">
                          <li>
                            <strong>profile and email</strong> — used to identify you and enable secure login.
                          </li>
                          <li>
                            <strong>https://www.googleapis.com/auth/gmail.send</strong> — used only when you explicitly authorize PilotBeta to send email on your behalf (for example, to send beta test invitations or notifications that appear to come from your official email address). We do not access your inbox messages or message content beyond the ability to send messages you create/authorize.
                          </li>
                          <li>
                            <strong>https://www.googleapis.com/auth/calendar.events</strong> — used only when you enable calendar sync. This scope permits PilotBeta to read your free/busy status and to create, update, or delete events that you authorize (for scheduling and blocking meeting slots). We request only the minimal calendar permissions needed for these operations.
                          </li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                          We do not request access to your Google contacts, Drive files, or other Google data unless we explicitly disclose and request additional scopes and obtain your consent.
                        </p>
                      </div>

                      <div id="technical-info">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Technical and usage information</h3>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                          <li>Device and browser information (user agent, operating system).</li>
                          <li>IP address, approximate location, and performance and usage logs.</li>
                          <li>Analytics and aggregated usage metrics.</li>
                        </ul>
                      </div>
                    </div>
                  }
                />

                <PolicySection 
                  id="data-usage"
                  title="3. How We Use Your Information"
                  content={
                    <div>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We use personal information for the following purposes:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>To provide, operate, and maintain the Services (user authentication, account management).</li>
                        <li>To send communications you authorize (for example, email messages you compose within PilotBeta using your account, and scheduling/event invitations created on your behalf).</li>
                        <li>To display calendar availability and to create, update, or delete events when you enable scheduling and calendar blocking.</li>
                        <li>To respond to support requests and provide customer service.</li>
                        <li>To improve and monitor the performance, functionality, and security of the Services.</li>
                        <li>To comply with legal obligations and enforce our Terms of Service.</li>
                      </ul>
                    </div>
                  }
                />

                <PolicySection 
                  id="sharing"
                  title="4. Sharing and Disclosure"
                  content={
                    <div>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We do not sell personal data. We may disclose information in the following limited circumstances:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>With service providers and vendors who perform services on our behalf (hosting, email delivery, analytics, security) under contractual confidentiality obligations.</li>
                        <li>In response to lawful requests by public authorities, to comply with laws, subpoenas, or court orders.</li>
                        <li>To protect the rights, property, or safety of PilotBeta, our users, or the public.</li>
                        <li>In connection with a merger, acquisition, reorganization, sale of assets, or bankruptcy — with notice to users where required by law.</li>
                      </ul>
                    </div>
                  }
                />

                <PolicySection 
                  id="retention"
                  title="5. Data Retention"
                  content={
                    <div>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We retain personal data only as long as reasonably necessary for the purposes described in this Policy, subject to the timeframes below:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li><strong>Account data (profile information):</strong> retained until you delete your account, plus 30 days for recovery (in case you change your mind).</li>
                        <li><strong>Email sending metadata & logs:</strong> retained for 90 days to assist with troubleshooting and audit.</li>
                        <li><strong>Calendar event metadata created by PilotBeta:</strong> retained until you delete the event or your account, plus 30 days for recovery.</li>
                        <li><strong>Synced calendar availability snapshots (read-only metadata):</strong> retained for 90 days for security and debugging.</li>
                        <li><strong>Usage and security logs:</strong> retained for 12 months for security monitoring and abuse prevention.</li>
                        <li><strong>Anonymized analytics:</strong> retained indefinitely and contain no personally identifiable information.</li>
                      </ul>
                    </div>
                  }
                />

                <PolicySection 
                  id="security"
                  title="6. Security"
                  content={
                    <div>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We implement reasonable and appropriate technical and organizational measures to protect personal information against unauthorized access, disclosure, alteration, or destruction. Examples include:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>TLS encryption in transit and encryption at rest where appropriate.</li>
                        <li>Access controls and role-based permissions.</li>
                        <li>Audit logging, monitoring, and periodic security reviews.</li>
                        <li>Contractual controls for third-party processors with security requirements.</li>
                      </ul>
                      <p className="text-gray-700 leading-relaxed mt-4">
                        While we strive to protect your information, no online service can guarantee absolute security.
                      </p>
                    </div>
                  }
                />

                <PolicySection 
                  id="controls"
                  title="7. User Controls and Choices"
                  content={
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Revoke OAuth permissions</h3>
                        <p className="text-gray-700 leading-relaxed">
                          You can revoke PilotBeta's OAuth access at any time by visiting your Google Account → Security → Third-party apps with account access. Revoking access prevents PilotBeta from reading or modifying future Google data (calendar or sending emails) but does not automatically remove data PilotBeta previously created or stored — to remove that data, request account deletion or contact support (see section 11).
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Disconnect calendar or disable email sending</h3>
                        <p className="text-gray-700 leading-relaxed mb-2">
                          Within PilotBeta settings you can:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                          <li>Disconnect calendar sync (which prevents future calendar reads and writes).</li>
                          <li>Disable the feature that sends email on your behalf (PilotBeta will stop sending messages from your account).</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Data access, correction, and deletion</h3>
                        <p className="text-gray-700 leading-relaxed">
                          You may request access to, correction of, or deletion of your personal data. To request these rights, contact us at the address below. We will respond in accordance with applicable law.
                        </p>
                      </div>
                    </div>
                  }
                />

                <PolicySection 
                  id="cookies"
                  title="8. Cookies and Tracking"
                  content={
                    <p className="text-gray-700 leading-relaxed">
                      We use cookies and similar technologies for functionality, analytics, performance, and security. You can control cookies via your browser settings. Note that some features of the Services may not function properly if cookies are disabled.
                    </p>
                  }
                />

                <PolicySection 
                  id="transfers"
                  title="9. International Data Transfers"
                  content={
                    <p className="text-gray-700 leading-relaxed">
                      Your data may be stored and processed in countries outside your country of residence. Where applicable, we rely on appropriate safeguards such as Standard Contractual Clauses, adequacy decisions, or other lawful mechanisms to protect personal data transferred internationally.
                    </p>
                  }
                />

                <PolicySection 
                  id="children"
                  title="10. Children's Privacy"
                  content={
                    <p className="text-gray-700 leading-relaxed">
                      The Services are not directed to children under the age of 13 (or under the applicable higher minimum age in certain jurisdictions). We do not knowingly collect personal information from children. If we learn that a child under the applicable minimum age has provided personal data, we will take steps to delete such data.
                    </p>
                  }
                />

                <PolicySection 
                  id="changes"
                  title="11. Changes to this Privacy Policy"
                  content={
                    <p className="text-gray-700 leading-relaxed">
                      We may update this Privacy Policy from time to time. When we make material changes, we will post the updated policy at https://pilotbeta.com/privacy-policy and update the Effective Date above. Continued use of the Services after changes indicates acceptance of the revised Policy.
                    </p>
                  }
                />

                <PolicySection 
                  id="contact"
                  title="12. Contact Us"
                  content={
                    <div>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        If you have questions, requests, or concerns about this policy or our data practices, contact us at:
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-900">PilotBeta Support</p>
                        <p className="text-gray-700">Email: support@pilotbeta.com</p>
                        <p className="text-gray-700">Address: PilotBeta.com, Bangalore</p>
                      </div>
                      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> This Privacy Policy is intended to provide simple, clear information about PilotBeta's data practices. It does not create a contract or modify any existing agreement between you and PilotBeta. This document is provided for informational purposes and should be reviewed by your legal counsel to ensure compliance with applicable laws (including GDPR, CCPA, and other data protection laws relevant to your users).
                        </p>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;