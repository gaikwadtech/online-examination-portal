import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Contact from '@/models/Contact';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, email, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Please fill in all fields (Name, Email, Message)' },
        { status: 400 }
      );
    }

    // Save to Database
    const newContact = await Contact.create({
      name,
      email,
      message,
    });

    // Email Sending Logic
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // REPLACE THIS URL WITH YOUR ACTUAL LOGO URL
      // Correct RAW image link
const logoUrl = "https://raw.githubusercontent.com/gaikwadtech/online-examination-portal/07d22fc4458ab115a8f55955dd6341c0df978544/public/logo111.png";

      const mailOptions = {
        from: `"TestEdge Support" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `New Inquiry: ${name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                
                <div style="background-color: #ffffff; padding: 20px 20px; text-align: center; border-bottom: 3px solid #7c3aed;">
                  <img src="${logoUrl}" alt="TestEdge Logo" style="max-width: 150px; height: auto; margin-bottom: 10px;">
                  <h1 style="color: #1f2937; margin: 10px 0 0 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">New Website Inquiry</h1>
                </div>

                <div style="padding: 40px 30px;">
                  
                  <div style="margin-bottom: 25px;">
                    <span style="color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">Sender Name</span>
                    <div style="font-size: 18px; color: #111827; font-weight: 600;">${name}</div>
                  </div>

                  <div style="margin-bottom: 25px;">
                    <span style="color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">Reply Email</span>
                    <a href="mailto:${email}" style="font-size: 18px; color: #6d28d9; text-decoration: none; font-weight: 500;">${email}</a>
                  </div>

                  <div style="margin-top: 30px;">
                    <span style="color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 10px;">Message Content</span>
                    <div style="background-color: #f9fafb; padding: 20px; border-left: 4px solid #6d28d9; border-radius: 4px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</div>
                  </div>

                </div>

                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} TestEdge Online Examination Portal.<br>
                    This is an automated notification.
                  </p>
                </div>

              </div>
            </body>
          </html>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
      
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    return NextResponse.json(
      { message: 'Message sent successfully', contact: newContact },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in Contact API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}