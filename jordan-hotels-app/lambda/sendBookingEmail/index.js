/**
 * Lambda Function: Send Booking Confirmation Email
 * Triggers: API Gateway POST /send-booking-email
 * Uses: AWS SES to send transactional emails
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: process.env.AWS_REGION || "us-east-1" });

const ALLOWED_ORIGINS = new Set([
  "https://main.d1ewsonl19kjj7.amplifyapp.com",
  "http://localhost:5173",
  "http://localhost:5174",
]);

const getCorsHeaders = (event) => {
  const origin = event?.headers?.origin || event?.headers?.Origin || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://main.d1ewsonl19kjj7.amplifyapp.com";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent",
    "Vary": "Origin",
  };
};

const bookingConfirmationTemplate = (data) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 20px; margin: 20px 0; }
        .details { background: white; padding: 15px; border-left: 4px solid #1e3a8a; margin: 10px 0; }
        .button { background-color: #1e3a8a; color: white; padding: 12px 30px; text-decoration: none; display: inline-block; margin: 20px 0; }
        .footer { font-size: 12px; color: #666; text-align: center; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmation</h1>
        </div>
        
        <div class="content">
          <p>Thank you for your booking! Here are your confirmation details:</p>
          
          <div class="details">
            <p><strong>Hotel:</strong> ${data.hotelName}</p>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Confirmation Code:</strong> ${data.confirmationCode}</p>
            <p><strong>Check-in:</strong> ${data.checkIn}</p>
            <p><strong>Check-out:</strong> ${data.checkOut}</p>
            <p><strong>Guests:</strong> ${data.guests}</p>
            <p><strong>Total Price:</strong> JOD ${data.totalPrice}</p>
          </div>
          
          <p>Please save this confirmation for your records. You will need it at check-in.</p>
          
          <a href="${process.env.FRONTEND_URL}/bookings" class="button">View My Bookings</a>
          
          <p>If you have any questions, please contact our support team.</p>
        </div>
        
        <div class="footer">
          <p>&copy; 2026 VisitJo - Jordan Hotels. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
`;

const sendEmail = async (email, subject, htmlContent) => {
  const params = {
    Source: process.env.SES_EMAIL_FROM || 'noreply@visitjo.com',
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const result = await ses.send(new SendEmailCommand(params));
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error('SES Error:', error);
    throw error;
  }
};

export async function handler(event) {
  const method = event?.httpMethod || event?.requestContext?.http?.method || "POST";
  const corsHeaders = getCorsHeaders(event);

  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: "",
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { email, hotelName, checkIn, checkOut, guests, totalPrice, bookingId, confirmationCode } = body;

    if (!email || !hotelName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    const htmlContent = bookingConfirmationTemplate({
      hotelName,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      bookingId,
      confirmationCode,
    });

    const result = await sendEmail(
      email,
      `Booking Confirmation - ${hotelName}`,
      htmlContent
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      body: JSON.stringify({ message: 'Email sent successfully', ...result }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      body: JSON.stringify({ message: 'Failed to send email' }),
    };
  }
}
