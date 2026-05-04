import LegalContent from '@/components/sections/LegalContent';

export const metadata = {
  title: 'Terms & Conditions - AdSky Solution',
  description: 'Read the terms and conditions governing the use of AdSky Solution services and website.',
};

export default function TermsAndConditions() {
  const sections = [
    {
      title: 'Use of Services',
      content: [
        'By accessing the AdSky Solution website or engaging our services, you agree to comply with these Terms & Conditions. Our services are intended for professional and legal business use only.',
        'Clients must provide accurate and complete information during project discovery and throughout the service lifecycle. Any misuse of our platform or services for illegal activities is strictly prohibited.',
      ],
    },
    {
      title: 'User Responsibilities',
      content: [
        'As a client or user of our services, you are responsible for:',
        {
          type: 'list',
          items: [
            'Maintaining the confidentiality of any account credentials provided.',
            'Ensuring that all content provided for development (images, text, logos) is owned by you or used with permission.',
            'Reviewing and approving project milestones in a timely manner to avoid development delays.',
          ],
        },
      ],
    },
    {
      title: 'Intellectual Property',
      content: [
        'AdSky Solution retains all rights to any proprietary tools, frameworks, or pre-existing code used in your project.',
        'Upon full and final payment, the client is granted ownership of the specific custom deliverables (website code, application assets, designs) created for their project.',
        'Unauthorized reproduction or redistribution of AdSky Solution’s own website content, branding, or marketing materials is strictly prohibited.',
      ],
    },
    {
      title: 'Service Limitations',
      content: [
        'While we strive for technical perfection, AdSky Solution does not guarantee that services will be 100% error-free or uninterrupted. We are not responsible for downtime caused by third-party hosting providers, internet service disruptions, or browser compatibility issues with deprecated technologies.',
      ],
    },
    {
      title: 'Liability Disclaimer',
      content: [
        'AdSky Solution and its affiliates shall not be liable for any indirect, incidental, or consequential damages, including loss of profits, data, or business opportunities, arising from the use of our services.',
        'Our total liability for any claim related to our services is limited to the amount paid by the client for the specific project or service in question.',
      ],
    },
    {
      title: 'Termination Rights',
      content: [
        'Either party may terminate a service agreement with a 30-day written notice. In the event of termination, the client is responsible for paying for all work completed up to the termination date.',
        'AdSky Solution reserves the right to suspend or terminate services immediately if the client violates these terms or fails to meet payment obligations.',
      ],
    },
    {
      title: 'Governing Law',
      content: [
        'These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in India (Mumbai/Delhi).',
      ],
    },
  ];

  return (
    <LegalContent
      title="Terms & Conditions"
      lastUpdated="May 2026"
      sections={sections}
    />
  );
}
