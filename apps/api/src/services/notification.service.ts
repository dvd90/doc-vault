import { resend } from '../lib/resend'
import { prisma } from '../lib/prisma'

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000'
const API_URL = process.env.API_URL ?? 'http://localhost:4000'
const FROM_EMAIL = 'noreply@docvault.app'

export const NotificationService = {
  async sendPortalInvite(clientId: string) {
    const client = await prisma.client.findUniqueOrThrow({
      where: { id: clientId },
      include: { firm: true },
    })

    const portalUrl = `${FRONTEND_URL}/portal/${client.portalToken}`

    await resend.emails.send({
      from: FROM_EMAIL,
      to: client.email,
      subject: `${client.firm.name} — your document portal is ready`,
      html: `
        <h2>Hi ${client.name},</h2>
        <p>${client.firm.name} has requested documents from you.</p>
        <p><a href="${portalUrl}">Click here to upload your documents</a></p>
        <p>Or copy this link: ${portalUrl} (token: ${client.portalToken})</p>
      `,
    })
  },

  async sendUploadReceived(checklistItemId: string) {
    const item = await prisma.checklistItem.findUniqueOrThrow({
      where: { id: checklistItemId },
      include: { client: { include: { firm: { include: { users: true } } } } },
    })

    const accountantEmails = item.client.firm.users.map((u) => u.email)
    if (accountantEmails.length === 0) return

    await resend.emails.send({
      from: FROM_EMAIL,
      to: accountantEmails[0],
      subject: `${item.client.name} uploaded: ${item.label}`,
      html: `<p>${item.client.name} has uploaded "${item.label}".</p>`,
    })
  },

  async sendChecklistComplete(clientId: string) {
    const client = await prisma.client.findUniqueOrThrow({
      where: { id: clientId },
      include: { firm: { include: { users: true } } },
    })

    const accountantEmails = client.firm.users.map((u) => u.email)
    if (accountantEmails.length === 0) return

    await resend.emails.send({
      from: FROM_EMAIL,
      to: accountantEmails[0],
      subject: `${client.name} has completed their checklist`,
      html: `<p>${client.name} has uploaded all required documents.</p>`,
    })
  },

  async sendMagicLink(email: string, token: string) {
    const link = `${API_URL}/auth/magic-link/callback?token=${token}`

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your DocVault sign-in link',
      html: `
        <h2>Sign in to DocVault</h2>
        <p>Click the link below to sign in. It expires in 1 hour and can only be used once.</p>
        <p><a href="${link}">Sign in to DocVault</a></p>
        <p>Or copy this link: ${link}</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    })
  },

  async sendReminderToClient(clientId: string) {
    const client = await prisma.client.findUniqueOrThrow({
      where: { id: clientId },
      include: { firm: true },
    })

    const portalUrl = `${FRONTEND_URL}/portal/${client.portalToken}`

    await resend.emails.send({
      from: FROM_EMAIL,
      to: client.email,
      subject: `Reminder: ${client.firm.name} is waiting for your documents`,
      html: `
        <p>Hi ${client.name},</p>
        <p>This is a reminder to upload your documents for ${client.firm.name}.</p>
        <p><a href="${portalUrl}">Upload documents here</a></p>
      `,
    })
  },
}
