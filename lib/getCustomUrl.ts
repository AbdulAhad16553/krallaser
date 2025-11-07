export const getCustomUrl = (host: any) => {
    if (host.split(":")[1]) {
        return process.env.NEXT_PUBLIC_STORE_DOMAIN
    } else {
        return host.replace(/^www\./, "");
    }
}