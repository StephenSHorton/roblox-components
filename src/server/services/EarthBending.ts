import { OnStart, Service } from "@flamework/core";
import { TweenService, Workspace, Debris, RunService } from "@rbxts/services";
import { Events } from "server/network";

@Service({})
export class EarthBending implements OnStart {
	onStart() {
		Events.OnEarthKick.connect((player, characterCFrame) => {
			this.onEarthKick(characterCFrame);
		});
	}

	private onEarthKick(characterCFrame: CFrame) {
		const offSetLookVector = characterCFrame.add(characterCFrame.LookVector.mul(3));
		const offSetY = offSetLookVector.sub(new Vector3(0, 5, 0));
		const rotationOffset = offSetY.mul(CFrame.Angles(math.deg(45), 0, 0));
		const offSetUnderground = rotationOffset.add(rotationOffset.UpVector.mul(14));

		const raycastParams = new RaycastParams();
		const raycastResult = Workspace.Raycast(offSetLookVector.Position, new Vector3(0, -5, 0), raycastParams);

		let material: Enum.Material = Enum.Material.Rock;
		let color: BrickColor = new BrickColor("Brown");

		if (raycastResult) {
			const hitPart = raycastResult.Instance;
			material = hitPart.Material;
			color = new BrickColor(hitPart.Color);
		}

		const earthPart = new Instance("Part");
		earthPart.Size = new Vector3(6, 20, 6);
		earthPart.CFrame = offSetUnderground;
		earthPart.Anchored = true;
		earthPart.Material = material;
		earthPart.BrickColor = color;
		earthPart.Parent = Workspace;

		const finalOffSet = offSetUnderground.sub(offSetUnderground.UpVector.mul(22));
		const tween = TweenService.Create(earthPart, new TweenInfo(0.5), {
			CFrame: finalOffSet,
		});
		tween.Play();

		for (let i = 0; i < 6; i++) {
			const rock = new Instance("Part");
			rock.Size = new Vector3(math.random(1, 3), math.random(1, 3), math.random(1, 3));
			rock.Shape = Enum.PartType.Block;
			rock.Material = material;
			rock.BrickColor = color;
			rock.CFrame = offSetUnderground.add(new Vector3(math.random(-2, 2), 0, math.random(-2, 2)));
			rock.Anchored = false;
			rock.CanCollide = true;
			rock.Parent = Workspace;

			const bodyForceDirection = characterCFrame.LookVector.add(
				new Vector3(math.random(-0.2, 0.2), 0.5, math.random(-0.2, 0.2)),
			).Unit;

			rock.AssemblyLinearVelocity = bodyForceDirection.mul(math.random(10, 18));

			Debris.AddItem(rock, 5);
		}
	}
}
