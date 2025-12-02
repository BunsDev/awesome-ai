export interface Message {
	role: "user" | "assistant" | "system"
	content: string
	timestamp: string
	thinking?: string // Optional thinking/reasoning content (for assistant messages)
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
