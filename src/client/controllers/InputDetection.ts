import { Controller, OnStart } from "@flamework/core";
import { ContextActionService, Players, UserInputService } from "@rbxts/services";
import { Events } from "client/network";

@Controller({})
export class InputDetection implements OnStart {
	private player = Players.LocalPlayer;
	private playerCharacter = this.player.Character || this.player.CharacterAdded.Wait()[0];

	onStart() {
		UserInputService.InputBegan.Connect((input) => {
			this.onUserInputBegin(input);
		});
	}

	private onUserInputBegin(input: InputObject) {
		switch (input.KeyCode) {
			case Enum.KeyCode.Q:
				this.earthWallKick();
				break;
			case Enum.KeyCode.F:
				this.earthKick();
		}
	}

	private earthKick() {
		if (!this.playerCharacter) return;

		const characterCFrame = this.playerCharacter.GetPivot();
		Events.OnEarthKick.fire(characterCFrame);
	}

	private earthWallKick() {
		if (!this.playerCharacter) return;

		const characterCFrame = this.playerCharacter.GetPivot();
		Events.OnEarthWallKick.fire(characterCFrame);
	}
}
