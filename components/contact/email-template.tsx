import * as React from 'react';
import { Resend } from 'resend';


interface EmailTemplateProps {
  firstName: string;
  email: string;     
  message: string;  
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  email,
  message,
}) => (
  <div>
    <h1>Message de {firstName}</h1>
    <p><strong>Email :</strong> {email}</p>
    <p><strong>Message :</strong></p>
    <p>{message}</p>
  </div>
);