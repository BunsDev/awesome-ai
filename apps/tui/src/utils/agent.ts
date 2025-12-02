import type { Agent, ModelMessage } from "ai"
import {
	addMessage,
	availableAgentsAtom,
	currentAgentAtom,
	debugLog,
	isLoadingAtom,
	selectedModelAtom,
} from "../components/atoms"
import {
	createAssistantMessage,
	createSystemMessage,
	createUserMessage,
} from "../types"

// Global state for agent and conversation
let currentAgentInstance: Agent | null = null
let conversationMessages: ModelMessage[] = []
let cwdGlobal: string = ""

export function setCwd(cwd: string) {
	cwdGlobal = cwd
}

export function getCwd() {
	return cwdGlobal
}

export function resetConversation() {
	conversationMessages = []
}

export function isAgentLoaded() {
	return currentAgentInstance !== null
}

export async function loadAgent(agentName: string): Promise<boolean> {
	const agents = availableAgentsAtom.get()
	const agentInfo = agents.find((a) => a.name === agentName)

	if (!agentInfo) {
		return false
	}

	try {
		// Dynamically import the agent module
		const agentModule = await import(agentInfo.path)

		// Agents typically export a createAgent function
		if (typeof agentModule.createAgent === "function") {
			const { gateway } = await import("@ai-sdk/gateway")
			const modelId = selectedModelAtom.get()
			const model = gateway(modelId)

			const agent = await agentModule.createAgent({
				model,
				cwd: cwdGlobal,
			})
			currentAgentInstance = agent
			conversationMessages = [] // Reset conversation for new agent
			return true
		}

		// Some agents might export the agent directly
		if (agentModule.default && agentModule.default.version === "agent-v1") {
			currentAgentInstance = agentModule.default
			conversationMessages = []
			return true
		}

		return false
	} catch (error) {
		debugLog(`Failed to load agent ${agentName}:`, error)
		return false
	}
}

export async function sendMessage(userPrompt: string): Promise<void> {
	if (!currentAgentInstance) {
		addMessage(
			createSystemMessage(
				"No agent loaded. Select an agent with /agent or ⌥ A",
			),
		)
		return
	}

	// Add user message
	const userMessage = createUserMessage(userPrompt)
	addMessage(userMessage)
	isLoadingAtom.set(true)

	try {
		// Add user message to conversation history
		const modelUserMessage: ModelMessage = {
			role: "user",
			content: userPrompt,
		}
		conversationMessages.push(modelUserMessage)

		// Stream the agent response
		const result = await currentAgentInstance.stream({
			messages: conversationMessages,
		})

		let reasoningText = ""
		let responseText = ""

		// Create assistant message atom once and keep reference for streaming updates
		const assistantMessage = addMessage(createAssistantMessage("", undefined))

		const updateAssistantMessage = () => {
			const updatedMessage = createAssistantMessage(
				responseText,
				reasoningText || undefined,
			)

			updatedMessage.id = assistantMessage.get().id
			assistantMessage.set(updatedMessage)
		}

		for await (const chunk of result.fullStream) {
			switch (chunk.type) {
				case "reasoning-delta":
					reasoningText += chunk.text
					updateAssistantMessage()
					break

				case "text-delta":
					responseText += chunk.text
					updateAssistantMessage()
					break

				case "tool-call":
					if (!chunk.dynamic) {
						debugLog(`Tool call: ${chunk.toolName}`, chunk.input)
					}
					break

				case "error":
					throw new Error(String(chunk.error))
			}
		}

		// Update conversation messages with the response
		const response = await result.response
		conversationMessages.push(...response.messages)
	} catch (error) {
		addMessage(
			createSystemMessage(
				`Error: ${error instanceof Error ? error.message : String(error)}`,
			),
		)
	} finally {
		isLoadingAtom.set(false)
	}
}

// Subscribe to agent changes and load the agent
currentAgentAtom.sub((agentName) => {
	if (agentName) {
		loadAgent(agentName)
	}
})
