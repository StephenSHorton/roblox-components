import { Component, BaseComponent, Components } from "@flamework/components";
import { Dependency, OnStart, OnTick } from "@flamework/core";
import { Weldable } from "./Weldable";
import { TweenService, Workspace } from "@rbxts/services";

interface SweeperInstance extends Model {
	Root: Part;
	Antenna: Model & {
		IndicatorLight: Part & {
			WeldConstraint: WeldConstraint;
		};
		Part: Part & {
			WeldConstraint: WeldConstraint;
		};
	};
}

interface Attributes {}

type SweeperState = "Idle" | "Sweeping" | "ReturningToBase";

@Component({
	tag: "Sweeper",
})
export class Sweeper extends BaseComponent<Attributes, SweeperInstance> implements OnTick {
	private state: SweeperState = "Idle";

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

		// Move towards the item
		this.moveTo(new CFrame(item.instance.Position));

		// Collect the item

		// Store the item on a shelf

		// Return to base
	}

	private findSweepableItem(): Weldable | undefined {
		const sweepableItem = Workspace.FindFirstChild("SweepableItem");
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
}
