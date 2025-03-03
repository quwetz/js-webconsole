export function splitAtFirstSpace(str){
	const index = str.indexOf(' ');
	if (index < 0) return [str, ''];
	return [str.substring(0, index), str.substring(index + 1)];
}