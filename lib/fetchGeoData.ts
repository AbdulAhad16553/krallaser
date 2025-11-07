export const fetchGeoData = async () => {
    try {
        const response = await fetch("/api/geo");
        const data = await response.json();

        return data
    } catch (error) {
        console.error("Error fetching geolocation details:", error);
    }
}