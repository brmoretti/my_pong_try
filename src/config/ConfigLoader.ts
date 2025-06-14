import { Config } from './Config';
import { getRandomPlayerName } from './nameGenerator';

export async function loadConfigFromJson(): Promise<Config> {
	const response = await fetch('/config.json');
	const json = await response.json();

	let player1 = json.player1 || "";
	let player2 = json.player2 || "";

	if (!player1) player1 = await getRandomPlayerName();
	if (!player2) player2 = await getRandomPlayerName();

	return new Config(
		player1,
		player2,
		json.player1IsAI ?? false,
		json.player2IsAI ?? false
	);
}
