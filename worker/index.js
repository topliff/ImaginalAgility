import { AwsClient } from 'aws4fetch';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/debug' && request.method === 'GET') {
      return handleDebug(env);
    }

    if (request.method === 'POST' && url.pathname === '/pilot') {
      return handleForm(request, env, ctx, 'pilot');
    }
    if (request.method === 'POST' && url.pathname === '/contact') {
      return handleForm(request, env, ctx, 'contact');
    }
    if (request.method === 'POST' && url.pathname === '/book') {
      return handleForm(request, env, ctx, 'book');
    }

    return new Response('Not found', { status: 404, headers: CORS_HEADERS });
  },
};

async function handleForm(request, env, ctx, formType) {
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ status: 'error', message: 'Invalid JSON' }, { status: 400, headers: CORS_HEADERS });
  }

  if (!data.email || !data.email.includes('@')) {
    return Response.json({ status: 'error', message: 'Valid email required' }, { status: 400, headers: CORS_HEADERS });
  }

  const payload = { ...data, formType };

  ctx.waitUntil(
    Promise.allSettled([
      sendSesNotification(env, formType, payload),
      forwardToAppsScript(env, payload),
    ]).then((results) => {
      const names = ['ses', 'appsScript'];
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`${names[i]} failed:`, r.reason?.message || String(r.reason));
        } else {
          console.log(`${names[i]} ok`);
        }
      });
    })
  );

  return Response.json({ status: 'success' }, { headers: CORS_HEADERS });
}

async function forwardToAppsScript(env, payload) {
  if (!env.APPS_SCRIPT_URL) {
    throw new Error('APPS_SCRIPT_URL not set');
  }
  const res = await fetch(env.APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`Apps Script ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

async function sendSesNotification(env, formType, payload) {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not set');
  }

  const region = env.AWS_REGION || 'us-west-2';
  const fromName = env.FROM_NAME || 'Heliotrope Imaginal';
  const fromEmail = env.FROM_EMAIL || 'noreply@imaginalmail.com';
  const toList = (env.TO_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (toList.length === 0) throw new Error('TO_EMAILS not set');

  const { subject, text } = buildEmail(formType, payload);

  const body = {
    FromEmailAddress: `${fromName} <${fromEmail}>`,
    Destination: { ToAddresses: toList },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Text: { Data: text, Charset: 'UTF-8' } },
      },
    },
  };
  if (payload.email) body.ReplyToAddresses = [payload.email];

  const aws = new AwsClient({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    service: 'ses',
    region,
  });

  const res = await aws.fetch(`https://email.${region}.amazonaws.com/v2/email/outbound-emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`SES ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

function buildEmail(formType, data) {
  const lines = [];
  const push = (label, val) => {
    if (val != null && String(val).trim() !== '') lines.push(`${label}: ${val}`);
  };

  if (formType === 'contact') {
    push('Name', data.name);
    push('Email', data.email);
    push('Subject', data.subject);
    push('Origin', data.origin);
    lines.push('');
    lines.push('Message:');
    lines.push(data.message || '');
    return {
      subject: `New IA Contact: ${data.subject || '(no subject)'}`,
      text: lines.join('\n'),
    };
  }

  if (formType === 'book') {
    push('First Name', data.firstName);
    push('Last Name', data.lastName);
    push('Email', data.email);
    push('Organisation', data.organisation);
    push('Interests', data.interests);
    push('Origin', data.origin);
    return {
      subject: `New Book Reservation: ${data.firstName || ''} ${data.lastName || data.email}`,
      text: lines.join('\n'),
    };
  }

  // pilot
  push('Full Name', data.fullName);
  push('Email', data.email);
  push('Organisation', data.organisation);
  push('Role', data.role);
  push('Country', data.country);
  push('Pilot Type', data.pilotType);
  push('Origin', data.origin);
  if (data.whatDraws) {
    lines.push('');
    lines.push('What draws you:');
    lines.push(data.whatDraws);
  }
  if (data.videoStandout) {
    lines.push('');
    lines.push('Video standout:');
    lines.push(data.videoStandout);
  }
  return {
    subject: `New IA Pilot Signup: ${data.fullName || data.email}`,
    text: lines.join('\n'),
  };
}

async function handleDebug(env) {
  const results = {
    hasAwsKey: !!env.AWS_ACCESS_KEY_ID,
    hasAwsSecret: !!env.AWS_SECRET_ACCESS_KEY,
    awsKeyPrefix: env.AWS_ACCESS_KEY_ID ? env.AWS_ACCESS_KEY_ID.slice(0, 4) + '...' : 'NOT SET',
    region: env.AWS_REGION || 'us-west-2',
    fromEmail: env.FROM_EMAIL || 'noreply@imaginalmail.com',
    fromName: env.FROM_NAME || 'Heliotrope Imaginal',
    toEmails: env.TO_EMAILS || 'NOT SET',
    hasAppsScriptUrl: !!env.APPS_SCRIPT_URL,
    sesIdentityTest: null,
  };

  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
    try {
      const aws = new AwsClient({
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        service: 'ses',
        region: env.AWS_REGION || 'us-west-2',
      });
      const res = await aws.fetch(
        `https://email.${env.AWS_REGION || 'us-west-2'}.amazonaws.com/v2/email/account`,
        { method: 'GET' }
      );
      const body = await res.text();
      results.sesIdentityTest = {
        status: res.status,
        ok: res.ok,
        body: body.slice(0, 400),
      };
    } catch (e) {
      results.sesIdentityTest = { error: e.message };
    }
  }

  return Response.json(results, { headers: CORS_HEADERS });
}
