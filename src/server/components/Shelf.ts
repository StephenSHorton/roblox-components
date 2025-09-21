import { BaseComponent, Component } from "@flamework/components";

type StoreableItem = Model | BasePart;
interface ShelfInstance extends Model {
	OpenSpots: Folder;
}
interface Attributes {}

@Component({ tag: "Shelf" })
export class Shelf extends BaseComponent<Attributes, ShelfInstance> {
	private static readonly MAX_ITEMS = 9;
	private storedItems = new Map<number, StoreableItem>();
	private itemWelds = new Map<number, WeldConstraint>();
	private shelfSpots: BasePart[] = [];

	onStart() {
		// Cache the shelf spots in order (assuming they're named like "Spot1", "Spot2", etc.)
		const spots: BasePart[] = [];
		for (let i = 0; i < Shelf.MAX_ITEMS; i++) {
			const spot = this.instance.OpenSpots.FindFirstChild(`Spot${i + 1}`) as BasePart;
			if (spot) {
				spots[i] = spot;
			}
		}

		// If spots aren't named numerically, just get them in the order they appear
		if (spots.filter((s) => s !== undefined).size() === 0) {
			let index = 0;
			this.instance.OpenSpots.GetChildren().forEach((child) => {
				if (child.IsA("BasePart") && index < Shelf.MAX_ITEMS) {
					spots[index] = child;
					index++;
				}
			});
		}

		this.shelfSpots = spots;
	}

	private getSpot(index: number): BasePart | undefined {
		if (index < 0 || index >= Shelf.MAX_ITEMS) {
			return undefined;
		}
		return this.shelfSpots[index];
	}

	private weldItemToSpot(item: StoreableItem, spot: BasePart): WeldConstraint {
		// Get the primary part of the item
		const itemPart = item.IsA("Model") ? item.PrimaryPart : item;
		if (!itemPart) {
			error("Item must have a PrimaryPart if it's a Model");
		}

		// Position the item at the spot
		if (item.IsA("Model")) {
			item.PivotTo(spot.CFrame);
		} else {
			item.CFrame = spot.CFrame;
		}

		// Create and configure the weld
		const weld = new Instance("WeldConstraint");
		weld.Part0 = spot;
		weld.Part1 = itemPart as BasePart;
		weld.Parent = spot;

		// Make the item unanchored so the weld works properly
		if (item.IsA("Model")) {
			item.GetDescendants().forEach((desc) => {
				if (desc.IsA("BasePart")) {
					desc.Anchored = false;
				}
			});
		} else {
			item.Anchored = false;
		}

		return weld;
	}

	public getStoredItems(): StoreableItem[] {
		const items: StoreableItem[] = [];
		this.storedItems.forEach((item) => {
			items.push(item);
		});
		return items;
	}

	public getStoredItemsWithIndices(): Map<number, StoreableItem> {
		const newMap = new Map<number, StoreableItem>();
		this.storedItems.forEach((item, index) => {
			newMap.set(index, item);
		});
		return newMap;
	}

	public getItemAt(index: number): StoreableItem | undefined {
		return this.storedItems.get(index);
	}

	public hasItemAt(index: number): boolean {
		return this.storedItems.has(index);
	}

	public getOccupiedSlots(): number[] {
		const slots: number[] = [];
		this.storedItems.forEach((_, index) => {
			slots.push(index);
		});
		slots.sort((a, b) => a < b);
		return slots;
	}

	public getEmptySlots(): number[] {
		const emptySlots: number[] = [];
		for (let i = 0; i < Shelf.MAX_ITEMS; i++) {
			if (!this.storedItems.has(i)) {
				emptySlots.push(i);
			}
		}
		return emptySlots;
	}

	public storeItem(item: StoreableItem, index: number): StoreableItem | undefined {
		if (index < 0 || index >= Shelf.MAX_ITEMS) {
			return undefined;
		}

		// Check if slot is already occupied
		if (this.storedItems.has(index)) {
			return undefined;
		}

		const spot = this.getSpot(index);
		if (!spot) {
			return undefined;
		}

		// Weld the item to the spot
		const weld = this.weldItemToSpot(item, spot);

		// Store references
		this.storedItems.set(index, item);
		this.itemWelds.set(index, weld);

		// Hide the spot indicator
		spot.Transparency = 1;

		return item;
	}

	public takeItem(index: number): StoreableItem | undefined {
		if (index < 0 || index >= Shelf.MAX_ITEMS) {
			return undefined;
		}

		const item = this.storedItems.get(index);
		const weld = this.itemWelds.get(index);
		const spot = this.getSpot(index);

		if (item && weld && spot) {
			// Destroy the weld
			weld.Destroy();

			// Remove from storage
			this.storedItems.delete(index);
			this.itemWelds.delete(index);

			// Show the spot indicator again (slightly transparent)
			spot.Transparency = 0.5; // Adjust this value based on your preference

			return item;
		}

		return undefined;
	}

	public takeAnyItem(): StoreableItem | undefined {
		// Find the lowest index with an item
		for (let i = 0; i < Shelf.MAX_ITEMS; i++) {
			const item = this.storedItems.get(i);
			if (item) {
				return this.takeItem(i);
			}
		}
		return undefined;
	}

	public clear(): void {
		// Take all items, properly destroying welds
		for (let i = 0; i < Shelf.MAX_ITEMS; i++) {
			this.takeItem(i);
		}
	}

	public getItemCount(): number {
		return this.storedItems.size();
	}

	public isFull(): boolean {
		return this.storedItems.size() >= Shelf.MAX_ITEMS;
	}

	public isEmpty(): boolean {
		return this.storedItems.size() === 0;
	}

	public storeItemInFirstEmptySlot(item: StoreableItem): number | undefined {
		for (let i = 0; i < Shelf.MAX_ITEMS; i++) {
			if (!this.storedItems.has(i)) {
				const result = this.storeItem(item, i);
				if (result) {
					return i;
				}
			}
		}
		return undefined;
	}

	onStop() {
		// Clean up all welds when component is destroyed
		this.clear();
	}
}
