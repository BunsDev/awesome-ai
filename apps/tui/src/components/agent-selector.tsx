import { useAtom } from "@lfades/atom"
import type { KeyEvent, ScrollBoxRenderable } from "@opentui/core"
import { useTerminalDimensions } from "@opentui/react"
import { useEffect, useRef } from "react"
import { colors } from "../theme"
import {
	availableAgentsAtom,
	currentAgentAtom,
	inputAtom,
	selectedAgentIndexAtom,
	showAgentSelectorAtom,
} from "./atoms"

export function AgentSelector() {
	const [agents] = useAtom(availableAgentsAtom)
	const [selectedIndex] = useAtom(selectedAgentIndexAtom)
	const [currentAgent] = useAtom(currentAgentAtom)
	const { width, height } = useTerminalDimensions()
	const scrollRef = useRef<ScrollBoxRenderable>(null)
	const panelWidth = 50
	const panelHeight = Math.min(agents.length + 6, 20)

	// Auto-scroll to keep selected item visible
	useEffect(() => {
		if (scrollRef.current && agents.length > 0) {
			const visibleItems = panelHeight - 6
			const scrollTop = Math.max(0, selectedIndex - visibleItems + 1)
			scrollRef.current.scrollTo(scrollTop)
		}
	}, [selectedIndex, agents.length, panelHeight])

	// Refocus input when agent selector closes (scrollbox steals focus)
	useEffect(() => {
		return () => {
			inputAtom.get()?.focus()
		}
	}, [])

	if (agents.length === 0) {
		return (
			<box
				style={{
					position: "absolute",
					top: Math.floor(height / 2) - 4,
					left: Math.floor(width / 2) - Math.floor(panelWidth / 2),
					width: panelWidth,
					height: 8,
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
					<span fg={colors.green}>Select Agent</span>
					<span fg={colors.muted}> (Esc to close)</span>
				</text>
				<box style={{ height: 1 }} />
				<text fg={colors.muted}>No agents found.</text>
				<text fg={colors.muted}>
					Make sure agents.json exists and has agents defined.
				</text>
			</box>
		)
	}

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
				<span fg={colors.green}>Select Agent</span>
				<span fg={colors.muted}> (↑↓ navigate, Enter select, Esc close)</span>
			</text>
			<box style={{ height: 1 }} />
			{currentAgent && (
				<>
					<text fg={colors.muted}>
						Current: <span fg={colors.green}>{currentAgent}</span>
					</text>
					<box style={{ height: 1 }} />
				</>
			)}
			<scrollbox
				ref={scrollRef}
				style={{
					flexGrow: 1,
					contentOptions: {
						backgroundColor: colors.bg,
					},
					scrollbarOptions: {
						showArrows: true,
						trackOptions: {
							foregroundColor: colors.green,
							backgroundColor: colors.bgLight,
						},
					},
				}}
				focused
			>
				{agents.map((agent, i) => (
					<box
						key={agent.name}
						style={{
							height: 1,
							backgroundColor:
								i === selectedIndex ? colors.greenDark : colors.bg,
							paddingLeft: 1,
							paddingRight: 1,
						}}
					>
						<text>
							<span fg={i === selectedIndex ? colors.text : colors.muted}>
								{agent.name === currentAgent ? "● " : "  "}
							</span>
							<span fg={i === selectedIndex ? colors.green : colors.text}>
								{agent.name}
							</span>
						</text>
					</box>
				))}
			</scrollbox>
		</box>
	)
}

/**
 * Handle keyboard input for the agent selector.
 * Returns true if the key was handled.
 */
export function handleAgentSelectorKey(key: KeyEvent): boolean {
	const showSelector = showAgentSelectorAtom.get()
	if (!showSelector) return false

	const agents = availableAgentsAtom.get()
	const selectedIndex = selectedAgentIndexAtom.get()

	switch (key.name) {
		case "up":
			selectedAgentIndexAtom.set(
				selectedIndex > 0 ? selectedIndex - 1 : agents.length - 1,
			)
			return true

		case "down":
			selectedAgentIndexAtom.set(
				selectedIndex < agents.length - 1 ? selectedIndex + 1 : 0,
			)
			return true

		case "return": {
			const selectedAgent = agents[selectedIndex]
			if (selectedAgent) {
				currentAgentAtom.set(selectedAgent.name)
				showAgentSelectorAtom.set(false)
				selectedAgentIndexAtom.set(0)
			}
			return true
		}

		case "escape":
			showAgentSelectorAtom.set(false)
			selectedAgentIndexAtom.set(0)
			return true

		default:
			return false
	}
}
