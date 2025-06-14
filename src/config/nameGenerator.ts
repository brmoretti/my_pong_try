export async function getRandomPlayerName(): Promise<string> {
	const response = await fetch('/player_names.csv');
	const csvText = await response.text();
	const lines = csvText.trim().split('\n').slice(1);
	const adjectives: string[] = [];
	const substantives: string[] = [];
	for (const line of lines) {
		const [adj, sub] = line.split(',').map(s => s.trim());
		if (adj && sub) {
			adjectives.push(adj);
			substantives.push(sub);
		}
	}
	const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
	const sub = substantives[Math.floor(Math.random() * substantives.length)];
	return `${adj} ${sub}`;
}
