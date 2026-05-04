import LegalContent from '@/components/sections/LegalContent';

export const metadata = {
  title: 'Refund Policy - AdSky Solution',
  description: 'Review our payment terms and refund eligibility for IT development and consulting services.',
};

export default function RefundPolicy() {
  const sections = [
    {
      title: 'Payment Terms',
      content: [
        'AdSky Solution follows a structured payment model to ensure transparency and commitment for both parties:',
        {
          type: 'list',
          items: [
            'Initial Advance: A 50% advance payment is required to initiate any IT development or consulting project.',
            'Milestone Payments: The remaining balance is typically divided based on project milestones (e.g., Design Approval, Beta Release, Final Handover).',
            'Full Payment: Final deliverables, including source code and deployment, are provided upon settlement of the full invoice amount.',
          ],
        },
      ],
    },
    {
      title: 'Refund Eligibility',
      content: [
        'We strive for excellence, but we understand that circumstances may change. Refund requests are evaluated based on the project stage:',
        {
          type: 'list',
          items: [
            'Before Kickoff: If a project is cancelled before any work has commenced, a 100% refund of the advance payment will be issued.',
            'During Design Phase: If cancelled after the initial requirement gathering but before design approval, a 50% refund of the advance may be applicable.',
            'Service Dissatisfaction: If we fail to deliver the agreed-upon scope as per the technical specification document, we will offer revisions or a partial refund based on the undelivered components.',
          ],
        },
      ],
    },
    {
      title: 'Non-Refundable Cases',
      content: [
        'Refunds will not be provided in the following scenarios:',
        {
          type: 'list',
          items: [
            'Completed Milestones: Payments for milestones that have been reviewed and approved by the client are non-refundable.',
            'Third-Party Costs: Expenses incurred for third-party licenses, server hosting, domain registration, or premium assets are non-refundable.',
            'Recruitment Services: Consulting fees for recruitment and bulk hiring are non-refundable once the candidate selection process has started.',
            'Client Delays: No refunds will be issued if project delays are caused by the client’s failure to provide necessary information or approvals.',
          ],
        },
      ],
    },
    {
      title: 'Service-Based Conditions',
      content: [
        'For recurring services such as AMC (Annual Maintenance Contracts) or ongoing business consulting, refund requests must be submitted at least 30 days prior to the next billing cycle. Refunds for the current billing period are not provided.',
      ],
    },
    {
      title: 'Refund Processing Timeline',
      content: [
        'Once a refund request is approved, it will be processed through the original payment method. Please allow 7 to 10 working days for the funds to reflect in your account, depending on your bank or payment gateway.',
      ],
    },
  ];

  return (
    <LegalContent
      title="Refund Policy"
      lastUpdated="May 2026"
      sections={sections}
    />
  );
}
