import { Command } from "commander"
import path from "path"
import { discoverAgents, runTui } from "tui"
import { z } from "zod"
import { getConfig } from "@/src/utils/get-config"
import { handleError } from "@/src/utils/handle-error"
import { logger } from "@/src/utils/logger"

const REQUIRED_AGENTS = ["migration-planning-agent", "migration-agent"] as const

export const migrateOptionsSchema = z.object({
	promptName: z.string().min(1, "Prompt name is required"),
	cwd: z.string(),
})

export const migrate = new Command()
	.name("migrate")
	.description("run a migration with planning and execution agents")
	.argument("<prompt>", "name of the migration prompt to execute")
	.option(
		"-c, --cwd <cwd>",
		"the working directory. defaults to the current directory.",
		process.cwd(),
	)
	.action(async (promptName: string, opts) => {
		try {
			const options = migrateOptionsSchema.parse({
				promptName,
				cwd: path.resolve(opts.cwd),
			})

			// Read agents.json and resolve paths
			const config = await getConfig(options.cwd)

			if (!config) {
				logger.error(
					`agents.json not found in ${options.cwd}. Run 'awesome-ai init' to create one.`,
				)
				process.exit(1)
			}

			const agentsPath = config.resolvedPaths.agents
			const promptsPath = config.resolvedPaths.prompts

			if (!agentsPath) {
				logger.error("Could not resolve agents path from agents.json")
				process.exit(1)
			}

			if (!promptsPath) {
				logger.error("Could not resolve prompts path from agents.json")
				process.exit(1)
			}

			// Discover agents and check that required agents exist
			const agents = await discoverAgents(agentsPath)
			const agentNames = agents.map((a) => a.name)

			const missingAgents = REQUIRED_AGENTS.filter(
				(agent) => !agentNames.includes(agent),
			)

			if (missingAgents.length > 0) {
				logger.error(
					`Missing required agents: ${missingAgents.join(", ")}. Add them with 'awesome-ai add ${missingAgents.join(" ")}'`,
				)
				process.exit(1)
			}

			await runTui({
				agentsPath,
				promptsPath,
				promptName: options.promptName,
				initialAgent: "migration-planning-agent",
				cwd: options.cwd,
			})
		} catch (error) {
			logger.break()
			handleError(error)
		}
	})
