// Email templates for authentication emails

/**
 * Renders the appropriate email template based on type
 */
export async function renderAuthEmail(
  type: "signup" | "magiclink" | "recovery" | "invite",
  email: string,
  data: any
): Promise<string> {
  console.log(`Rendering ${type} email template with data:`, JSON.stringify(data, null, 2));
  
  try {
    let template: string;
    
    switch (type) {
      case "signup":
        template = renderSignupEmail(email, data);
        break;
      case "magiclink":
        template = renderMagicLinkEmail(email, data);
        break;
      case "recovery":
        template = renderRecoveryEmail(email, data);
        break;
      case "invite":
        template = renderInviteEmail(email, data);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }
    
    console.log(`Successfully rendered ${type} email template`);
    return template;
  } catch (error) {
    console.error(`Error rendering ${type} email template:`, error);
    throw error;
  }
}

/**
 * Renders a styled signup confirmation email
 */
function renderSignupEmail(email: string, data: any): string {
  console.log("Rendering signup email with data:", JSON.stringify(data, null, 2));
  
  // Build confirmation URL using token_hash and redirect_to
  const confirmationUrl = `${data.site_url}/auth/v1/verify?token=${data.token_hash}&type=signup&redirect_to=${encodeURIComponent(data.redirect_to || 'http://localhost:3000/login?email_confirmed=true')}`;
  const appName = "Merito";
  
  // Extract user name from the metadata if available
  const userName = email.split('@')[0];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Potvrdenie registrácie | ${appName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      margin-top: 20px;
      overflow: hidden;
    }
    
    .email-header {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
    }
    
    .email-body {
      padding: 32px 24px;
    }
    
    h1 {
      color: #111827;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 16px;
      text-align: center;
    }
    
    p {
      margin: 0 0 24px;
      font-size: 16px;
    }
    
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    
    .button {
      display: inline-block;
      background-color: #0891b2;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 32px;
      font-weight: 500;
      border-radius: 6px;
      transition: background-color 0.2s;
    }
    
    .button:hover {
      background-color: #0e7490;
    }
    
    .email-footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    
    .help-text {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 14px;
      color: #64748b;
    }
    
    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
      }
      
      .email-header, .email-body, .email-footer {
        padding: 20px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="email-header">
        <h2 style="color: #0891b2; margin: 0;">${appName}</h2>
      </div>
      <div class="email-body">
        <h1>Potvrdenie registrácie</h1>
        <p>Ahoj ${userName},</p>
        <p>ďakujeme za registráciu v aplikácii ${appName}. Pre dokončenie registrácie a aktiváciu účtu prosím kliknite na tlačidlo nižšie:</p>
        
        <div class="button-container">
          <a href="${confirmationUrl}" class="button">Potvrdiť registráciu</a>
        </div>
        
        <p>Ak ste sa nezaregistrovali do aplikácie ${appName}, môžete tento email ignorovať.</p>
        
        <div class="help-text">
          <p>Ak máte problém s kliknutím na tlačidlo, skopírujte a vložte nasledujúci odkaz do vášho webového prehliadača:</p>
          <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>
        </div>
      </div>
      <div class="email-footer">
        <p>&copy; ${new Date().getFullYear()} ${appName}. Všetky práva vyhradené.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Renders a styled magic link email
 */
function renderMagicLinkEmail(email: string, data: any): string {
  const magicLink = `${data.site_url}/auth/v1/verify?token=${data.token_hash}&type=magiclink&redirect_to=${encodeURIComponent(data.redirect_to || 'http://localhost:3000')}`;
  const appName = "Merito";
  
  // Extract user name from the email if metadata not available
  const userName = email.split('@')[0];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prihlásenie pomocou odkazu | ${appName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      margin-top: 20px;
      overflow: hidden;
    }
    
    .email-header {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
    }
    
    .email-body {
      padding: 32px 24px;
    }
    
    h1 {
      color: #111827;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 16px;
      text-align: center;
    }
    
    p {
      margin: 0 0 24px;
      font-size: 16px;
    }
    
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    
    .button {
      display: inline-block;
      background-color: #0891b2;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 32px;
      font-weight: 500;
      border-radius: 6px;
      transition: background-color 0.2s;
    }
    
    .button:hover {
      background-color: #0e7490;
    }
    
    .email-footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    
    .help-text {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 14px;
      color: #64748b;
    }
    
    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
      }
      
      .email-header, .email-body, .email-footer {
        padding: 20px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="email-header">
        <h2 style="color: #0891b2; margin: 0;">${appName}</h2>
      </div>
      <div class="email-body">
        <h1>Prihlásenie jedným kliknutím</h1>
        <p>Ahoj ${userName},</p>
        <p>Požiadali ste o prihlásenie pomocou tohto e-mailu. Kliknite na tlačidlo nižšie pre prihlásenie do vášho účtu ${appName}:</p>
        
        <div class="button-container">
          <a href="${magicLink}" class="button">Prihlásiť sa</a>
        </div>
        
        <p>Ak ste nepožiadali o toto prihlásenie, môžete tento email ignorovať.</p>
        
        <div class="help-text">
          <p>Ak máte problém s kliknutím na tlačidlo, skopírujte a vložte nasledujúci odkaz do vášho webového prehliadača:</p>
          <p><a href="${magicLink}">${magicLink}</a></p>
        </div>
      </div>
      <div class="email-footer">
        <p>&copy; ${new Date().getFullYear()} ${appName}. Všetky práva vyhradené.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Renders a styled password recovery email
 */
function renderRecoveryEmail(email: string, data: any): string {
  const recoveryLink = `${data.site_url}/auth/v1/verify?token=${data.token_hash}&type=recovery&redirect_to=${encodeURIComponent(data.redirect_to || 'http://localhost:3000')}`;
  const appName = "Merito";
  
  // Extract user name from the email if metadata not available
  const userName = email.split('@')[0];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Obnovenie hesla | ${appName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      margin-top: 20px;
      overflow: hidden;
    }
    
    .email-header {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
    }
    
    .email-body {
      padding: 32px 24px;
    }
    
    h1 {
      color: #111827;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 16px;
      text-align: center;
    }
    
    p {
      margin: 0 0 24px;
      font-size: 16px;
    }
    
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    
    .button {
      display: inline-block;
      background-color: #0891b2;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 32px;
      font-weight: 500;
      border-radius: 6px;
      transition: background-color 0.2s;
    }
    
    .button:hover {
      background-color: #0e7490;
    }
    
    .email-footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    
    .help-text {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 14px;
      color: #64748b;
    }
    
    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
      }
      
      .email-header, .email-body, .email-footer {
        padding: 20px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="email-header">
        <h2 style="color: #0891b2; margin: 0;">${appName}</h2>
      </div>
      <div class="email-body">
        <h1>Obnovenie hesla</h1>
        <p>Ahoj ${userName},</p>
        <p>Dostali sme žiadosť o obnovenie hesla pre váš účet ${appName}. Kliknite na tlačidlo nižšie pre nastavenie nového hesla:</p>
        
        <div class="button-container">
          <a href="${recoveryLink}" class="button">Obnoviť heslo</a>
        </div>
        
        <p>Ak ste nepožiadali o obnovenie hesla, môžete tento email ignorovať.</p>
        
        <div class="help-text">
          <p>Ak máte problém s kliknutím na tlačidlo, skopírujte a vložte nasledujúci odkaz do vášho webového prehliadača:</p>
          <p><a href="${recoveryLink}">${recoveryLink}</a></p>
        </div>
      </div>
      <div class="email-footer">
        <p>&copy; ${new Date().getFullYear()} ${appName}. Všetky práva vyhradené.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Renders a styled invite email
 */
function renderInviteEmail(email: string, data: any): string {
  const inviteLink = `${data.site_url}/auth/v1/verify?token=${data.token_hash}&type=invite&redirect_to=${encodeURIComponent(data.redirect_to || 'http://localhost:3000')}`;
  const appName = "Merito";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pozvánka do aplikácie | ${appName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      margin-top: 20px;
      overflow: hidden;
    }
    
    .email-header {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
    }
    
    .email-body {
      padding: 32px 24px;
    }
    
    h1 {
      color: #111827;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 16px;
      text-align: center;
    }
    
    p {
      margin: 0 0 24px;
      font-size: 16px;
    }
    
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    
    .button {
      display: inline-block;
      background-color: #0891b2;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 32px;
      font-weight: 500;
      border-radius: 6px;
      transition: background-color 0.2s;
    }
    
    .button:hover {
      background-color: #0e7490;
    }
    
    .email-footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    
    .help-text {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 14px;
      color: #64748b;
    }
    
    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
      }
      
      .email-header, .email-body, .email-footer {
        padding: 20px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="email-header">
        <h2 style="color: #0891b2; margin: 0;">${appName}</h2>
      </div>
      <div class="email-body">
        <h1>Pozvánka do aplikácie ${appName}</h1>
        <p>Ahoj,</p>
        <p>Boli ste pozvaní do aplikácie ${appName}. Pre vytvorenie účtu a pripojenie sa kliknite na tlačidlo nižšie:</p>
        
        <div class="button-container">
          <a href="${inviteLink}" class="button">Prijať pozvánku</a>
        </div>
        
        <p>Ak nechcete prijať túto pozvánku, môžete tento email ignorovať.</p>
        
        <div class="help-text">
          <p>Ak máte problém s kliknutím na tlačidlo, skopírujte a vložte nasledujúci odkaz do vášho webového prehliadača:</p>
          <p><a href="${inviteLink}">${inviteLink}</a></p>
        </div>
      </div>
      <div class="email-footer">
        <p>&copy; ${new Date().getFullYear()} ${appName}. Všetky práva vyhradené.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
