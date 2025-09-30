import { Controller, OnStart } from "@flamework/core";
import { ContextActionService, Players } from "@rbxts/services";
import { Events } from "client/network";

@Controller({})
export class InputDetection implements OnStart {
	onStart() {
		ContextActionService.BindAction("EarthKick", () => this.earthKick(), true, Enum.KeyCode.F);
	}

	private earthKick() {
		const player = Players.LocalPlayer;
		const playerCharacter = player.Character || player.CharacterAdded.Wait()[0];
		if (!playerCharacter) return;

		const characterCFrame = playerCharacter.GetPivot();

		Events.OnEarthKick.fire(characterCFrame);
	}
}
