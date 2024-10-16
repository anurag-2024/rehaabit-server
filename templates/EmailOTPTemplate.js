exports.emailOTP = (otp) => {
  return `<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Email Verification - Rehaabit</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
                  font-family: 'Arial', sans-serif;
                  color: #333;
                  line-height: 1.6;
              }
    
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 40px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                  text-align: center;
              }
    
              .header {
                  padding-bottom: 20px;
                  border-bottom: 1px solid #ececec;
                  margin-bottom: 20px;
              }
    
              .header img {
                  max-width: 180px; 
                  width: 100%; 
                  height: auto;
                  margin-bottom: 20px;
              }
    
              .title {
                  font-size: 24px;
                  color: #333;
                  font-weight: 700;
                  margin-bottom: 15px;
              }
    
              .subtext {
                  color: #555;
                  font-size: 16px;
                  margin-bottom: 30px;
                  line-height: 1.5;
              }
    
              .content {
                  font-size: 16px;
                  color: #555;
                  margin-bottom: 30px;
                  line-height: 1.5;
                  text-align: left;
              }
    
              .otp-box {
                  font-size: 24px;
                  font-weight: bold;
                  color: #6820B7;
                  letter-spacing: 4px;
                  padding: 10px 20px;
                  background-color: #FFDA54;
                  border-radius: 8px;
                  display: inline-block;
                  margin-bottom: 20px;
              }
    
              .cta-button {
                  display: inline-block;
                  padding: 15px 30px;
                  background-color: #00AF84;
                  color: #ffffff;
                  font-size: 16px;
                  font-weight: bold;
                  border-radius: 30px;
                  text-decoration: none;
                  text-transform: uppercase;
                  margin-top: 20px;
                  letter-spacing: 1px;
              }
    
              .footer {
                  font-size: 14px;
                  color: #888;
                  margin-top: 30px;
              }
    
              .footer a {
                  color: #00AF84;
                  text-decoration: none;
              }
    
              @media screen and (max-width: 600px) {
                  .container {
                      padding: 20px;
                  }
    
                  .cta-button {
                      width: 100%;
                      font-size: 18px;
                      padding: 12px 0;
                  }
    
                  .otp-box {
                      font-size: 20px;
                      padding: 8px 16px;
                  }
              }
          </style>
      </head>
      
      <body>
          <div class="container">
              <!-- Logo and Header -->
              <div class="header">
                  <img src='https://i.postimg.cc/26wycnzk/Frame-45-removebg-preview-1.png' border='0' alt='Rehaabit Logo'/>
                  <div class="title">Verify Your Email</div>
                  <div class="subtext">You're almost there! Just one more step to complete your registration.</div>
              </div>
    
              <!-- Main Content -->
              <div class="content">
                  <p>Hi there,</p>
                  <p>Welcome to <strong>Rehaabit</strong>! To complete the email verification, we need to verify your email address. Please use the OTP below to verify your account:</p>
              </div>
    
              <!-- OTP Display -->
              <div class="otp-box">
                  ${otp}
              </div>
    
              <!-- Call to Action -->
              <p class="content">Please enter this OTP in the verification screen to confirm your email address.</p>
    
              <!-- Footer Section -->
              <div class="footer">
                  <p>If you did not request this verification, please ignore this email.</p>
                  <p>Need assistance? Reach out to us at <a href="mailto:support@rehaabit.com">support@rehaabit.com</a>.</p>
              </div>
          </div>
      </body>
      
      </html>`;
};
