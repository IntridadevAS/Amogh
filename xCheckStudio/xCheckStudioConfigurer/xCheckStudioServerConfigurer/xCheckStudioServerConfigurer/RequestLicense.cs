using System;
using System.Collections.Generic;

using System.Net;
using System.Net.Mail;

namespace XcheckStudioHubManager
{
    class RequestLicense
    {
        private static string smtpAddress = "smtp.office365.com";
        private static int portNumber = 587;
        private static bool enableSSL = true;
        private static string emailFromAddress = "license@intrida.com"; //Sender Email Address  
        private static string password = "Intrida4lic>1&All"; //Sender Password  
        private static string emailToAddress = "license@intrida.com"; //Receiver Email Address  
        private static string subject = "License Request";
        private static string body = "";

        public static bool Request(Dictionary<String, String> requestData)
        {
            try
            {

                if (requestData == null ||
                    !requestData.ContainsKey("name") ||
                    !requestData.ContainsKey("organization") ||
                    !requestData.ContainsKey("designation") ||
                    !requestData.ContainsKey("emailid") ||
                    !requestData.ContainsKey("hostid"))
                {
                    return false;
                }

                body += "Name         : " + requestData["name"] + "<br />";
                body += "Organization : " + requestData["organization"] + "<br />";
                body += "Customer Ref No : " + requestData["designation"] + "<br />";
                body += "Email Id     : " + requestData["emailid"] + "<br />";
                body += "Host Id      : " + requestData["hostid"] + "<br />";

                using (MailMessage mail = new MailMessage())
                {
                    mail.From = new MailAddress(emailFromAddress);
                    mail.To.Add(emailToAddress);
                    mail.Subject = subject;
                    mail.Body = body;
                    mail.IsBodyHtml = true;
                    //mail.Attachments.Add(new Attachment("D:\\TestFile.txt"));//--Uncomment this to send any attachment  
                    using (SmtpClient smtp = new SmtpClient(smtpAddress, portNumber))
                    {
                        smtp.Credentials = new NetworkCredential(emailFromAddress, password);
                        smtp.EnableSsl = enableSSL;
                        smtp.Send(mail);
                    }
                }
            }
            catch
            {                
                return false;
            }

            return true;
        }
    }
}
