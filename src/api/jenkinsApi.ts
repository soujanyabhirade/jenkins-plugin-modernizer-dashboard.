export async function fetchPlugins() {
    const response = await fetch("https://plugins.jenkins.io/api/plugins");

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // The API returns an object with a 'plugins' array
    const data = await response.json();
    return data;
}
