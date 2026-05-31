export interface ERPNextSocialLink {
  platform_name: string;
  social_link: string;
}

export const getSocialLink = async (_storeId: string) => {
  return { socialLinks: [] as ERPNextSocialLink[] };
};
