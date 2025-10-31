const sgMail = require('@sendgrid/mail');
const { StatusCodes } = require('http-status-codes');

const { logger } = require('./logger.utils');
const { APIError } = require('../middlewares/error.middlewares');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Function to send an email using SendGrid
 * @param {string} email user email to be addressed
 * @param {string} subject subject of email
 * @param {string?} text optional email text or content field
 * @param {string?} html optional html email content field
 */
const sendEmail = async (email, subject, text, html) => {
  if (!email) {
    throw new APIError('Could not find "email" field', StatusCodes.BAD_REQUEST);
  }

  const msg = {
    subject,
    to: email,
    from: process.env.SENDGRID_EMAIL_SENDER,
    ...(text ? { text } : { html }),
  };

  try {
    await sgMail.send(msg);
    logger.info(`Email sent successfully to ${email}`);
  } catch (error) {
    logger.error('Failed to send email', error);
    throw new APIError(
      `Failed to send email: ${error.message}`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      error
    );
  }
};

module.exports = { sendEmail };
