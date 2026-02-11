import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' or configure host/port for other providers
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
});

export const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"UrbanMind" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw error to prevent blocking main flow, just log it
        return null;
    }
};

export const sendIssueStatusEmail = async (userEmail, issueTitle, status, issueId) => {
    const subject = `Update on your issue: ${issueTitle}`;
    const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #4f46e5;">UrbanMind Issue Update</h2>
      <p>Hello,</p>
      <p>The status of the issue you reported <strong>"${issueTitle}"</strong> has been updated.</p>
      <p><strong>New Status: <span style="color: #ec4899; text-transform: uppercase;">${status}</span></strong></p>
      <p>You can view more details by logging into your dashboard.</p>
      <br>
      <p>Thank you for helping improve our city!</p>
      <p>The UrbanMind Team</p>
    </div>
  `;
    return sendEmail(userEmail, subject, html);
};
