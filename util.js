export function splitAtFirstSpace(str){
	const index = str.indexOf(' ');
	if (index < 0) return [str, ''];
	return [str.substring(0, index), str.substring(index + 1)];
}

export async function fetchData(url){
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error(error.message);
  }
}

export function removeElementsByClass(className) {
    let elements = document.getElementsByClassName(className);
    while(elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}
