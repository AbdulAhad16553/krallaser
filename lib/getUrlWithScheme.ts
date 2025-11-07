export const getUrlWithScheme = (host: string) => {
    if (host.includes(":")) {
        return `http://${host}`;
    } else {
        return `https://${host}`;
    }
}