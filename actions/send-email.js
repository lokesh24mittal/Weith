import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");
  try {
    const data = await resend.emails.send({
      from: "Welth <onboarding@resend.dev>",
      to,
      subject,
      react,
    });
    return { success: true, data };
  } catch (err) {
    console.log(err);
    return { success: false, err };
  }
}
