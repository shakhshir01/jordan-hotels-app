
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);
const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE || "Bookings";
const USERS_TABLE = process.env.USERS_TABLE || "Users";

const defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent",
  "Vary": "Origin",
};

async function generateSignedAvatarUrl(key) {
  if (!key || !process.env.S3_UPLOAD_BUCKET) return null;
  try {
    // If key already starts with 'uploads/', don't add it again
    const s3Key = key.startsWith('uploads/') ? key : `uploads/${key}`;
    const command = new GetObjectCommand({
      Bucket: process.env.S3_UPLOAD_BUCKET,
      Key: s3Key,
    });
    // Generate URL that expires in 1 hour
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

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

    // POST /user/mfa/email/login-code
    if (path === '/user/mfa/email/login-code' && method === 'POST') {
      return await sendLoginMfaCode(userId, event);
    }

    // POST /user/mfa/email/verify-login
    if (path === '/user/mfa/email/verify-login' && method === 'POST') {
      return await verifyLoginMfaCode(userId, event);
    }

    // POST /user/mfa/totp/setup
    if (path === '/user/mfa/totp/setup' && method === 'POST') {
      return await setupTotpMfa(userId, event);
    }

    // POST /user/mfa/totp/verify
    if (path === '/user/mfa/totp/verify' && method === 'POST') {
      return await verifyTotpMfa(userId, event);
    }

    // POST /auth/email-mfa/setup
    if (path === '/auth/email-mfa/setup' && method === 'POST') {
      return await setupEmailMfa(userId, event);
    }

    // POST /auth/totp/verify-login
    if (path === '/auth/totp/verify-login' && method === 'POST') {
      return await verifyLoginTotpMfa(userId, event);
    }

    // POST /user/mfa/disable
    if (path === '/user/mfa/disable' && method === 'POST') {
      return await disableMfa(userId, event);
    }

    // POST /user/mfa/disable-by-email
    if (path === '/user/mfa/disable-by-email' && method === 'POST') {
      return await disableMfaByEmail(event);
    }

    // GET /user/bookings
    if (path === '/user/bookings' && method === 'GET') {
      return await getUserBookings(userId, event);
    }

    // GET /blog
    if (path === '/blog' && method === 'GET') {
      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify([
          {
            id: "blog-welcome-visitjo",
            title: "Welcome to VisitJo - Your Jordan Travel Companion",
            slug: "welcome-to-visitjo",
            excerpt: "Discover the best of Jordan with our comprehensive travel platform",
            content: "Welcome to VisitJo, your ultimate guide to exploring the wonders of Jordan...",
            author: "VisitJo Team",
            publishedAt: new Date().toISOString(),
            tags: ["welcome", "travel", "jordan"],
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200",
          }
        ])
      };
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
        const item = result.Item;
        // Generate signed URL for avatar if key exists
        if (item.avatarKey && !item.avatarUrl) {
          item.avatarUrl = await generateSignedAvatarUrl(item.avatarKey);
        }
        return {
          statusCode: 200,
          headers: defaultHeaders,
          body: JSON.stringify(item),
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
      mfaEnabled: false,
      mfaMethod: null,
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
    const bodyFirst = body.firstName || body.given_name || '';
    const bodyLast = body.lastName || body.family_name || '';
    const bodyEmail = body.email;
    const bodyPhone = body.phone;
    const bodyAvatarKey = body.avatarKey;
    const bodyAvatarUrl = body.avatarUrl;

    // Fetch existing item so we can merge instead of overwrite
    let existing = {};
    if (USERS_TABLE) {
      try {
        const got = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { userId } }));
        existing = got?.Item || { userId };
      } catch (getErr) {
        console.warn('Failed to read existing user item before update:', getErr.message || getErr);
        existing = { userId };
      }
    }

    const merged = {
      userId,
      // prefer provided body values, fall back to existing or derived
      firstName: bodyFirst !== undefined && bodyFirst !== '' ? bodyFirst : (existing.firstName || ''),
      lastName: bodyLast !== undefined && bodyLast !== '' ? bodyLast : (existing.lastName || ''),
      name: ((bodyFirst || existing.firstName || '') + ' ' + (bodyLast || existing.lastName || '')).trim() || existing.name || '',
      email: bodyEmail !== undefined ? bodyEmail : existing.email || '',
      phone: bodyPhone !== undefined ? bodyPhone : existing.phone || '',
      location: body.location !== undefined ? body.location : existing.location || '',
      joinedDate: body.joinedDate !== undefined ? body.joinedDate : existing.joinedDate || '',
      membershipTier: body.membershipTier !== undefined ? body.membershipTier : existing.membershipTier || '',
      // Preserve MFA-related fields unless explicitly provided in the body
      mfaEnabled: body.mfaEnabled !== undefined ? body.mfaEnabled : existing.mfaEnabled || false,
      mfaMethod: body.mfaMethod !== undefined ? body.mfaMethod : existing.mfaMethod || null,
      mfaSecondaryEmail: body.mfaSecondaryEmail !== undefined ? body.mfaSecondaryEmail : existing.mfaSecondaryEmail || null,
      // Preserve any pending/challenge fields if they exist and are not part of the patch
      mfaPendingEmail: body.mfaPendingEmail !== undefined ? body.mfaPendingEmail : existing.mfaPendingEmail || null,
      mfaPendingCode: body.mfaPendingCode !== undefined ? body.mfaPendingCode : existing.mfaPendingCode || null,
      mfaPendingExpires: body.mfaPendingExpires !== undefined ? body.mfaPendingExpires : existing.mfaPendingExpires || null,
      mfaChallengeCode: body.mfaChallengeCode !== undefined ? body.mfaChallengeCode : existing.mfaChallengeCode || null,
      mfaChallengeExpires: body.mfaChallengeExpires !== undefined ? body.mfaChallengeExpires : existing.mfaChallengeExpires || null,
      avatarKey: bodyAvatarKey !== undefined ? bodyAvatarKey : existing.avatarKey || null,
      avatarUrl: null, // Will be set after saving
    };

    // Remove explicit nulls for cleaner storage (optional)
    Object.keys(merged).forEach((k) => {
      if (merged[k] === null) delete merged[k];
    });

    if (USERS_TABLE) {
      await docClient.send(
        new PutCommand({
          TableName: USERS_TABLE,
          Item: merged,
        })
      );
    }

    // Generate signed URL for avatar if key exists, clear if explicitly null
    if (merged.avatarKey) {
      merged.avatarUrl = await generateSignedAvatarUrl(merged.avatarKey);
    } else if (bodyAvatarKey === null) {
      merged.avatarUrl = null;
    } else if (existing.avatarUrl) {
      merged.avatarUrl = existing.avatarUrl;
    }

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify(merged),
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
    console.log('Attempting to send email from:', from, 'to:', toAddress);
    await ses.send(new SendEmailCommand(params));
    console.log('Email sent successfully to:', toAddress);
    return true;
  } catch (e) {
    console.error('SES send error:', e.message);
    console.error('Error name:', e.name);
    console.error('Error code:', e.code);
    console.error('Sending to:', toAddress, 'from:', from);
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

async function sendLoginMfaCode(userId, event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const email = String(body.email || '').trim();
    if (!email) {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'email required' }) };
    }

    // Verify this email belongs to the authenticated user
    let existingItem = {};
    if (USERS_TABLE) {
      const found = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { userId } }));
      existingItem = found?.Item || {};
    }
    const userEmail = String(existingItem.email || '').trim().toLowerCase();
    const secondaryEmail = String(existingItem.mfaSecondaryEmail || '').trim().toLowerCase();
    
    if (secondaryEmail !== email.toLowerCase()) {
      return { statusCode: 403, headers: defaultHeaders, body: JSON.stringify({ message: 'Email not authorized for this user' }) };
    }

    const code = generateNumericCode(6);
    const expiresAt = Date.now() + 1000 * 60 * 15; // 15 minutes

    // Store the login MFA code in the user item
    if (USERS_TABLE) {
      const item = { ...existingItem };
      item.mfaLoginCode = code;
      item.mfaLoginExpires = expiresAt;
      await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: item }));
    }

    // Send email
    const sent = await sendEmail(
      email,
      'VisitJO Login Verification',
      `Your VisitJO login verification code is: ${code}`,
      `<p>Your VisitJO login verification code is: <strong>${code}</strong></p><p>This code will expire in 15 minutes.</p>`
    );

    return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ sent: !!sent }) };
  } catch (error) {
    console.error('sendLoginMfaCode error', error);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Failed to send login verification code' }) };
  }
}

async function verifyLoginMfaCode(userId, event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const code = String(body.code || body.token || '').trim();
    if (!code) return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'code required' }) };

    if (!USERS_TABLE) return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Users table not configured' }) };

    const result = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { userId } }));
    const item = result?.Item || {};
    const loginCode = String(item.mfaLoginCode || '');
    const expires = Number(item.mfaLoginExpires || 0);

    if (!loginCode || Date.now() > expires) {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'No valid login code' }) };
    }

    if (loginCode !== code) {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'Invalid code' }) };
    }

    // Clear the login code after successful verification
    const updated = { ...item };
    delete updated.mfaLoginCode;
    delete updated.mfaLoginExpires;
    await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: updated }));

    return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ verified: true }) };
  } catch (error) {
    console.error('verifyLoginMfaCode error', error);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Failed to verify login code' }) };
  }
}

async function setupTotpMfa(userId, event) {
  try {
    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: 'VisitJo',
      issuer: 'VisitJo',
      length: 32
    });

    // Generate QR code
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: 'VisitJo',
      issuer: 'VisitJo',
      encoding: 'ascii'
    });

    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    // Store the secret temporarily
    if (USERS_TABLE) {
      const existing = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { userId } }));
      const item = existing?.Item || { userId };
      item.mfaTotpSecret = secret.base32;
      item.mfaTotpPending = true;
      await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: item }));
    }

    return { 
      statusCode: 200, 
      headers: defaultHeaders, 
      body: JSON.stringify({ 
        secret: secret.base32, 
        qrCode: qrCodeDataUrl,
        otpauthUrl 
      }) 
    };
  } catch (error) {
    console.error('setupTotpMfa error', error);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Failed to setup TOTP MFA' }) };
  }
}

async function verifyTotpMfa(userId, event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const code = String(body.code || body.token || '').trim();
    if (!code) return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'code required' }) };

    if (!USERS_TABLE) return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Users table not configured' }) };

    const result = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { userId } }));
    const item = result?.Item || {};
    const secret = item.mfaTotpSecret;

    if (!secret || !item.mfaTotpPending) {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'No pending TOTP setup' }) };
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 2 // Allow 2 time steps (30 seconds each)
    });

    if (!verified) {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'Invalid code' }) };
    }

    // Mark MFA enabled
    const updated = { 
      ...(item || {}), 
      mfaEnabled: true, 
      mfaMethod: 'TOTP', 
      mfaTotpSecret: secret 
    };
    delete updated.mfaTotpPending;

    await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: updated }));

    return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ verified: true }) };
  } catch (error) {
    console.error('verifyTotpMfa error', error);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Failed to verify TOTP code' }) };
  }
}

async function verifyLoginTotpMfa(userId, event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const code = String(body.code || body.token || '').trim();
    if (!code) return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'code required' }) };

    if (!USERS_TABLE) return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Users table not configured' }) };

    const result = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { userId } }));
    const item = result?.Item || {};
    const secret = item.mfaTotpSecret;

    if (!secret || !item.mfaEnabled || item.mfaMethod !== 'TOTP') {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'TOTP MFA not enabled' }) };
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 2 // Allow 2 time steps (30 seconds each)
    });

    if (!verified) {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'Invalid code' }) };
    }

    return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ verified: true }) };
  } catch (error) {
    console.error('verifyLoginTotpMfa error', error);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Failed to verify TOTP code' }) };
  }
}

async function disableMfa(userId, event) {
  try {
    console.log('disableMfa called for userId:', userId);
    console.log('USERS_TABLE:', USERS_TABLE);
    if (!USERS_TABLE) return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Users table not configured' }) };

    console.log('Fetching user from DynamoDB...');
    const result = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { userId } }));
    const item = result?.Item || {};
    console.log('User item fetched:', !!item);

    // Disable MFA and clear related fields
    const updated = {
      ...item,
      mfaEnabled: false,
      mfaMethod: null,
      mfaSecondaryEmail: null,
      // Clear any pending MFA setup fields
      mfaPendingEmail: null,
      mfaPendingCode: null,
      mfaPendingExpires: null,
      mfaMethodPending: null,
      // Clear any challenge fields
      mfaChallengeCode: null,
      mfaChallengeExpires: null,
      // Clear TOTP fields
      mfaTotpSecret: null,
      mfaTotpPending: null,
      // Clear login MFA fields
      mfaLoginCode: null,
      mfaLoginExpires: null,
    };

    console.log('Updating user in DynamoDB...');
    await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: updated }));

    console.log('MFA disabled successfully');
    return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ disabled: true }) };
  } catch (error) {
    console.error('disableMfa error:', error.message, error.stack);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Failed to disable MFA', error: error.message }) };
  }
}

async function disableMfaByEmail(event) {
  try {
    console.log('disableMfaByEmail called');
    const body = JSON.parse(event.body || '{}');
    const email = body.email;
    
    if (!email) {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'Email is required' }) };
    }
    
    if (!USERS_TABLE) {
      return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Users table not configured' }) };
    }

    // Scan for user by email (since no GSI on email)
    const scanResult = await docClient.send(new ScanCommand({
      TableName: USERS_TABLE,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email }
    }));
    
    const items = scanResult?.Items || [];
    if (items.length === 0) {
      // User not found in database, but that's ok - MFA is effectively disabled
      console.log('User not found in database for email:', email);
      return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ disabled: true }) };
    }
    
    const user = items[0];
    const userId = user.userId;
    
    // Now disable MFA for this user
    const updated = {
      ...user,
      mfaEnabled: false,
      mfaMethod: null,
      mfaSecondaryEmail: null,
      mfaPendingEmail: null,
      mfaPendingCode: null,
      mfaPendingExpires: null,
      mfaMethodPending: null,
      mfaChallengeCode: null,
      mfaChallengeExpires: null,
      mfaTotpSecret: null,
      mfaTotpPending: null,
      mfaLoginCode: null,
      mfaLoginExpires: null,
    };

    await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: updated }));

    console.log('MFA disabled by email successfully for:', email);
    return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ disabled: true }) };
  } catch (error) {
    console.error('disableMfaByEmail error:', error.message, error.stack);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'Failed to disable MFA', error: error.message }) };
  }
}

module.exports.handler = handler;
