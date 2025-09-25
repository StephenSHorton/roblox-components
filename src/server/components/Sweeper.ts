import { Component, BaseComponent, Components } from "@flamework/components";
import { Dependency, OnStart, OnTick } from "@flamework/core";
import { Weldable } from "./Weldable";
import { TweenService, Workspace } from "@rbxts/services";
import { Shelf } from "./Shelf";

interface SweeperInstance extends Model {
	Root: Part & {
		Attachment: Attachment;
	};
	Antenna: Model & {
		IndicatorLight: Part & {
			WeldConstraint: WeldConstraint;
		};
		Part: Part & {
			WeldConstraint: WeldConstraint;
		};
	};
	BaseLocation: Part;
}

interface Attributes {}

type SweeperState = "Idle" | "Sweeping" | "ReturningToBase";

@Component({
	tag: "Sweeper",
})
export class Sweeper extends BaseComponent<Attributes, SweeperInstance> implements OnTick, OnStart {
	private state: SweeperState = "Idle";
	private baseLocation: CFrame = new CFrame();

	onStart(): void {
		this.baseLocation = this.instance.BaseLocation.CFrame;
		this.instance.BaseLocation.Destroy();
	}

	onTick() {
		switch (this.state) {
			case "Idle":
				this.sweep();
				break;
			case "Sweeping":
				break;
			case "ReturningToBase":
				// Navigate back to base
				break;
		}
	}

	private sweep() {
		this.state = "Sweeping";
		print("Sweeping...");

		// Find a sweepable item
		const item = this.findSweepableItem();
		if (!item) {
			warn("No sweepable item found");
			this.state = "ReturningToBase";
			return;
		}

		// Mark the item as swept
		const marker = new Instance("BoolValue");
		marker.Name = "AlreadySwept";
		marker.Value = true;
		marker.Parent = item.instance;

		// Move towards the item
		const startPos = this.instance.Root.Position;
		const targetPos = item.instance.GetPivot().Position;
		const direction = targetPos.sub(startPos).Unit;
		const goalPosition = targetPos.sub(direction.mul(2)); // Stop 2 studs away
		this.moveTo(CFrame.lookAt(goalPosition, item.instance.Position));

		// Collect the item
		item.weldTo(this.instance.Root, this.instance.Root.Attachment.WorldCFrame);

		// Store the item on a shelf
		const shelf = this.findAvailableShelf();
		if (!shelf) {
			warn("No available shelf found");
			this.state = "ReturningToBase";
			return;
		}

		const shelfLocation = shelf.instance.GetPivot().Position;
		const currentPos = this.instance.Root.Position;
		const directionToShelf = shelfLocation.sub(currentPos).Unit;
		const approachPosition = shelfLocation.sub(directionToShelf.mul(2)); // Stop 2 studs away
		const flooredY = currentPos.Y; // Align Y to current robot Y
		const actual = new CFrame(approachPosition.X, flooredY, approachPosition.Z).Position;
		const actualOffset = actual.sub(directionToShelf.mul(1)); // Offset by 1 stud
		this.moveTo(CFrame.lookAt(actualOffset, actual));

		item.unWeld();
		const index = shelf.getFreeSlot();
		shelf.storeItem(item.instance, index!);

		// Return to base
		this.state = "ReturningToBase";
		this.moveTo(this.baseLocation);
		this.state = "Idle";
	}

	private findSweepableItem(): Weldable | undefined {
		const sweepableItems = Workspace.GetChildren().filter(
			(child): child is BasePart => child.GetTags().includes("Weldable") && !child.FindFirstChild("AlreadySwept"),
		);
		if (sweepableItems.size() === 0) return undefined;

		// Find closest item
		sweepableItems.sort((a, b) => {
			const distA = a.GetPivot().Position.sub(this.instance.Root.Position).Magnitude;
			const distB = b.GetPivot().Position.sub(this.instance.Root.Position).Magnitude;
			return distA < distB ? false : true;
		});

		const sweepableItem = sweepableItems[0];
		if (!sweepableItem) return undefined;

		const components = Dependency<Components>();
		const weldable = components.getComponent<Weldable>(sweepableItem);

		return weldable;
	}

	private moveTo(cframe: CFrame) {
		const tween = TweenService.Create(this.instance.Root, new TweenInfo(2), { CFrame: cframe });
		tween.Play();

		tween.Completed.Wait();
	}

	private findAvailableShelf() {
		const shelves = getShelves();
		for (const shelf of shelves) {
			if (shelf.getEmptySlots().size() > 0) {
				return shelf;
			}
		}
		return undefined;
	}
}

function getShelves(): Array<Shelf> {
	const shelves: Array<Shelf> = [];
	const components = Dependency<Components>();
	for (const instance of Workspace.GetChildren()) {
		if (instance.IsA("Model") && instance.GetTags().includes("Shelf")) {
			const shelf = components.getComponent<Shelf>(instance);
			if (!shelf) continue;
			shelves.push(shelf);
		}
	}
	return shelves;
}
