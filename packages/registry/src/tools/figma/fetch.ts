import { promises as fs } from "node:fs"
import * as path from "node:path"
import { tool } from "ai"
import { z } from "zod"
import { extractFigmaStructure, listComponents, listFrames } from "./lib/parser"
import type { ExtractedData, FigmaFile } from "./lib/types"

const FIGMA_API_BASE = "https://api.figma.com/v1"
const FIGMA_CACHE_FILE = ".figma-cache.json"

let cachedFigmaData: ExtractedData | null = null
let currentProjectDir: string | null = null

export function getCachedFigmaData(): ExtractedData | null {
	return cachedFigmaData
}

export function setCachedFigmaData(data: ExtractedData | null): void {
	cachedFigmaData = data
}

export function setProjectDir(dir: string): void {
	currentProjectDir = dir
}

export function getProjectDir(): string {
	return currentProjectDir || process.cwd()
}

/**
 * Load Figma data from the cache file on disk
 */
export async function loadFigmaDataFromDisk(
	projectDir?: string,
): Promise<ExtractedData | null> {
	const dir = projectDir || getProjectDir()
	try {
		const filepath = path.join(dir, FIGMA_CACHE_FILE)
		const content = await fs.readFile(filepath, "utf-8")
		const data = JSON.parse(content) as ExtractedData
		cachedFigmaData = data
		return data
	} catch {
		return null
	}
}

/**
 * Save Figma data to the cache file on disk
 */
async function saveFigmaDataToDisk(
	data: ExtractedData,
	projectDir?: string,
): Promise<void> {
	const dir = projectDir || getProjectDir()
	const filepath = path.join(dir, FIGMA_CACHE_FILE)
	await fs.writeFile(filepath, JSON.stringify(data, null, 2))
}

/**
 * Ensure Figma data is loaded - either from memory cache or disk
 */
export async function ensureFigmaData(
	projectDir?: string,
): Promise<ExtractedData | null> {
	if (cachedFigmaData) {
		return cachedFigmaData
	}
	return loadFigmaDataFromDisk(projectDir)
}

function parseFileKeyFromUrl(urlOrKey: string): string {
	if (!urlOrKey.includes("/")) {
		return urlOrKey
	}

	const patterns = [
		/figma\.com\/file\/([a-zA-Z0-9]+)/,
		/figma\.com\/design\/([a-zA-Z0-9]+)/,
	]

	for (const pattern of patterns) {
		const match = urlOrKey.match(pattern)
		if (match?.[1]) {
			return match[1]
		}
	}

	return urlOrKey
}

async function fetchFigmaFile(
	fileKey: string,
	token: string,
): Promise<FigmaFile> {
	const response = await fetch(`${FIGMA_API_BASE}/files/${fileKey}`, {
		headers: {
			"X-Figma-Token": token,
		},
	})

	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(
			`Figma API error (${response.status}): ${errorText || response.statusText}`,
		)
	}

	return response.json() as Promise<FigmaFile>
}

const description = `Fetch a Figma file and extract its structure for migration.

This tool:
1. Fetches the Figma file from the REST API using FIGMA_TOKEN
2. Extracts all pages, sections, frames, and components
3. Caches the data for subsequent tool calls
4. Returns a summary of what was found

Input can be either:
- A Figma file key (e.g., "abc123XYZ")
- A full Figma URL (e.g., "https://www.figma.com/file/abc123XYZ/My-Design")

After fetching, use the migration tools to process components and pages.`

export function createFigmaFetchTool(figmaToken?: string) {
	return tool({
		description,
		inputSchema: z.object({
			fileKeyOrUrl: z
				.string()
				.describe("The Figma file key or full URL to fetch"),
			skipInvisible: z
				.boolean()
				.default(true)
				.describe("Skip invisible nodes in the design"),
		}),
		outputSchema: z.union([
			z.object({
				status: z.literal("pending"),
				message: z.string(),
			}),
			z.object({
				status: z.literal("success"),
				message: z.string(),
				fileKey: z.string(),
				summary: z.object({
					totalPages: z.number(),
					totalSections: z.number(),
					totalFrames: z.number(),
					totalComponents: z.number(),
					componentsWithDefinition: z.number(),
					topComponents: z.array(
						z.object({
							name: z.string(),
							instanceCount: z.number(),
						}),
					),
				}),
			}),
			z.object({
				status: z.literal("error"),
				message: z.string(),
				error: z.string(),
			}),
		]),
		toModelOutput: (output) => {
			if (output.status === "error") {
				return {
					type: "error-text",
					value: `Figma fetch failed: ${output.error}`,
				}
			}
			if (output.status === "success") {
				const { summary } = output
				const topList = summary.topComponents
					.map((c) => `  - ${c.name} (${c.instanceCount}x)`)
					.join("\n")
				return {
					type: "text",
					value: `Fetched Figma file: ${output.fileKey}

Summary:
- Pages: ${summary.totalPages}
- Sections: ${summary.totalSections}
- Frames: ${summary.totalFrames}
- Components: ${summary.totalComponents} (${summary.componentsWithDefinition} with definitions)

Top components by usage:
${topList}

Use migrationInit to start the migration process.`,
				}
			}
			return { type: "text", value: output.message }
		},
		async *execute({ fileKeyOrUrl, skipInvisible }) {
			const token = figmaToken || process.env.FIGMA_TOKEN

			if (!token) {
				yield {
					status: "error",
					message: "No Figma token provided",
					error:
						"FIGMA_TOKEN environment variable is not set. Please set it to your Figma personal access token.",
				}
				return
			}

			const fileKey = parseFileKeyFromUrl(fileKeyOrUrl)

			yield {
				status: "pending",
				message: `Fetching Figma file ${fileKey}...`,
			}

			try {
				const fileData = await fetchFigmaFile(fileKey, token)
				const extracted = extractFigmaStructure(fileData, { skipInvisible })

				// Cache in memory
				cachedFigmaData = extracted

				// Persist to disk for future sessions
				await saveFigmaDataToDisk(extracted)

				const components = listComponents(extracted)
				const frames = listFrames(extracted)
				const componentsWithDef = components.filter(
					(c) => extracted.components[c.id]?.definition !== null,
				).length

				yield {
					status: "success",
					message: `Successfully fetched and parsed Figma file`,
					fileKey,
					summary: {
						totalPages: extracted.pages.length,
						totalSections: Object.keys(extracted.sections).length,
						totalFrames: frames.length,
						totalComponents: components.length,
						componentsWithDefinition: componentsWithDef,
						topComponents: components.slice(0, 10).map((c) => ({
							name: c.name,
							instanceCount: c.instanceCount,
						})),
					},
				}
			} catch (error) {
				yield {
					status: "error",
					message: `Failed to fetch Figma file`,
					error: error instanceof Error ? error.message : String(error),
				}
			}
		},
	})
}
