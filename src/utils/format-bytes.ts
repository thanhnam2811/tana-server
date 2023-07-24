const units = ['B', 'KB', 'MB', 'GB', 'TB'];

const formatBytes = (bytes: number, decimals = 2) => {
	if (bytes === 0) return '0 B';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;

	let unitIndex = 0;
	while (bytes >= k && unitIndex < units.length - 1) {
		bytes /= k;
		unitIndex++;
	}

	return `${parseFloat(bytes.toFixed(dm))} ${units[unitIndex]}`;
};

export default formatBytes;
