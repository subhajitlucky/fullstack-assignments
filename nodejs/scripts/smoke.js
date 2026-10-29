import 'dotenv/config';

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;

let passed = 0;
let failed = 0;

function check(condition, message, extra) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${message}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${message}`);
    if (extra !== undefined) {
      console.error(`    ${JSON.stringify(extra)}`);
    }
  }
}

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {};

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return { status: response.status, body: payload };
}

async function main() {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  const emailA = `counselor.a.${stamp}@example.com`;
  const emailB = `counselor.b.${stamp}@example.com`;
  const password = 'Password123!';

  console.log(`\nSmoke testing ${BASE_URL}\n`);

  const health = await request('/health');
  check(health.status === 200, 'Health endpoint responds');

  console.log('\nAuth');
  const regA = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Counselor A', email: emailA, password },
  });
  check(regA.status === 201 && Boolean(regA.body?.data?.token), 'Register counselor A', regA);
  check(
    regA.body?.data?.employee && !('passwordHash' in regA.body.data.employee),
    'Password hash is never returned',
  );

  const regB = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Counselor B', email: emailB, password },
  });
  check(regB.status === 201 && Boolean(regB.body?.data?.token), 'Register counselor B', regB);

  const tokenA = regA.body?.data?.token;
  const tokenB = regB.body?.data?.token;
  const employeeAId = regA.body?.data?.employee?.id;
  const employeeBId = regB.body?.data?.employee?.id;

  const duplicate = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Counselor A', email: emailA, password },
  });
  check(duplicate.status === 409, 'Duplicate email is rejected with 409', duplicate);

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: { email: emailA, password },
  });
  check(login.status === 200 && Boolean(login.body?.data?.token), 'Login returns a JWT', login);

  const me = await request('/api/auth/me', { token: tokenA });
  check(
    me.status === 200 && me.body?.data?.employee?.email === emailA,
    'JWT resolves the current employee',
    me,
  );

  const badLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: emailA, password: 'WrongPassword!' },
  });
  check(badLogin.status === 401, 'Wrong password is rejected with 401', badLogin);

  console.log('\nPublic enquiry form');
  const created = await request('/api/enquiries', {
    method: 'POST',
    body: {
      name: 'Prospective Student',
      email: `student.${stamp}@example.com`,
      phone: '+919999999999',
      courseInterest: 'Full Stack Development',
      message: 'Please call me.',
    },
  });
  check(created.status === 201 && Boolean(created.body?.data?.id), 'Enquiry can be submitted without auth', created);
  check(created.body?.data?.claimedById === null, 'New enquiry starts unclaimed');

  const enquiryId = created.body?.data?.id;

  const unauthList = await request('/api/enquiries/unclaimed');
  check(unauthList.status === 401, 'Unclaimed list requires a JWT', unauthList);

  const unclaimedA = await request('/api/enquiries/unclaimed?limit=100', { token: tokenA });
  check(
    unclaimedA.status === 200 && unclaimedA.body?.data?.some((item) => item.id === enquiryId),
    'Counselor A sees the unclaimed lead',
  );

  const publicAlias = await request('/api/enquiries/public?limit=100', { token: tokenA });
  check(
    publicAlias.status === 200 && publicAlias.body?.data?.some((item) => item.id === enquiryId),
    '/public alias returns the same unclaimed pool',
  );

  const invalidForm = await request('/api/enquiries', {
    method: 'POST',
    body: { name: 'X', email: 'not-an-email', courseInterest: '' },
  });
  check(invalidForm.status === 400, 'Invalid public form data returns 400', invalidForm);

  console.log('\nConcurrent claim');
  const [claimA, claimB] = await Promise.all([
    request(`/api/enquiries/${enquiryId}/claim`, { method: 'POST', token: tokenA }),
    request(`/api/enquiries/${enquiryId}/claim`, { method: 'POST', token: tokenB }),
  ]);

  const statuses = [claimA.status, claimB.status].sort((a, b) => a - b);
  check(
    statuses[0] === 200 && statuses[1] === 409,
    'Exactly one concurrent claim wins (200 + 409)',
    { claimA, claimB },
  );

  const winnerIsA = claimA.status === 200;
  const winnerToken = winnerIsA ? tokenA : tokenB;
  const loserToken = winnerIsA ? tokenB : tokenA;
  const winnerLabel = winnerIsA ? 'A' : 'B';
  const winnerId = winnerIsA ? employeeAId : employeeBId;
  const claimedLead = winnerIsA ? claimA.body?.data : claimB.body?.data;

  check(
    claimedLead?.claimedById === winnerId,
    `Lead is assigned to counselor ${winnerLabel}`,
    claimedLead,
  );

  const afterUnclaimed = await request('/api/enquiries/unclaimed?limit=100', {
    token: loserToken,
  });
  check(
    afterUnclaimed.status === 200 &&
      !afterUnclaimed.body?.data?.some((item) => item.id === enquiryId),
    'Claimed lead disappears from the public pool',
  );

  const winnerMine = await request('/api/enquiries/my?limit=100', { token: winnerToken });
  check(
    winnerMine.status === 200 && winnerMine.body?.data?.some((item) => item.id === enquiryId),
    `Claimed lead appears in counselor ${winnerLabel}'s list`,
  );

  const loserMine = await request('/api/enquiries/my?limit=100', { token: loserToken });
  check(
    loserMine.status === 200 && !loserMine.body?.data?.some((item) => item.id === enquiryId),
    "Claimed lead is hidden from the other counselor's list",
  );

  const reClaim = await request(`/api/enquiries/${enquiryId}/claim`, {
    method: 'POST',
    token: loserToken,
  });
  check(reClaim.status === 409, 'Re-claiming a private lead returns 409', reClaim);

  const missingClaim = await request(
    '/api/enquiries/00000000-0000-4000-8000-000000000000/claim',
    { method: 'POST', token: tokenA },
  );
  check(missingClaim.status === 404, 'Claiming a missing lead returns 404', missingClaim);

  console.log('\nIdentity comes from the JWT');
  const secondCreated = await request('/api/enquiries', {
    method: 'POST',
    body: {
      name: 'Second Student',
      email: `student.second.${stamp}@example.com`,
      courseInterest: 'Data Science',
    },
  });
  check(secondCreated.status === 201, 'Create a second lead', secondCreated);

  const secondId = secondCreated.body?.data?.id;
  const injectedClaim = await request(`/api/enquiries/${secondId}/claim`, {
    method: 'POST',
    token: tokenB,
    body: { claimedById: employeeAId },
  });
  check(
    injectedClaim.status === 200 && injectedClaim.body?.data?.claimedById === employeeBId,
    'Claim ignores claimedById supplied in the request body',
    injectedClaim,
  );

  const injectedList = await request(
    `/api/enquiries/my?claimedById=${employeeAId}&limit=100`,
    { token: tokenB },
  );
  check(
    injectedList.status === 200 &&
      injectedList.body?.data?.every((item) => item.claimedById === employeeBId),
    '/my scopes results to the JWT employee, not query parameters',
    injectedList,
  );

  const badToken = await request('/api/enquiries/my', { token: 'not-a-real-token' });
  check(badToken.status === 401, 'Invalid JWT is rejected with 401', badToken);

  const invalidId = await request('/api/enquiries/not-a-uuid/claim', {
    method: 'POST',
    token: tokenA,
  });
  check(invalidId.status === 400, 'Malformed enquiry id returns 400', invalidId);

  console.log(`\nResult: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('\nSmoke test crashed:', error);
  process.exitCode = 1;
});
