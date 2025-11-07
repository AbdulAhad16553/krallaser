export async function GET() {
    try {
        const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
        const data = await response.json();

        return Response.json(data);
    } catch (error) {
        console.error("Error fetching geolocation details:", error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch geolocation details" }),
            { status: 500 }
        );
    }
}