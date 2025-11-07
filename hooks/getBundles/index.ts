// ERPNext doesn't have bundles concept, so we'll return empty array
// You can implement bundles using ERPNext's Item Groups or custom logic if needed

export const GetBundlesBasedonSkus = async (storeId: string, skus: string[]) => {
    try {
        // ERPNext doesn't have bundles, so return empty array
        // You can implement this using Item Groups or custom logic if needed
        return { bundles: [] };
    } catch (error) {
        console.error('Error fetching bundles from ERPNext:', error);
        return { bundles: [] };
    }
}