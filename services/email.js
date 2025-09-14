const nodemailer = require('nodemailer');

// Email configuration with Hostinger SMTP settings
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // true for 465
  auth: {
    user: "no-reply@suhtech.in",
    pass: "we5#Oy^6:Z5v",
  },
});
// Function to send welcome email
async function sendWelcomeEmail(employeeData) {
  const { name, email, position, startDate, employeeId, department } = employeeData;

  const mailOptions = {
    from: '"Suhtech Pvt Ltd HR Team" <no-reply@suhtech.in>',
    to: email,
    cc: 'hr@suhtech.in',
    subject: `Welcome to Suhtech Pvt Ltd - ${name}`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Suhtech Pvt Ltd</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .content {
                padding: 30px;
            }
            .welcome-message {
                background-color: #f8f9ff;
                padding: 25px;
                border-left: 4px solid #667eea;
                margin: 20px 0;
                border-radius: 0 8px 8px 0;
            }
            .employee-details {
                background-color: #fff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .detail-label {
                font-weight: 600;
                color: #667eea;
            }
            .detail-value {
                color: #333;
            }
            .next-steps {
                background-color: #e8f4fd;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .next-steps h3 {
                color: #1976d2;
                margin-top: 0;
            }
            .next-steps ul {
                margin: 0;
                padding-left: 20px;
            }
            .next-steps li {
                margin-bottom: 8px;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #666;
            }
            .contact-info {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #e0e0e0;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 500;
                margin: 15px 0;
                transition: transform 0.2s;
            }
            .button:hover {
                transform: translateY(-2px);
            }
            @media (max-width: 600px) {
                .detail-row {
                    flex-direction: column;
                }
                .detail-label {
                    margin-bottom: 5px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Suhtech Pvt Ltd!</h1>
                <p>We're thrilled to have you join our team</p>
            </div>

            <div class="content">
                <div class="welcome-message">
                    <h2>Dear ${name},</h2>
                    <p>On behalf of everyone at <strong>Suhtech Pvt Ltd</strong>, I want to extend a warm welcome to you! We are excited to have you join our dynamic team and look forward to the fresh perspectives and expertise you'll bring to our organization.</p>
                    <p>Your skills and experience make you a valuable addition to our company, and we're confident that you'll find your role both challenging and rewarding.</p>
                </div>

                <div class="employee-details">
                    <h3>📋 Your Employment Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Employee Name:</span>
                        <span class="detail-value">${name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Employee ID:</span>
                        <span class="detail-value">${employeeId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Position:</span>
                        <span class="detail-value">${position}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Department:</span>
                        <span class="detail-value">${department}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Start Date:</span>
                        <span class="detail-value">${startDate}</span>
                    </div>
                </div>

                <div class="next-steps">
                    <h3>🚀 What's Next?</h3>
                    <ul>
                        <li><strong>First Day:</strong> Please report to the HR department at 9:00 AM on your start date</li>
                        <li><strong>Documentation:</strong> Bring all required documents for verification</li>
                        <li><strong>Orientation:</strong> You'll attend a comprehensive orientation session</li>
                        <li><strong>IT Setup:</strong> Your workstation and system access will be configured</li>
                        <li><strong>Team Introduction:</strong> Meet your colleagues and immediate supervisor</li>
                        <li><strong>Training Schedule:</strong> Receive your personalized training plan</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://www.suhtech.com/employee-handbook" class="button">📖 Employee Handbook</a>
                </div>

                <div class="welcome-message">
                    <h3>💼 What Makes Suhtech Special</h3>
                    <p>At Suhtech Pvt Ltd, we believe in fostering innovation, collaboration, and personal growth. You're joining a company that values:</p>
                    <ul>
                        <li>🌟 Excellence in everything we do</li>
                        <li>🤝 Collaborative teamwork</li>
                        <li>💡 Continuous learning and innovation</li>
                        <li>🎯 Work-life balance</li>
                        <li>🌱 Professional development opportunities</li>
                    </ul>
                </div>

                <p>If you have any questions or need assistance before your first day, please don't hesitate to reach out to our HR team. We're here to help make your transition as smooth as possible.</p>

                <p>Once again, welcome to the Suhtech family! We're excited to embark on this journey together.</p>

                <p><strong>Best regards,</strong><br>
                <strong>HR Team</strong><br>
                <strong>Suhtech Pvt Ltd</strong></p>
            </div>

            <div class="footer">
                <div class="contact-info">
                    <strong>Suhtech Pvt Ltd</strong><br>
                    📧 Email: hr@suhtech.in<br>
                    📞 Phone: +91-XXXXXXXXXX<br>
                    🌐 Website: www.suhtech.in<br>
                    📍 Address: [Your Company Address]
                </div>
                <p style="margin-top: 15px; font-size: 12px; color: #999;">
                    This email was sent by Suhtech Pvt Ltd HR Department. Please do not reply to this automated email.
                </p>
            </div>
        </div>
    </body>
    </html>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

// Function to test email configuration
async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
}

// Example usage
async function welcomeNewEmployee() {
  // First, test the connection
  const connectionTest = await testEmailConnection();
  if (!connectionTest) {
    console.log('Please check your email configuration.');
    return;
  }

  const employeeData = {
    name: "Sahil",
    email: "sahilvr66@gmail.com",
    position: "game Devloper",
    department: "IT",
    startDate: "September 15, 2025",
    employeeId: "ST0004",
  };

  const result = await sendWelcomeEmail(employeeData);

  if (result.success) {
    console.log('✅ Welcome email sent successfully!');
  } else {
    console.log('❌ Failed to send welcome email:', result.error);
  }
}

module.exports = { sendWelcomeEmail, testEmailConnection };
