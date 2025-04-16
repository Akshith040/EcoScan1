
/**
 * Represents recycling instructions for a specific waste type.
 */
export interface RecyclingInstructions {
  /**
   * The type of waste material (e.g., "cardboard", "plastic bottle").
   */
  wasteType: string;
  /**
   * Detailed instructions on how to recycle the waste material.
   */
  instructions: string[];
}

/**
 * Asynchronously retrieves recycling instructions for a given waste type.
 *
 * @param wasteType The type of waste material to get instructions for.
 * @returns A promise that resolves to a RecyclingInstructions object.
 */
export async function getRecyclingInstructions(
  wasteType: string
): Promise<RecyclingInstructions> {
  // TODO: Implement this by calling an API or accessing a database.

  switch (wasteType.toLowerCase()) {
    case "cardboard":
      return {
        wasteType: "Cardboard",
        instructions: [
          "1. Flatten the cardboard to save space in the recycling bin. This also makes it easier for recycling facilities to process the material efficiently.",
          "2. Remove any non-cardboard materials such as packing tape, labels, or plastic liners. These contaminants can reduce the quality of recycled cardboard.",
          "3. Ensure the cardboard is dry and free from food residue or grease. Contaminated cardboard can't be recycled and can spoil entire batches of recycling.",
          "4. Place the flattened cardboard in the BLUE recycling bin designated for paper and cardboard. If your local area uses a different color for recycling, ensure you use the correct one.",
          "5. For large cardboard boxes, break them down completely before placing them in the bin. If the bin is full, consider taking them to a local recycling center.",
          "6. If the cardboard is waxed or coated, it may not be recyclable. Check local guidelines or with your waste management provider.",
        ],
      };
    case "plastic bottle":
      return {
        wasteType: "Plastic Bottle",
        instructions: [
          "1. Rinse the plastic bottle thoroughly to remove any liquid or food residue. This prevents contamination of other recyclables.",
          "2. Remove the cap and recycle it separately if your local recycling program accepts it (often in the same BLUE bin). If not accepted, dispose of it in the general waste bin, as caps are often made of different plastic.",
          "3. Crush the bottle to save space in the recycling bin. This allows for more efficient transportation and processing.",
          "4. Place the rinsed and crushed plastic bottle in the BLUE recycling bin. If your local area uses a different color for recycling, ensure you use the correct one.",
          "5. Ensure the bottle is made of recyclable plastic (usually indicated by a recycling symbol with a number inside, typically #1 or #2).",
          "6. Remove any plastic sleeves or labels if easily removable. If not, it's generally okay to leave them on.",
        ],
      };
    case "glass bottle":
      return {
        wasteType: "Glass Bottle",
        instructions: [
          "1. Rinse the glass bottle to remove any remaining contents. This reduces odors and prevents residue from affecting the recycling process.",
          "2. Remove the cap or lid and recycle separately if accepted (check local guidelines). Metal caps can often be recycled, while plastic lids may need to go in the trash.",
          "3. Remove any labels if possible to improve the recycling process. However, if labels are difficult to remove, it is acceptable to leave them on.",
          "4. Place the rinsed glass bottle in the BLUE recycling bin. Some regions may have separate bins for glass, so check local guidelines. Be aware of whether clear, green, and brown glass need to be separated.",
          "5. Handle glass bottles carefully to avoid breakage. Broken glass can be hazardous and may not be accepted at recycling facilities.",
          "6. Do not recycle broken glassware, such as drinking glasses or cookware, as they are made from different types of glass and can contaminate the recycling stream.",
        ],
      };
    case "aluminum can":
      return {
        wasteType: "Aluminum Can",
        instructions: [
          "1. Rinse the aluminum can to remove any residue. This helps prevent odors and contamination.",
          "2. Crush the can to save space in the recycling bin. Crushed cans are more efficient to transport and process.",
          "3. Place the rinsed and crushed aluminum can in the BLUE recycling bin. Some regions may have separate bins for aluminum, so check local guidelines.",
          "4. Avoid mixing aluminum cans with other types of metal. If you have large quantities of scrap metal, consider taking them to a dedicated metal recycling center.",
          "5. Remove any non-aluminum parts, such as steel bottoms on some older cans. These are rare but can contaminate the recycling process.",
        ],
      };
    case "paper":
      return {
        wasteType: "Paper",
        instructions: [
          "1. Make sure the paper is dry and clean. Wet or soiled paper cannot be recycled.",
          "2. Remove any non-paper materials such as plastic coatings, stickers, or tape. These contaminants can affect the quality of recycled paper.",
          "3. Place the clean and dry paper in the BLUE recycling bin.",
          "4. Shredded paper should be placed in a paper bag or container to prevent it from scattering. Loose shredded paper is difficult to handle at recycling facilities.",
          "5. Avoid recycling paper that is heavily soiled or contaminated with food. This includes greasy pizza boxes and used paper towels.",
          "6. Glossy or coated paper (like magazines) can often be recycled, but check with your local recycling program for specific guidelines.",
        ],
      };
    default:
      return {
        wasteType: wasteType,
        instructions: [
          "1. Check with your local recycling center for specific instructions, as guidelines can vary significantly by location.",
          "2. General guidelines may include rinsing the item and removing any non-recyclable materials.",
          "3. Sort the item according to your local recycling program's categories (e.g., plastics, metals, glass).",
          "4. Place the item in the appropriate recycling bin, typically BLUE in color, but confirm with local guidelines. Some areas use green, yellow, or other colors.",
          "5. If unsure, it's better to dispose of the item in the general waste (BLACK bin) to avoid contaminating recyclable materials. Contamination can lead to entire batches of recycling being rejected.",
          "6. When in doubt, search online for your local waste management provider's website. They usually have detailed guides on what can and cannot be recycled.",
        ],
      };
  }
}
