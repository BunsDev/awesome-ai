import { useTerminalDimensions } from "@opentui/react"
import { colors } from "../theme"

const SHORTCUTS = {
	navigation: [
		{ action: "Select agent", keys: ["⌥ A"] },
		{ action: "Toggle shortcuts panel", keys: ["⌥ S"] },
		{ action: "Toggle debug overlay", keys: ["⌥ D"] },
		{ action: "Copy selected text", keys: ["⌥ C"] },
		{ action: "Previous command in history", keys: ["↑"] },
		{ action: "Next command in history", keys: ["↓"] },
		{ action: "Autocomplete command", keys: ["Tab"] },
		{ action: "Send message / execute command", keys: ["Enter"] },
		{ action: "Close panel / clear suggestions", keys: ["Esc"] },
		{ action: "Start command input", keys: ["/"] },
	],
	commands: [
		{ action: "List all available commands", keys: ["/help"] },
		{ action: "Clear terminal history", keys: ["/clear"] },
		{ action: "Summarize conversation", keys: ["/summarize"] },
		{ action: "Export to clipboard", keys: ["/export"] },
		{ action: "Show current timestamp", keys: ["/time"] },
		{ action: "Show version info", keys: ["/version"] },
	],
}

function ShortcutRow({ action, keys }: { action: string; keys: string[] }) {
	return (
		<box
			style={{
				height: 1,
				flexDirection: "row",
				justifyContent: "space-between",
				paddingRight: 1,
			}}
		>
			<text fg={colors.text}>{action}</text>
			<box style={{ flexDirection: "row" }}>
				{keys.map((key, i) => (
					<text key={i}>
						{i > 0 && <span fg={colors.muted}> </span>}
						<span fg={colors.green}>{key}</span>
					</text>
				))}
			</box>
		</box>
	)
}

export function ShortcutsPanel() {
	const { width, height } = useTerminalDimensions()

	const panelHeight =
		SHORTCUTS.navigation.length + SHORTCUTS.commands.length + 8
	const panelWidth = 50

	return (
		<box
			style={{
				position: "absolute",
				top: Math.floor(height / 2) - Math.floor(panelHeight / 2),
				left: Math.floor(width / 2) - Math.floor(panelWidth / 2),
				width: panelWidth,
				height: panelHeight,
				backgroundColor: colors.bg,
				border: true,
				borderStyle: "single",
				borderColor: colors.border,
				paddingLeft: 1,
				paddingRight: 1,
				flexDirection: "column",
			}}
		>
			<text>
				<span fg={colors.green}>Shortcuts</span>
				<span fg={colors.muted}> (⌥ S or Esc to close)</span>
			</text>
			<box style={{ height: 1 }} />
			<text fg={colors.muted}>NAVIGATION</text>
			<box style={{ height: 1 }} />
			{SHORTCUTS.navigation.map((shortcut) => (
				<ShortcutRow
					key={shortcut.action}
					action={shortcut.action}
					keys={shortcut.keys}
				/>
			))}
			<box style={{ height: 1 }} />
			<text fg={colors.muted}>COMMANDS</text>
			<box style={{ height: 1 }} />
			{SHORTCUTS.commands.map((shortcut) => (
				<ShortcutRow
					key={shortcut.action}
					action={shortcut.action}
					keys={shortcut.keys}
				/>
			))}
		</box>
	)
}
