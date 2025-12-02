import { useAtom } from "@lfades/atom"
import type { MutableRefObject } from "react"
import { useState } from "react"
import { colors } from "../theme"
import type { Command } from "../types"
import { inputAtom, showCommandsAtom } from "./atoms"

interface CommandState {
	showCommands: boolean
	filteredCommands: Omit<Command, "action">[]
	selectedCommand: number
}

interface InputAreaProps {
	stateRef: MutableRefObject<CommandState>
	onSubmit: (value: string) => void
	onInputChange: (value: string) => void
	onSelectCommand: (index: number) => void
	onCloseCommands: () => void
	onNavigateUp: () => void
	onNavigateDown: () => void
	onFilterChange: (value: string) => void
}

// Custom key bindings: Enter = submit, Shift+Enter = newline
const chatKeyBindings = [
	{ name: "return", action: "submit" as const },
	{ name: "return", shift: true, action: "newline" as const },
]

// Max lines before scrolling within textarea
const MAX_INPUT_LINES = 10

export function InputArea({
	stateRef,
	onSubmit,
	onInputChange,
	onSelectCommand,
	onCloseCommands,
	onNavigateUp,
	onNavigateDown,
	onFilterChange,
}: InputAreaProps) {
	const [showCommands] = useAtom(showCommandsAtom)
	const [lineCount, setLineCount] = useState(1)

	const handleSubmit = () => {
		const input = inputAtom.get()
		if (input) {
			const value = input.plainText
			onSubmit(value)
			setLineCount(1) // Reset after submit
		}
	}

	const updateLineCount = () => {
		const input = inputAtom.get()
		if (input) {
			const text = input.plainText
			const lines = Math.max(1, (text.match(/\n/g) || []).length + 1)
			setLineCount(Math.min(lines, MAX_INPUT_LINES))
		}
	}

	// Height = lines + 2 for border
	const boxHeight = lineCount + 2

	return (
		<box
			style={{
				height: boxHeight,
				border: true,
				borderStyle: "single",
				borderColor: showCommands ? colors.green : colors.border,
				paddingLeft: 1,
				flexDirection: "row",
				alignItems: "flex-start",
			}}
		>
			<text fg={colors.green} style={{ width: 2, height: 1 }}>
				❯
			</text>
			<textarea
				ref={(ref) => {
					inputAtom.set(ref)
				}}
				placeholder="enter command ... (shift+enter for new line)"
				focused
				keyBindings={chatKeyBindings}
				onSubmit={handleSubmit}
				onKeyDown={(key) => {
					// Track input changes and line count after key processing
					queueMicrotask(() => {
						const input = inputAtom.get()
						if (input) {
							onInputChange(input.plainText)
							updateLineCount()
						}
					})
					const {
						showCommands: isShowing,
						filteredCommands: cmds,
						selectedCommand: sel,
					} = stateRef.current

					if (isShowing && cmds.length > 0) {
						if (key.name === "up") {
							key.preventDefault()
							onNavigateUp()
							return
						}
						if (key.name === "down") {
							key.preventDefault()
							onNavigateDown()
							return
						}
						if (key.name === "tab" || key.name === "return") {
							key.preventDefault()
							onSelectCommand(sel)
							return
						}
						if (key.name === "escape") {
							key.preventDefault()
							onCloseCommands()
							return
						}
					}

					// Delete word with option/alt + backspace
					if (key.name === "backspace" && (key.option || key.meta)) {
						key.preventDefault()
						const input = inputAtom.get()
						if (input) {
							input.deleteWordBackward()
							onFilterChange(input.plainText)
						}
					}
				}}
				backgroundColor={colors.bg}
				focusedBackgroundColor={colors.bg}
				textColor={colors.text}
				focusedTextColor={colors.text}
				style={{ flexGrow: 1, minHeight: 1 }}
			/>
		</box>
	)
}
