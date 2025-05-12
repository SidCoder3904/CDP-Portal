from flask import current_app
from flask_mail import Message
from app import mail
from app.services.student_service import StudentService
import smtplib
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_notice_notification(cycle_id, notice_type, notice_title, notice_content):
        """
        Send email notification to all eligible students in a placement cycle
        
        Args:
            cycle_id: ID of the placement cycle
            notice_type: Type of notice (add/update/delete)
            notice_title: Title of the notice
            notice_content: Content of the notice
        """
        try:
            # Log current email configuration
            logger.info("\n=== Email Configuration ===")
            logger.info(f"MAIL_SERVER: {current_app.config.get('MAIL_SERVER')}")
            logger.info(f"MAIL_PORT: {current_app.config.get('MAIL_PORT')}")
            logger.info(f"MAIL_USE_TLS: {current_app.config.get('MAIL_USE_TLS')}")
            logger.info(f"MAIL_USERNAME: {current_app.config.get('MAIL_USERNAME')}")
            logger.info(f"MAIL_DEFAULT_SENDER: {current_app.config.get('MAIL_DEFAULT_SENDER')}")
            logger.info("=========================\n")

            # Get student emails
            logger.info(f"Getting student emails for cycle: {cycle_id}")
            student_emails = StudentService.get_student_emails_by_cycle(cycle_id)
            
            if not student_emails:
                logger.error("No eligible students found for notification")
                return
            
            logger.info(f"Found {len(student_emails)} eligible students")
            logger.info(f"Recipients: {student_emails}")
            
            # Prepare email content
            subject = f"Placement Notice: {notice_title}"
            
            if notice_type == "add":
                body = f"""
                A new notice has been posted in your placement cycle:

                Title: {notice_title}
                
                Content:
                {notice_content}
                
                Please check the portal for more details.
                """
            elif notice_type == "update":
                body = f"""
                A notice has been updated in your placement cycle:

                Title: {notice_title}
                
                Updated Content:
                {notice_content}
                
                Please check the portal for more details.
                """
            else:  # delete
                body = f"""
                A notice has been deleted from your placement cycle:

                Title: {notice_title}
                
                This notice has been removed from the portal.
                """
            
            # Log email details
            logger.info("\n=== Email Details ===")
            logger.info(f"From: {current_app.config.get('MAIL_DEFAULT_SENDER')}")
            logger.info(f"To: {', '.join(student_emails)}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Body: {body}")
            logger.info("===================\n")
            
            # Create and send email
            msg = Message(
                subject=subject,
                sender=current_app.config.get('MAIL_DEFAULT_SENDER'),
                recipients=student_emails,
                body=body
            )
            
            try:
                logger.info("Attempting to send email...")
                mail.send(msg)
                logger.info(f"[SUCCESS] Email sent successfully to {len(student_emails)} students")
                logger.info(f"Recipients: {', '.join(student_emails)}")
            except smtplib.SMTPAuthenticationError as e:
                logger.error("[ERROR] SMTP Authentication Error:")
                logger.error("This usually means your Gmail credentials are incorrect.")
                logger.error("Make sure you're using an App Password, not your regular Gmail password.")
                logger.error(f"Error details: {str(e)}")
                raise e
            except smtplib.SMTPException as e:
                logger.error("[ERROR] SMTP Error:")
                logger.error("This could be due to:")
                logger.error("1. Incorrect SMTP server settings")
                logger.error("2. Network connectivity issues")
                logger.error("3. Gmail security settings blocking the connection")
                logger.error(f"Error details: {str(e)}")
                raise e
            except Exception as e:
                logger.error("[ERROR] Unexpected error sending email:")
                logger.error(f"Error type: {type(e).__name__}")
                logger.error(f"Error details: {str(e)}")
                raise e
            
        except Exception as e:
            logger.error(f"❌ Error in send_notice_notification: {str(e)}")
            raise e

    @staticmethod
    def send_registration_notification(student_email, student_name):
        """
        Send email notification to a student when their account is registered
        
        Args:
            student_email: Email address of the student
            student_name: Name of the student
        """
        try:
            # Log current email configuration
            logger.info("\n=== Email Configuration ===")
            logger.info(f"MAIL_SERVER: {current_app.config.get('MAIL_SERVER')}")
            logger.info(f"MAIL_PORT: {current_app.config.get('MAIL_PORT')}")
            logger.info(f"MAIL_USE_TLS: {current_app.config.get('MAIL_USE_TLS')}")
            logger.info(f"MAIL_USERNAME: {current_app.config.get('MAIL_USERNAME')}")
            logger.info(f"MAIL_DEFAULT_SENDER: {current_app.config.get('MAIL_DEFAULT_SENDER')}")
            logger.info("=========================\n")

            # Prepare email content
            subject = "Welcome to CDP Portal - Your Account has been Created"
            
            body = f"""
            Dear {student_name},

            Welcome to the CDP Portal! Your account has been successfully created.

            Your login credentials are:
            Email: {student_email}
            Default Password: 123456789

            Please login to the portal and change your password immediately for security reasons.

            Best regards,
            CDP Portal Team
            """
            
            # Log email details
            logger.info("\n=== Email Details ===")
            logger.info(f"From: {current_app.config.get('MAIL_DEFAULT_SENDER')}")
            logger.info(f"To: {student_email}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Body: {body}")
            logger.info("===================\n")
            
            # Create and send email
            msg = Message(
                subject=subject,
                sender=current_app.config.get('MAIL_DEFAULT_SENDER'),
                recipients=[student_email],
                body=body
            )
            
            try:
                logger.info("Attempting to send registration email...")
                mail.send(msg)
                logger.info(f"✅ Registration email sent successfully to {student_email}")
            except smtplib.SMTPAuthenticationError as e:
                logger.error("❌ SMTP Authentication Error:")
                logger.error("This usually means your Gmail credentials are incorrect.")
                logger.error("Make sure you're using an App Password, not your regular Gmail password.")
                logger.error(f"Error details: {str(e)}")
                raise e
            except smtplib.SMTPException as e:
                logger.error("❌ SMTP Error:")
                logger.error("This could be due to:")
                logger.error("1. Incorrect SMTP server settings")
                logger.error("2. Network connectivity issues")
                logger.error("3. Gmail security settings blocking the connection")
                logger.error(f"Error details: {str(e)}")
                raise e
            except Exception as e:
                logger.error("❌ Unexpected error sending email:")
                logger.error(f"Error type: {type(e).__name__}")
                logger.error(f"Error details: {str(e)}")
                raise e
            
        except Exception as e:
            logger.error(f"❌ Error in send_notice_notification: {str(e)}")
            raise e

    @staticmethod
    def send_registration_notification(student_email, student_name):
        """
        Send email notification to a student when their account is registered
        
        Args:
            student_email: Email address of the student
            student_name: Name of the student
        """
        try:
            # Log current email configuration
            logger.info("\n=== Email Configuration ===")
            logger.info(f"MAIL_SERVER: {current_app.config.get('MAIL_SERVER')}")
            logger.info(f"MAIL_PORT: {current_app.config.get('MAIL_PORT')}")
            logger.info(f"MAIL_USE_TLS: {current_app.config.get('MAIL_USE_TLS')}")
            logger.info(f"MAIL_USERNAME: {current_app.config.get('MAIL_USERNAME')}")
            logger.info(f"MAIL_DEFAULT_SENDER: {current_app.config.get('MAIL_DEFAULT_SENDER')}")
            logger.info("=========================\n")

            # Prepare email content
            subject = "Welcome to CDP Portal - Your Account has been Created"
            
            body = f"""
            Dear {student_name},

            Welcome to the CDP Portal! Your account has been successfully created.

            Your login credentials are:
            Email: {student_email}
            Default Password: 123456789

            Please login to the portal and change your password immediately for security reasons.

            Best regards,
            CDP Portal Team
            """
            
            # Log email details
            logger.info("\n=== Email Details ===")
            logger.info(f"From: {current_app.config.get('MAIL_DEFAULT_SENDER')}")
            logger.info(f"To: {student_email}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Body: {body}")
            logger.info("===================\n")
            
            # Create and send email
            msg = Message(
                subject=subject,
                sender=current_app.config.get('MAIL_DEFAULT_SENDER'),
                recipients=[student_email],
                body=body
            )
            
            try:
                logger.info("Attempting to send registration email...")
                mail.send(msg)
                logger.info(f"✅ Registration email sent successfully to {student_email}")
            except smtplib.SMTPAuthenticationError as e:
                logger.error("❌ SMTP Authentication Error:")
                logger.error("This usually means your Gmail credentials are incorrect.")
                logger.error("Make sure you're using an App Password, not your regular Gmail password.")
                logger.error(f"Error details: {str(e)}")
                raise e
            except smtplib.SMTPException as e:
                logger.error("❌ SMTP Error:")
                logger.error("This could be due to:")
                logger.error("1. Incorrect SMTP server settings")
                logger.error("2. Network connectivity issues")
                logger.error("3. Gmail security settings blocking the connection")
                logger.error(f"Error details: {str(e)}")
                raise e
            except Exception as e:
                logger.error("❌ Unexpected error sending email:")
                logger.error(f"Error type: {type(e).__name__}")
                logger.error(f"Error details: {str(e)}")
                raise e
            
        except Exception as e:
            logger.error(f"❌ Error in send_registration_notification: {str(e)}")
            raise e 