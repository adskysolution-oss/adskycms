import LegalContent from '@/components/sections/LegalContent';

export const metadata = {
  title: 'Privacy Policy - AdSky Solution',
  description: 'Learn how AdSky Solution collects, uses, and protects your personal information.',
};

export default function PrivacyPolicy() {
  const sections = [
    {
      title: 'Information We Collect',
      content: [
        'At AdSky Solution, we collect information to provide better services to our users. The types of personal information we collect include:',
        {
          type: 'list',
          items: [
            'Personal Identification: Name, email address, phone number, and physical address.',
            'Professional Information: Resumes, work history, and skills (primarily for recruitment and hiring services).',
            'Usage Data: IP addresses, browser types, and device information collected through cookies and analytics tools.',
            'Communication: Records of your interactions with our support and sales teams.',
          ],
        },
      ],
    },
    {
      title: 'How We Use Your Data',
      content: [
        'The information we collect is used for various professional purposes:',
        {
          type: 'list',
          items: [
            'Service Delivery: To provide IT development, consulting, and recruitment services.',
            'Personalization: To tailor our website content and service offerings to your needs.',
            'Communication: To send project updates, newsletters, and respond to inquiries.',
            'Hiring Processes: To evaluate candidates for internal roles or for our vendor network.',
            'Improvement: To analyze website performance and enhance user experience.',
          ],
        },
      ],
    },
    {
      title: 'Data Protection & Security',
      content: [
        'We prioritize the security of your data. AdSky Solution implements industry-standard technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.',
        'We use secure servers and encryption protocols (SSL/TLS) for data transmission. Access to personal data is restricted to authorized employees and vendors who need the information to perform their duties.',
      ],
    },
    {
      title: 'Third-Party Services',
      content: [
        'We may share your information with trusted third-party service providers to facilitate our operations:',
        {
          type: 'list',
          items: [
            'Cloudinary: For secure storage and delivery of media assets.',
            'Google Analytics: To understand how visitors engage with our website.',
            'Email Service Providers: To manage our professional communications.',
          ],
        },
        'These third parties are prohibited from using your personal information for any other purpose and are required to maintain its confidentiality.',
      ],
    },
    {
      title: 'Cookies Usage',
      content: [
        'Our website uses cookies to enhance your browsing experience. Cookies are small files stored on your device that help us remember your preferences and analyze traffic patterns.',
        'You can choose to disable cookies through your browser settings, though this may affect the functionality of certain parts of our website.',
      ],
    },
    {
      title: 'User Rights',
      content: [
        'Under applicable data protection laws, you have the following rights:',
        {
          type: 'list',
          items: [
            'Right to Access: Request a copy of the personal data we hold about you.',
            'Right to Rectification: Ask us to correct inaccurate or incomplete information.',
            'Right to Erasure: Request the deletion of your data under certain conditions.',
            'Right to Object: Object to the processing of your data for marketing purposes.',
          ],
        },
      ],
    },
  ];

  return (
    <LegalContent
      title="Privacy Policy"
      lastUpdated="May 2026"
      sections={sections}
    />
  );
}
