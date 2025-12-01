import { useAtom } from "@lfades/atom"
import {
	createCliRenderer,
	type InputRenderable,
	type ScrollBoxRenderable,
} from "@opentui/core"
import { createRoot, useKeyboard } from "@opentui/react"
import { useCallback, useEffect, useRef } from "react"
import { COMMANDS } from "./commands"
import {
	commandFilterAtom,
	debugLogsAtom,
	isLoadingAtom,
	messagesAtom,
	selectedCommandAtom,
	showCommandsAtom,
	showDebugAtom,
	showShortcutsAtom,
} from "./components/atoms"
import { CommandPalette } from "./components/command-palette"
import { DebugOverlay } from "./components/debug-overlay"
import { Footer } from "./components/footer"
import { Header } from "./components/header"
import { InputArea } from "./components/input-area"
import { MessageList } from "./components/message-list"
import { ShortcutsPanel } from "./components/shortcuts-panel"
import { colors } from "./theme"
import { getTimestamp, type Message } from "./types"

function Chat({ agentName }: { agentName: string }) {
	const [showDebug, setShowDebug] = useAtom(showDebugAtom)
	const [showShortcuts] = useAtom(showShortcutsAtom)
	const [showCommands, setShowCommands] = useAtom(showCommandsAtom)
	const [commandFilter, setCommandFilter] = useAtom(commandFilterAtom)
	const [selectedCommand, setSelectedCommand] = useAtom(selectedCommandAtom)
	const inputRef = useRef<InputRenderable>(null)
	const commandScrollRef = useRef<ScrollBoxRenderable>(null)

	// Filter commands based on input
	const filteredCommands = COMMANDS.filter((cmd) =>
		cmd.name.toLowerCase().includes(commandFilter.toLowerCase()),
	)

	// Keep refs updated for keyboard handler
	const stateRef = useRef({ showCommands, filteredCommands, selectedCommand })
	stateRef.current = { showCommands, filteredCommands, selectedCommand }

	// Scroll to keep selected command visible
	const maxVisibleItems = 10
	useEffect(() => {
		if (commandScrollRef.current && showCommands) {
			const scrollTop = Math.max(0, selectedCommand - maxVisibleItems + 1)
			commandScrollRef.current.scrollTo(scrollTop)
		}
	}, [selectedCommand, showCommands])

	// Keep selectedCommand in bounds when filter changes
	useEffect(() => {
		if (
			selectedCommand >= filteredCommands.length &&
			filteredCommands.length > 0
		) {
			setSelectedCommand(filteredCommands.length - 1)
		}
	}, [filteredCommands.length, selectedCommand, setSelectedCommand])

	const debugLog = useCallback((...args: unknown[]) => {
		const msg = args
			.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
			.join(" ")
		debugLogsAtom.set([...debugLogsAtom.get().slice(-99), msg])
	}, [])

	const executeCommand = useCallback(
		(commandName: string) => {
			const addSystemMessage = (content: string) => {
				messagesAtom.set([
					...messagesAtom.get(),
					{ role: "system", content, timestamp: getTimestamp() },
				])
			}

			switch (commandName) {
				case "/help":
					addSystemMessage(
						`Available commands:\n${COMMANDS.map((c) => `  ${c.name} - ${c.description}`).join("\n")}`,
					)
					break
				case "/clear":
					messagesAtom.set([
						{
							role: "system",
							content: "Terminal cleared.",
							timestamp: getTimestamp(),
						},
					])
					break
				case "/summarize":
					addSystemMessage("Summarizing conversation... (not implemented)")
					break
				case "/export":
					addSystemMessage("Exporting conversation... (not implemented)")
					break
				case "/time":
					addSystemMessage(`Current time: ${new Date().toLocaleString()}`)
					break
				case "/version":
					addSystemMessage(`Agent: ${agentName}\nVersion: 1.0.0`)
					break
				default:
					addSystemMessage(`Unknown command: ${commandName}`)
			}
		},
		[agentName],
	)

	const selectCommand = useCallback(
		(index: number) => {
			const command = filteredCommands[index]
			if (command && inputRef.current) {
				inputRef.current.value = `${command.name} `
				inputRef.current.cursorPosition = command.name.length + 1
				setShowCommands(false)
				setCommandFilter("")
				setSelectedCommand(0)
			}
		},
		[filteredCommands, setShowCommands, setCommandFilter, setSelectedCommand],
	)

	useKeyboard((key) => {
		if (key.name === "f12" || key.name === "`") {
			setShowDebug(!showDebugAtom.get())
			return
		}

		// ? to toggle shortcuts panel
		if (key.name === "?") {
			showShortcutsAtom.set(!showShortcutsAtom.get())
			return
		}

		// Escape to close shortcuts panel
		if (key.name === "escape" && showShortcutsAtom.get()) {
			showShortcutsAtom.set(false)
			return
		}

		if (showDebug) {
			debugLog(
				"Key:",
				key.name,
				"opt:",
				key.option,
				"meta:",
				key.meta,
				"ctrl:",
				key.ctrl,
			)
		}
	})

	const handleSubmit = useCallback(
		async (value: string) => {
			const isLoading = isLoadingAtom.get()
			if (!value.trim() || isLoading) return

			if (inputRef.current) {
				inputRef.current.value = ""
				inputRef.current.cursorPosition = 0
			}

			setShowCommands(false)
			setCommandFilter("")
			setSelectedCommand(0)

			if (value.startsWith("/")) {
				const commandName = value.split(" ")[0]
				executeCommand(commandName)
				return
			}

			const userMessage: Message = {
				role: "user",
				content: value,
				timestamp: getTimestamp(),
			}
			messagesAtom.set([...messagesAtom.get(), userMessage])
			isLoadingAtom.set(true)

			setTimeout(() => {
				const assistantMessage: Message = {
					role: "assistant",
					content: `Echo: ${value}`,
					timestamp: getTimestamp(),
				}
				messagesAtom.set([...messagesAtom.get(), assistantMessage])
				isLoadingAtom.set(false)
			}, 500)
		},
		[executeCommand, setShowCommands, setCommandFilter, setSelectedCommand],
	)

	const handleInputChange = useCallback(
		(value: string) => {
			if (value.startsWith("/")) {
				if (!stateRef.current.showCommands) {
					setSelectedCommand(0)
				}
				setShowCommands(true)
				setCommandFilter(value)
			} else {
				setShowCommands(false)
				setCommandFilter("")
				setSelectedCommand(0)
			}
		},
		[setShowCommands, setCommandFilter, setSelectedCommand],
	)

	const handleNavigateUp = useCallback(() => {
		const { filteredCommands: cmds, selectedCommand: sel } = stateRef.current
		const newVal = sel > 0 ? sel - 1 : cmds.length - 1
		stateRef.current.selectedCommand = newVal
		setSelectedCommand(newVal)
	}, [setSelectedCommand])

	const handleNavigateDown = useCallback(() => {
		const { filteredCommands: cmds, selectedCommand: sel } = stateRef.current
		const newVal = sel < cmds.length - 1 ? sel + 1 : 0
		stateRef.current.selectedCommand = newVal
		setSelectedCommand(newVal)
	}, [setSelectedCommand])

	const handleCloseCommands = useCallback(() => {
		setShowCommands(false)
		setCommandFilter("")
		if (inputRef.current) {
			inputRef.current.value = ""
			inputRef.current.cursorPosition = 0
		}
	}, [setShowCommands, setCommandFilter])

	const handleFilterChange = useCallback(
		(value: string) => {
			if (value.startsWith("/")) {
				setCommandFilter(value)
			} else {
				setShowCommands(false)
				setCommandFilter("")
			}
		},
		[setShowCommands, setCommandFilter],
	)

	return (
		<box
			style={{
				flexDirection: "column",
				width: "100%",
				height: "100%",
				backgroundColor: colors.bg,
			}}
		>
			<Header agentName={agentName} />
			<MessageList />

			{showCommands && <CommandPalette scrollRef={commandScrollRef} />}

			<InputArea
				inputRef={inputRef}
				stateRef={stateRef}
				onSubmit={handleSubmit}
				onInputChange={handleInputChange}
				onSelectCommand={selectCommand}
				onCloseCommands={handleCloseCommands}
				onNavigateUp={handleNavigateUp}
				onNavigateDown={handleNavigateDown}
				onFilterChange={handleFilterChange}
			/>

			<Footer />

			{showDebug && <DebugOverlay />}
			{showShortcuts && <ShortcutsPanel />}
		</box>
	)
}

export async function runTui(agentName: string = "coding-agent") {
	const renderer = await createCliRenderer({
		exitOnCtrlC: true,
	})

	createRoot(renderer).render(<Chat agentName={agentName} />)
}

// Allow running directly
const args = process.argv.slice(2)
const agentArg = args[0] || "coding-agent"

runTui(agentArg)
