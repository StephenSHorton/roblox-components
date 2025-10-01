import { Networking } from "@flamework/networking";

interface ClientToServerEvents {
	OnEarthKick: (characterCFrame: CFrame) => void;
	OnEarthWallKick: (characterCFrame: CFrame) => void;
}

interface ServerToClientEvents {}

interface ClientToServerFunctions {}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
