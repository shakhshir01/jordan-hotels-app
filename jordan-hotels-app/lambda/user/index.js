
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);
const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE || "Bookings";
const USERS_TABLE = process.env.USERS_TABLE || "Users";

const defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
};

const parseJwtClaims = (event) => {
  const auth = event?.headers?.authorization || event?.headers?.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
  console.log('Auth header:', auth.substring(0, 50) + '...');
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (e) {
    console.log('JWT parse error:', e.message);
    return null;
  }
};

async function handler(event) {
  console.log("Event:", JSON.stringify(event, null, 2));

  const method = event?.httpMethod || event?.requestContext?.http?.method || "GET";
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: "",
    };
  }

  try {
    const path = event.rawPath || event.path || "";
    const claims = event.requestContext?.authorizer?.claims || parseJwtClaims(event) || {};
    const userId = claims.sub || "anonymous";

    // GET /user/profile
    if (path === '/user/profile' && method === 'GET') {
      return await getUserProfile(userId, event);
    }

    // PUT /user/profile
    if (path === '/user/profile' && method === 'PUT') {
      return await updateUserProfile(userId, event);
    }

    // POST /user/mfa/email/setup
    if (path === '/user/mfa/email/setup' && method === 'POST') {
      return await setupEmailMfa(userId, event);
    }

    // POST /user/mfa/email/verify
    if (path === '/user/mfa/email/verify' && method === 'POST') {
      return await verifyEmailMfa(userId, event);
    }

    // POST /auth/email-mfa/request
    if (path === '/auth/email-mfa/request' && method === 'POST') {
      return await requestEmailMfaChallenge(userId, event);
    }

    // POST /user/mfa/disable
    if (path === '/user/mfa/disable' && method === 'POST') {
      return await disableMfa(userId, event);
    }

    // GET /user/bookings
    if (path === '/user/bookings' && method === 'GET') {
      return await getUserBookings(userId, event);
    }

    return {
      statusCode: 404,
      headers: defaultHeaders,
      body: JSON.stringify({ message: "Not found" })
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    };
  }
}

async function getUserProfile(userId, event) {
  try {
    let result = null;
    if (USERS_TABLE) {
      try {
        result = await docClient.send(
          new GetCommand({
            TableName: USERS_TABLE,
            Key: { userId },
          })
        );
      } catch (dbError) {
        console.warn("Database error in getUserProfile (falling back to claims):", dbError.message);
      }

      if (result && result.Item) {
        return {
          statusCode: 200,
          headers: defaultHeaders,
          body: JSON.stringify(result.Item),
        };
      }
    }

    // Fallback: derive from Cognito claims or mock
    const claims = event.requestContext?.authorizer?.claims || parseJwtClaims(event) || {};
    const email = claims.email || '';
    const name =
      claims.name ||
      [claims.given_name, claims.family_name].filter(Boolean).join(' ') ||
      '';

    const item = {
      userId,
      name,
      email,
      firstName: claims.given_name || name.split(' ')[0] || '',
      lastName: claims.family_name || name.split(' ').slice(1).join(' '),
      phone: claims.phone_number || '',
      location: '',
      joinedDate: '',
      membershipTier: '',
    };

    if (USERS_TABLE) {
      try {
        await docClient.send(
          new PutCommand({
            TableName: USERS_TABLE,
            Item: item,
          })
        );
      } catch (putErr) {
        console.warn("Failed to seed user profile into Users table:", putErr.message || putErr);
      }
    }

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ message: 'Failed to fetch profile' }),
    };
  }
}

async function updateUserProfile(userId, event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};

    const firstName = body.firstName || body.given_name || body.name?.split(' ')[0] || 'Guest';
    const lastName = body.lastName || body.family_name || body.name?.split(' ').slice(1).join(' ') || '';
    const email = body.email || '';
    const phone = body.phone || '';

    const item = {
      userId,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      location: body.location || '',
      joinedDate: body.joinedDate || '',
      membershipTier: body.membershipTier || '',
      // preserve MFA fields if provided
      mfaEnabled: body.mfaEnabled === undefined ? (body.mfaEnabled) : body.mfaEnabled,
      mfaMethod: body.mfaMethod || undefined,
      mfaSecondaryEmail: body.mfaSecondaryEmail || undefined,
    };

    if (USERS_TABLE) {
      await docClient.send(
        new PutCommand({
          TableName: USERS_TABLE,
          Item: item,
        })
      );
    }

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ message: "Failed to update profile" }),
    };
  }
}

async function getUserBookings(userId, event) {
  try {
    // Query Bookings table for user's bookings
    const params = {
      TableName: BOOKINGS_TABLE,
      IndexName: 'UserIdIndex', // assuming you have this index
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };

    const result = await docClient.send(new QueryCommand(params));

    const bookings = (result.Items || []).filter((b) => String(b?.status || '').toLowerCase() !== 'cancelled');

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify({
        bookings,
        count: result.Count || 0
      })
    };
  } catch (error) {
    console.error("Error fetching user bookings:", error);

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify({ bookings: [], count: 0 }),
    };
  }
}

// Helpers for email MFA
function generateNumericCode(digits = 6) {
  const max = 10 ** digits;
  const n = Math.floor(Math.random() * (max - 1)) + 1;
  return String(n).padStart(digits, '0');
}

async function sendEmail(toAddress, subject, textBody, htmlBody) {
  const from = process.env.SES_FROM_EMAIL || process.env.SENDER_EMAIL || `no-reply@${process.env.DOMAIN || 'visit-jo.com'}`;
  const params = {
    Destination: { ToAddresses: [toAddress] },
    Message: {
      Body: {
        Text: { Data: textBody || '' },
        Html: { Data: htmlBody || textBody || '' },
      },
      Subject: { Data: subject || 'VisitJO verification' },
    },
    Source: from,
  };
  try {
    await ses.send(new SendEmailCommand(params));
    return true;
  } catch (e) {
    console.error('SES send error:', e);
    return false;
  }
}

async function setupEmailMfa(userId, event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const secondaryEmail = String(body.secondaryEmail || body.email || '').trim();
    if (!secondaryEmail) {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'secondaryEmail required' }) };
    }

    // Prevent using the same address that's already registered to the user
    let existingItem = {};
    if (USERS_TABLE) {
      const found = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { userId } }));
      existingItem = found?.Item || {};
    }
    const registeredEmail = String(existingItem.email || '').trim().toLowerCase();
    if (registeredEmail && registeredEmail === secondaryEmail.toLowerCase()) {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'Secondary email must be different from the primary account email' }) };
    }

    const code = generateNumericCode(6);
    const expiresAt = Date.now() + 1000 * 60 * 15; // 15 minutes

    // update user item with pending MFA fields
    if (USERS_TABLE) {
      const existing = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { userId } }));
      const item = existing?.Item || { userId };
      item.mfaPendingEmail = secondaryEmail;
      item.mfaPendingCode = code;
      item.mfaPendingExpires = expiresAt;
      item.mfaMethodPending = 'EMAIL';
      await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: item }));
    }

    // send email (best-effort)
    const sent = await sendEmail(
      secondaryEmail,
      'VisitJO verification code',
      `Your VisitJO verification code is: ${code}`,
      `<p>Your VisitJO verification code is: <strong>${code}</strong></p>`
    );

    return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ sent: !!sent }) };
  } catch (error) {
    console.error('setupEmailMfa error', error);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Failed to setup email MFA' }) };
  }
}

async function verifyEmailMfa(userId, event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const code = String(body.code || body.token || '').trim();
    if (!code) return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'code required' }) };

    if (!USERS_TABLE) return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Users table not configured' }) };

    const result = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { userId } }));
    const item = result?.Item || {};
    const pendingCode = String(item.mfaPendingCode || '');
    const expires = Number(item.mfaPendingExpires || 0);
    const pendingEmail = item.mfaPendingEmail;

    if (!pendingCode || Date.now() > expires) {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'No valid pending code' }) };
    }

    if (pendingCode !== code) {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'Invalid code' }) };
    }

    // mark MFA enabled
    const updated = { ...(item || {}), mfaEnabled: true, mfaMethod: 'EMAIL', mfaSecondaryEmail: pendingEmail };
    delete updated.mfaPendingCode;
    delete updated.mfaPendingExpires;
    delete updated.mfaPendingEmail;
    delete updated.mfaMethodPending;

    await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: updated }));

    return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ verified: true }) };
  } catch (error) {
    console.error('verifyEmailMfa error', error);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Failed to verify code' }) };
  }
}

async function requestEmailMfaChallenge(userId, event) {
  try {
    if (!USERS_TABLE) return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Users table not configured' }) };
    const result = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { userId } }));
    const item = result?.Item || {};
    if (!item.mfaEnabled || item.mfaMethod !== 'EMAIL' || !item.mfaSecondaryEmail) {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'Email MFA not enabled' }) };
    }

    const code = generateNumericCode(6);
    const expiresAt = Date.now() + 1000 * 60 * 10; // 10 minutes

    item.mfaChallengeCode = code;
    item.mfaChallengeExpires = expiresAt;
    await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: item }));

    const sent = await sendEmail(
      item.mfaSecondaryEmail,
      'Your VisitJO login code',
      `Your VisitJO login code is: ${code}`,
      `<p>Your VisitJO login code is: <strong>${code}</strong></p>`
    );

    return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ sent: !!sent }) };
  } catch (error) {
    console.error('requestEmailMfaChallenge error', error);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Failed to request challenge' }) };
  }
}

async function disableMfa(userId, event) {
  try {
    if (!USERS_TABLE) return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Users table not configured' }) };
    const result = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { userId } }));
    const item = result?.Item || {};
    item.mfaEnabled = false;
    delete item.mfaMethod;
    delete item.mfaSecondaryEmail;
    await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: item }));
    return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('disableMfa error', error);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Failed to disable MFA' }) };
  }
}

module.exports.handler = handler;
