import { atom } from "@lfades/atom"
import { getTimestamp, type Message } from "../types"

export const messagesAtom = atom<Message[]>([
	{
		role: "system",
		content: `agent v1.0.0 initialized. ready for input.`,
		timestamp: getTimestamp(),
	},
])

export const isLoadingAtom = atom(false)
export const showDebugAtom = atom(false)
export const debugLogsAtom = atom<string[]>([])
export const selectedModelAtom = atom("claude-sonnet-4-20250514")
export const showCommandsAtom = atom(false)
export const commandFilterAtom = atom("")
export const selectedCommandAtom = atom(0)
export const showShortcutsAtom = atom(false)

export function debug(...args: unknown[]) {
	const msg = args
		.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
		.join(" ")

	debugLogsAtom.set([...debugLogsAtom.get().slice(-99), msg])
}
