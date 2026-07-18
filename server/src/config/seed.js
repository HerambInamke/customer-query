import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User from '../models/User.js';
import CustomerQuery from '../models/CustomerQuery.js';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in .env');
  process.exit(1);
}

const usersData = [
  {
    name: 'Admin User',
    email: 'admin@cqms.com',
    password: 'Admin@1234',
    role: 'Admin',
    isActive: true,
  },
  {
    name: 'Sarah Mitchell',
    email: 'sarah@cqms.com',
    password: 'Support@1234',
    role: 'Support',
    isActive: true,
  },
  {
    name: 'James Carter',
    email: 'james@cqms.com',
    password: 'Support@1234',
    role: 'Support',
    isActive: true,
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily@cqms.com',
    password: 'Support@1234',
    role: 'Support',
    isActive: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'User@1234',
    role: 'User',
    isActive: true,
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'User@1234',
    role: 'User',
    isActive: true,
  },
];

const queryTemplates = [
  
  {
    customerName: 'Michael Thompson',
    customerEmail: 'michael.t@company.com',
    customerPhone: '+1-555-0101',
    subject: 'Unable to login to the portal after password reset',
    description:
      'I reset my password yesterday using the forgot password link but I am still unable to log in. The system keeps saying invalid credentials even though I am using the new password. I have tried clearing browser cache and using incognito mode but the issue persists.',
    status: 'Open',
    priority: 'High',
    category: 'Technical',
    tags: ['login', 'password', 'portal'],
  },
  {
    customerName: 'Linda Chen',
    customerEmail: 'linda.chen@techcorp.io',
    customerPhone: '+1-555-0102',
    subject: 'Dashboard loading very slow — taking over 30 seconds',
    description:
      'Since the last update rolled out on Monday, the dashboard takes more than 30 seconds to load. This is severely impacting our team productivity. We have checked our internet connection and it is fine. Other pages load normally.',
    status: 'In Progress',
    priority: 'Urgent',
    category: 'Technical',
    tags: ['performance', 'dashboard', 'slow'],
  },
  {
    customerName: 'David Park',
    customerEmail: 'd.park@startup.com',
    customerPhone: '+1-555-0103',
    subject: 'API integration returning 500 error on bulk upload',
    description:
      'We are using your REST API to bulk upload customer records. The endpoint was working fine until last week. Now it consistently returns a 500 Internal Server Error when we send more than 50 records in a single request. Single record uploads work fine.',
    status: 'Open',
    priority: 'Urgent',
    category: 'Technical',
    tags: ['api', 'bulk-upload', '500-error'],
  },
  {
    customerName: 'Rachel Green',
    customerEmail: 'rachel.g@business.net',
    customerPhone: '+1-555-0104',
    subject: 'Mobile app crashes on iOS 17.2 when opening notifications',
    description:
      'After updating to iOS 17.2, the mobile app crashes every time I tap on a push notification. The app works fine when opened directly. This started happening after the iOS update and affects multiple devices in our team.',
    status: 'Resolved',
    priority: 'High',
    category: 'Technical',
    tags: ['mobile', 'ios', 'crash', 'notifications'],
  },
  {
    customerName: 'Steven Walsh',
    customerEmail: 's.walsh@enterprise.com',
    customerPhone: '+1-555-0105',
    subject: 'Two-factor authentication codes not being received',
    description:
      'Our team members are not receiving the 2FA SMS codes. This started about 2 days ago. We have verified the phone numbers are correct in the system. Some users receive the code occasionally but most do not. This is blocking our team from accessing the system.',
    status: 'In Progress',
    priority: 'Urgent',
    category: 'Technical',
    tags: ['2fa', 'sms', 'authentication'],
  },

  {
    customerName: 'Amanda Foster',
    customerEmail: 'amanda.f@retail.com',
    customerPhone: '+1-555-0201',
    subject: 'Charged twice for the same invoice this month',
    description:
      'I noticed two identical charges of $299 on my credit card statement dated the 5th and 6th of this month. Both reference the same invoice number INV-2024-0892. I need a refund for the duplicate charge as soon as possible.',
    status: 'Open',
    priority: 'High',
    category: 'Billing',
    tags: ['duplicate-charge', 'refund', 'invoice'],
  },
  {
    customerName: 'Robert Kim',
    customerEmail: 'r.kim@finance.org',
    customerPhone: '+1-555-0202',
    subject: 'Request for invoice for Q3 annual subscription',
    description:
      'We need a formal invoice for our Q3 subscription payment for our accounting records. The payment of $1,200 was processed on September 1st but we have not received the official invoice via email. Please send it to our billing department.',
    status: 'Resolved',
    priority: 'Low',
    category: 'Billing',
    tags: ['invoice', 'subscription', 'accounting'],
  },
  {
    customerName: 'Patricia Nguyen',
    customerEmail: 'p.nguyen@consulting.com',
    customerPhone: '+1-555-0203',
    subject: 'Subscription upgrade not reflecting correct pricing',
    description:
      'I upgraded from the Basic to the Professional plan last Tuesday. While my account shows the Professional features, I am still being charged the Basic plan price. The correct price for Professional should be $149/month not $49/month.',
    status: 'In Progress',
    priority: 'Medium',
    category: 'Billing',
    tags: ['upgrade', 'pricing', 'subscription'],
  },
  {
    customerName: 'Carlos Martinez',
    customerEmail: 'c.martinez@agency.co',
    customerPhone: '+1-555-0204',
    subject: 'Cannot update payment method — card form not working',
    description:
      'I am trying to update our company credit card as the current one expires next month. When I go to the billing settings and try to add a new card, the form does not submit. I have tried Chrome, Firefox, and Safari. The button just spins indefinitely.',
    status: 'Open',
    priority: 'High',
    category: 'Billing',
    tags: ['payment', 'card', 'billing-settings'],
  },

  {
    customerName: 'Jennifer Adams',
    customerEmail: 'j.adams@prospect.com',
    customerPhone: '+1-555-0301',
    subject: 'Requesting pricing for enterprise plan with 500 users',
    description:
      'We are evaluating your platform for our organization of approximately 500 users. Could you please provide enterprise pricing, volume discounts, and information about dedicated support options? We are also interested in custom onboarding and SSO integration.',
    status: 'Open',
    priority: 'High',
    category: 'Sales',
    tags: ['enterprise', 'pricing', 'sso'],
  },
  {
    customerName: 'Thomas Baker',
    customerEmail: 't.baker@newclient.com',
    customerPhone: '+1-555-0302',
    subject: 'Interested in annual plan — need comparison with monthly',
    description:
      'We are currently on the monthly Professional plan. Can you send me a comparison between monthly and annual billing options? We would like to understand the savings and whether there are any additional benefits with the annual commitment.',
    status: 'Resolved',
    priority: 'Medium',
    category: 'Sales',
    tags: ['annual-plan', 'pricing', 'comparison'],
  },
  {
    customerName: 'Nancy Wilson',
    customerEmail: 'n.wilson@partner.net',
    customerPhone: '+1-555-0303',
    subject: 'Partnership and reseller program inquiry',
    description:
      'Our company is a managed service provider serving over 200 SMB clients. We are interested in your reseller or partner program. Could you provide information on the partnership tiers, commission structure, and any co-marketing opportunities?',
    status: 'In Progress',
    priority: 'Medium',
    category: 'Sales',
    tags: ['partnership', 'reseller', 'msp'],
  },

  {
    customerName: 'George Harrison',
    customerEmail: 'g.harrison@customer.com',
    customerPhone: '+1-555-0401',
    subject: 'Support team unresponsive for 5 days — critical issue unresolved',
    description:
      'I submitted a critical ticket 5 days ago about data export failure and have not received any meaningful response. I have sent 3 follow-up emails. This issue is blocking our monthly reporting. The lack of response is completely unacceptable for a paid enterprise customer.',
    status: 'Open',
    priority: 'Urgent',
    category: 'Complaint',
    tags: ['unresponsive', 'escalation', 'data-export'],
  },
  {
    customerName: 'Susan Clark',
    customerEmail: 's.clark@unhappy.com',
    customerPhone: '+1-555-0402',
    subject: 'Data was lost after system migration last weekend',
    description:
      'Following the scheduled maintenance last Saturday, approximately 3 weeks of customer records appear to be missing from our account. We had over 450 records that are now gone. We need immediate data recovery. This is a serious data integrity issue.',
    status: 'In Progress',
    priority: 'Urgent',
    category: 'Complaint',
    tags: ['data-loss', 'migration', 'data-recovery'],
  },
  {
    customerName: 'Kevin Wright',
    customerEmail: 'k.wright@frustrated.io',
    customerPhone: '+1-555-0403',
    subject: 'Feature that was working was removed without notice',
    description:
      'The CSV bulk import feature that our team relies on daily was removed in the last update with no prior notice or alternative provided. This has completely disrupted our workflow. We need this feature restored or an equivalent solution immediately.',
    status: 'Closed',
    priority: 'High',
    category: 'Complaint',
    tags: ['feature-removal', 'csv-import', 'workflow'],
  },

  {
    customerName: 'Helen Turner',
    customerEmail: 'h.turner@general.com',
    customerPhone: '+1-555-0501',
    subject: 'How to export data to CSV format?',
    description:
      'I would like to know how to export our customer query data to a CSV file. I have looked through the documentation but cannot find clear instructions. We need to export monthly reports for our management team.',
    status: 'Resolved',
    priority: 'Low',
    category: 'General',
    tags: ['export', 'csv', 'how-to'],
  },
  {
    customerName: 'Frank Scott',
    customerEmail: 'f.scott@question.com',
    customerPhone: '+1-555-0502',
    subject: 'Can multiple admins manage the same account?',
    description:
      'We are onboarding a new operations manager who needs admin access to our account. Can we have multiple admin users on a single account? If yes, how do we add them and what are the permission differences between admin and regular users?',
    status: 'Resolved',
    priority: 'Low',
    category: 'General',
    tags: ['multi-admin', 'permissions', 'onboarding'],
  },
  {
    customerName: 'Dorothy Lewis',
    customerEmail: 'd.lewis@info.com',
    customerPhone: '+1-555-0503',
    subject: 'Request for product roadmap and upcoming features',
    description:
      'We are planning our IT strategy for next year and would like to know about your product roadmap. Specifically, we are interested in planned integrations with Salesforce and Slack, and any improvements to the reporting module.',
    status: 'Open',
    priority: 'Low',
    category: 'General',
    tags: ['roadmap', 'integrations', 'salesforce', 'slack'],
  },

  {
    customerName: 'Brian Moore',
    customerEmail: 'b.moore@tech.com',
    customerPhone: '+1-555-0601',
    subject: 'Webhook notifications not firing on status change',
    description:
      'We have configured webhooks to fire when a ticket status changes. They were working perfectly until 3 days ago. Now none of our configured webhooks are being triggered. We have verified the endpoint URLs are correct and accessible.',
    status: 'Open',
    priority: 'High',
    category: 'Technical',
    tags: ['webhooks', 'integration', 'notifications'],
  },
  {
    customerName: 'Alice Johnson',
    customerEmail: 'a.johnson@corp.com',
    customerPhone: '+1-555-0602',
    subject: 'Need to cancel subscription and get prorated refund',
    description:
      'We have decided to move to a different solution. I would like to cancel our current annual subscription effective immediately and receive a prorated refund for the remaining 8 months. Our account ID is ACC-78234.',
    status: 'In Progress',
    priority: 'Medium',
    category: 'Billing',
    tags: ['cancellation', 'refund', 'prorated'],
  },
  {
    customerName: 'Mark Davis',
    customerEmail: 'm.davis@startup.io',
    customerPhone: '+1-555-0603',
    subject: 'Bulk user import via CSV failing with validation errors',
    description:
      'I am trying to import 120 users using the CSV template provided. The system rejects the file with generic validation errors but does not specify which rows have issues. I have double-checked the format matches the template exactly.',
    status: 'Rejected',
    priority: 'Medium',
    category: 'Technical',
    tags: ['csv-import', 'users', 'validation'],
  },
  {
    customerName: 'Sandra Lee',
    customerEmail: 's.lee@media.com',
    customerPhone: '+1-555-0604',
    subject: 'Request to change account email address',
    description:
      'Our company rebranded and we have new email addresses. I need to change the primary account email from s.lee@oldmedia.com to s.lee@media.com. I cannot find this option in the account settings.',
    status: 'Resolved',
    priority: 'Low',
    category: 'General',
    tags: ['account', 'email-change', 'rebrand'],
  },
  {
    customerName: 'Paul Jackson',
    customerEmail: 'p.jackson@b2b.com',
    customerPhone: '+1-555-0605',
    subject: 'SSO configuration not working with Okta',
    description:
      'We are trying to set up Single Sign-On using Okta as our identity provider. We have followed the documentation step by step but keep getting a SAML assertion error. Our IT team has verified the Okta configuration. This is blocking all our 80 users from using SSO.',
    status: 'In Progress',
    priority: 'Urgent',
    category: 'Technical',
    tags: ['sso', 'okta', 'saml', 'authentication'],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.info('MongoDB connected for seeding...');

    await Promise.all([
      User.deleteMany({}),
      CustomerQuery.deleteMany({}),
    ]);
    console.info('Cleared existing data.');

    const createdUsers = await User.create(usersData);
    console.info(`Created ${createdUsers.length} users.`);

    const supportUsers = createdUsers.filter((u) => u.role === 'Support');
    const regularUsers = createdUsers.filter((u) => u.role === 'User');

    const queries = queryTemplates.map((template, index) => {
      const creator    = index % 2 === 0 ? regularUsers[0] : regularUsers[1];
      const assignedTo = template.status !== 'Open'
        ? supportUsers[index % supportUsers.length]._id
        : null;

      return {
        ...template,
        createdBy: creator._id,
        assignedTo,
      };
    });

    const createdQueries = await CustomerQuery.create(queries);
    console.info(`Created ${createdQueries.length} customer queries.`);

    console.info('\n──────────────────────────────────────');
    console.info('          SEED COMPLETED');
    console.info('──────────────────────────────────────');
    console.info('\nLogin credentials:\n');
    console.info('  Role    │ Email                │ Password');
    console.info('  ────────┼──────────────────────┼─────────────');
    console.info('  Admin   │ admin@cqms.com        │ Admin@1234');
    console.info('  Support │ sarah@cqms.com        │ Support@1234');
    console.info('  Support │ james@cqms.com        │ Support@1234');
    console.info('  Support │ emily@cqms.com        │ Support@1234');
    console.info('  User    │ john@example.com      │ User@1234');
    console.info('  User    │ jane@example.com      │ User@1234');
    console.info('\n──────────────────────────────────────\n');

  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.info('MongoDB disconnected.');
    process.exit(0);
  }
};

seed();
