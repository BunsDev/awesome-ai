import { useAtom } from "@lfades/atom"
import type { InputRenderable } from "@opentui/core"
import type { MutableRefObject, RefObject } from "react"
import { colors } from "../theme"
import type { Command } from "../types"
import { showCommandsAtom } from "./atoms"

interface CommandState {
	showCommands: boolean
	filteredCommands: Omit<Command, "action">[]
	selectedCommand: number
}

interface InputAreaProps {
	inputRef: RefObject<InputRenderable | null>
	stateRef: MutableRefObject<CommandState>
	onSubmit: (value: string) => void
	onInputChange: (value: string) => void
	onSelectCommand: (index: number) => void
	onCloseCommands: () => void
	onNavigateUp: () => void
	onNavigateDown: () => void
	onFilterChange: (value: string) => void
}

export function InputArea({
	inputRef,
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

	return (
		<box
			style={{
				height: 3,
				marginLeft: 1,
				marginRight: 1,
				marginBottom: 0,
				border: true,
				borderStyle: "single",
				borderColor: showCommands ? colors.green : colors.border,
				paddingLeft: 1,
				flexDirection: "row",
			}}
		>
			<text fg={colors.green} style={{ width: 2 }}>
				❯
			</text>
			<input
				ref={inputRef}
				placeholder="enter command ..."
				focused
				onSubmit={onSubmit}
				onInput={onInputChange}
				onKeyDown={(key) => {
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
						if (inputRef.current) {
							const value = inputRef.current.value
							const lastSpaceIndex = value.trimEnd().lastIndexOf(" ")
							const newValue =
								lastSpaceIndex > 0 ? value.substring(0, lastSpaceIndex + 1) : ""
							inputRef.current.value = newValue
							inputRef.current.cursorPosition = newValue.length
							onFilterChange(newValue)
						}
					}
				}}
				backgroundColor={colors.bg}
				focusedBackgroundColor={colors.bg}
				textColor={colors.text}
				focusedTextColor={colors.text}
				placeholderColor={colors.muted}
				cursorColor={colors.green}
				style={{ flexGrow: 1 }}
			/>
		</box>
	)
}
