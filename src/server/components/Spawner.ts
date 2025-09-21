import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Lighting, Workspace } from "@rbxts/services";

/** A spawnable thing is defined as either a Model with parts in it, or a single Part */
type SpawnableThing = Model | BasePart;

interface SpawnerInstance extends Model {
	Button: Part & {
		ClickDetector: ClickDetector;
	};
	SpawnLocation: Part;
	"Place thing to be spawned in here": Folder;
}

interface Attributes {}

@Component({
	tag: "Spawner",
})
export class Spawner extends BaseComponent<Attributes, SpawnerInstance> implements OnStart {
	private spawnLocation: CFrame = new CFrame();
	private thingToBeSpawned: SpawnableThing | undefined;

	onStart() {
		this.spawnLocation = this.instance.SpawnLocation.CFrame;
		this.instance.SpawnLocation.Destroy();

		const spawnFolder = this.instance["Place thing to be spawned in here"];
		this.thingToBeSpawned = getSpawnableThing(spawnFolder);
		if (this.thingToBeSpawned) {
			this.thingToBeSpawned.Parent = Lighting;
		}
		spawnFolder.Destroy();

		this.instance.Button.ClickDetector.MouseClick.Connect(() => this.onClick());
	}

	private onClick() {
		if (!this.thingToBeSpawned) return warn("Nothing spawnable was found in the spawn folder");
		const clone = this.thingToBeSpawned.Clone();
		clone.Parent = Workspace;
		clone.PivotTo(this.spawnLocation);
	}
}

/** Finds a spawnable thing, if it exists */
function getSpawnableThing(spawnFolder: Folder): SpawnableThing | undefined {
	const children = spawnFolder.GetChildren();
	if (children.size() === 0) return undefined;

	// If there's a part directly in the folder, return that
	for (const child of children) {
		if (child.IsA("Part")) return child;
	}

	// If there's a model with parts in it, return that
	for (const child of children) {
		if (child.IsA("Model") && child.GetChildren().some((c) => c.IsA("BasePart"))) {
			return child;
		}
	}

	return undefined;
}
