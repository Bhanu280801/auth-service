import nodemailer from 'nodemailer'

const sendWithResend = async (to, subject, text) => {
    const from = process.env.EMAIL_FROM || 'Auth Service <onboarding@resend.dev>'

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from,
            to,
            subject,
            text
        })
    })

    if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Resend email failed: ${response.status} ${errorBody}`)
    }
}

const sendWithGmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    await transporter.sendMail({
        from: `"Auth Service" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text
    })
}

export const sendEmail = async (to, subject, text) => {
    if (process.env.RESEND_API_KEY) {
        await sendWithResend(to, subject, text)
        return
    }

    await sendWithGmail(to, subject, text)
}
