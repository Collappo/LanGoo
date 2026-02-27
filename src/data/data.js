/**
 * Linguist - Data Structure Reference
 * 
 * This application uses a modular data structure stored in LocalStorage.
 * 
 * WordSet:
 * {
 *   id: string,
 *   name: string,
 *   langA: string, // Source language (e.g. "Polski")
 *   langB: string, // Target language (e.g. "Angielski")
 *   createdAt: number,
 *   words: [
 *     {
 *       id: string,
 *       wordA: string,
 *       wordB: string,
 *       extra?: string
 *     }
 *   ]
 * }
 * 
 * The app provides an Import/Export feature in the settings to manage this data as JSON.
 */

export const dataStructureInfo = "Refer to src/types.ts for full TypeScript definitions.";
