
import 'dotenv/config';
import { createCustomer } from '../customerService.js'; // is this correct path? 


// Mock Supabase auth
const mockUser = { id: 'user-123' };
const mockAuth = {
  getUser: async () => ({ data: { user: mockUser } })
};

// Inject mock into supabase
// import { supabase } from '../../lib/supabase.js';
// supabase.auth = mockAuth;

//import { supabase } from '../lib/supabase.js';
import { supabase } from '../../lib/supabase.js';

// ✅ Mock Supabase Auth
supabase.auth = {
  getUser: async () => ({
    data: {
      user: {
        id: 'Demo Credentials',
        email: 'admin@betapilot.com'
      }
    }
  }),
  getSession: async () => ({
    data: {
      session: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockPayload.mockSignature'
      }
    }
  })
};

// ✅ Mock Supabase.from() for customers and organizations
supabase.from = (table) => {
  if (table === 'organizations') {
    return {
      select: () => ({
        ilike: () => ({
          single: async () => ({
            data: null, // simulate org not found
            error: null
          })
        })
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: {
              id: 'org-new',
              name: 'Acme Corp',
              industry: 'Tech'
            },
            error: null
          })
        })
      })
    };
  }

  if (table === 'customers') {
    return {
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: {
              id: 'cust-123',
              first_name: 'Alice',
              last_name: 'Johnson',
              email: 'alice@example.com',
              organization: {
                id: 'org-new',
                name: 'Acme Corp',
                industry: 'Tech'
              }
            },
            error: null
          })
        })
      })
    };
  }

  if (table === 'customer_segments') {
    return {
      insert: async () => ({
        error: null
      })
    };
  }

  return {};
};



// Test cases
const testCases = [
  {
    name: '✅ Valid customer',
    input: {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      organization: 'Acme Corp',
      jobTitle: 'Product Manager',
      segments: ['Enterprise', 'Beta Tester']
    },
    expectError: false
  },
  {
    name: '❌ Missing first name',
    input: {
      lastName: 'Smith',
      email: 'smith@example.com',
      organization: 'Acme Corp'
    },
    expectError: true
  },
  {
    name: '❌ Whitespace-only email',
    input: {
      firstName: 'Bob',
      lastName: 'Smith',
      email: '   ',
      organization: 'Acme Corp'
    },
    expectError: true
  },
  {
    name: '✅ Minimal valid input',
    input: {
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie@beta.com',
      organization: 'Beta Inc'
    },
    expectError: false
  }
];

// Run tests
(async () => {
  for (const test of testCases) {
    try {
      const result = await createCustomer(test.input);
      const passed = test.expectError ? !!result.error : !result.error;
      console.log(`${test.name}: ${passed ? '✅ Passed' : '❌ Failed'}`);
      if (result.error) console.warn('Error:', result.error);
    } catch (err) {
      console.error(`${test.name}: ❌ Exception`, err.message);
    }
  }
})();
