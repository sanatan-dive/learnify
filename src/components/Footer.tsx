import React, { JSX, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Footer(): JSX.Element {
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
        <div 
          className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg shadow-xl"
          style={{ backgroundColor: '#121835', border: '1px solid #1A1F3C' }}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#1A1F3C' }}>
            <h2 style={{ color: '#E0F2FF' }} className="text-xl font-bold">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const PrivacyPolicyContent: React.FC = () => (
    <div style={{ color: '#C0C0C0' }} className="space-y-4 text-sm leading-relaxed">
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">Information We Collect</h3>
        <p>We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support. This may include your name, email address, and any other information you choose to provide.</p>
      </div>
      
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">How We Use Your Information</h3>
        <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers.</p>
      </div>
      
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">Information Sharing</h3>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this privacy policy or as required by law.</p>
      </div>
      
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">Data Security</h3>
        <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
      </div>
      
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">Cookies and Tracking</h3>
        <p>We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences.</p>
      </div>
      
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">Your Rights</h3>
        <p>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.</p>
      </div>
      
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, please contact us at sanatansharma352@gmail.com.</p>
      </div>
      
      <p className="text-xs" style={{ color: '#A0A0A0' }}>
        Last updated: January 2025
      </p>
    </div>
  );

  const TermsOfServiceContent: React.FC = () => (
    <div style={{ color: '#C0C0C0' }} className="space-y-4 text-sm leading-relaxed">
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">Acceptance of Terms</h3>
        <p>By accessing and using LearnifyHQ, you accept and agree to be bound by the terms and provision of this agreement.</p>
      </div>
      
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">Use License</h3>
        <p>Permission is granted to temporarily download one copy of LearnifyHQ materials for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
      </div>
      
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">User Account</h3>
        <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities under your account.</p>
      </div>
      
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">Prohibited Uses</h3>
        <p>You may not use our service for any illegal or unauthorized purpose, to violate any laws, to transmit harmful code, or to interfere with the security of the service.</p>
      </div>
      
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">Content</h3>
        <p>Our service allows you to post, link, store, share and otherwise make available certain information. You are responsible for the content that you post and you retain any intellectual property rights that you may have in that content.</p>
      </div>
      
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">Termination</h3>
        <p>We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms of Service.</p>
      </div>
      
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">Limitation of Liability</h3>
        <p>In no event shall LearnifyHQ, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
      </div>
      
      <div>
        <h3 style={{ color: '#E0F2FF' }} className="font-semibold mb-2">Changes to Terms</h3>
        <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>
      </div>
      
      <p className="text-xs" style={{ color: '#A0A0A0' }}>
        Last updated: January 2025
      </p>
    </div>
  );

  return (
    <>
      <footer style={{ backgroundColor: '#0A0F2C' }} className="py-8 px-6 border-t border-gray-700">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            
            {/* Brand/Logo Section */}
            <div className="text-center md:text-left">
              <h3 style={{ color: '#E0F2FF' }} className="text-2xl font-bold mb-2">
                LearnifyHQ
              </h3>
              <p style={{ color: '#A0A0A0' }} className="text-sm">
                Empowering learning through technology
              </p>
            </div>

            {/* Social Media Section */}
            <div className="flex items-center space-x-4">
              <span style={{ color: '#C0C0C0' }} className="text-sm mr-2">
                Follow us:
              </span>
              <a
                href="https://twitter.com/learnifyHQ"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 hover:scale-110"
                style={{ 
                  backgroundColor: '#121835',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #1A1F3C'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  (e.target as HTMLAnchorElement).style.backgroundColor = '#1A1F3C';
                  (e.target as HTMLAnchorElement).style.borderColor = '#4F7DFB';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  (e.target as HTMLAnchorElement).style.backgroundColor = '#121835';
                  (e.target as HTMLAnchorElement).style.borderColor = '#1A1F3C';
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="#FFFFFF"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: '#1A1F3C' }}>
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p style={{ color: '#A0A0A0' }} className="text-sm">
                © 2025 LearnifyHQ. All rights reserved.
              </p>
              
              {/* Footer Links */}
              <div className="flex space-x-6">
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  style={{ color: '#C0C0C0' }}
                  className="text-sm hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setShowTermsModal(true)}
                  style={{ color: '#C0C0C0' }}
                  className="text-sm hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  Terms of Service
                </button>
                <a
                  href="mailto:sanatansharma352@gmail.com"
                  style={{ color: '#C0C0C0' }}
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
      >
        <PrivacyPolicyContent />
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms of Service"
      >
        <TermsOfServiceContent />
      </Modal>
    </>
  );
}

export default Footer;