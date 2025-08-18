import type { Address } from "viem"

export interface MessageData {
  domain: string
  message: string
  timestamp: number
  sender: Address
}

export function createMessageForSigning(data: MessageData): string {
  return `Send message to ${data.domain}:

"${data.message}"

Timestamp: ${data.timestamp}
Sender: ${data.sender}`
}

export function validateMessageData(data: Partial<MessageData>): data is MessageData {
  return !!(
    data.domain &&
    data.message &&
    data.timestamp &&
    data.sender &&
    typeof data.domain === "string" &&
    typeof data.message === "string" &&
    typeof data.timestamp === "number" &&
    typeof data.sender === "string"
  )
}

export function isRecentTimestamp(timestamp: number, maxAgeMs: number = 5 * 60 * 1000): boolean {
  const now = Date.now()
  const age = now - timestamp
  return age >= 0 && age <= maxAgeMs
}

export function sanitizeMessage(message: string): string {
  return message
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .slice(0, 500) // Limit length
}
