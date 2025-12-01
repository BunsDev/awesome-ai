export interface Message {
	role: "user" | "assistant" | "system"
	content: string
	timestamp: string
}

export interface Command {
	name: string
	description: string
	action: () => void
}

export function getTimestamp(): string {
	const now = new Date()
	return `[${now.toLocaleTimeString("en-US", { hour12: false })}]`
}
