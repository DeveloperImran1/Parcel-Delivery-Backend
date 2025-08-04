/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import ejs from 'ejs';
import nodemailer from 'nodemailer';
import path from 'path';
import { envVars } from '../config/env';
import AppError from '../errorHelpers/AppError';

const transporter = nodemailer.createTransport({
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
  host: envVars.EMAIL_SENDER.SMTP_HOST,
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    // Aikhane templateName holo utils > templates folder er moddhe kon file ta send korbo email er body te. Sei file er name ta sudho. Ex: "forgetPassword"
    // Akhon sei file name and folderName dia akta full directory name create kore templatePath a rakhtesi.
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData); // ejs npm package er maddhome templatePath and oi file a dynamic data gulo send korar jonno templateData object akare dita hobe. Tahole fully akta dynamic html file generate kore diba.
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      // attachment optional. Aitar maddhome bivinno file attach kore dewa jai.
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    // Aikhane dynamic vabe akta console kora hoisa. Jeita email er id and kon user ke ki email send kora hoisa. Seita console korbe.
    console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
  } catch (error: any) {
    console.log('email sending error', error.message);
    throw new AppError(401, 'Email error');
  }
};
