import dotenv from "dotenv";
dotenv.config();

interface ERPNextConfig {
  domain: string;
  apiKey: string;
  apiSecret: string;
}

interface ERPNextResponse<T = any> {
  data: T | null;
  message?: string;
  status?: number;
}

class ERPNextClient {
  private config: ERPNextConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      domain: process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN || "",
      apiKey: process.env.NEXT_PUBLIC_ERPNEXT_API_KEY || "",
      apiSecret: process.env.NEXT_PUBLIC_ERPNEXT_API_SECRET || "",
    };

    if (!this.config.domain || !this.config.apiKey || !this.config.apiSecret) {
      throw new Error(
        "❌ ERPNext configuration missing. Check .env for NEXT_PUBLIC_ERPNEXT_DOMAIN, API_KEY, API_SECRET"
      );
    }

    this.baseUrl = `https://${this.config.domain}/api/resource`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ERPNextResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `token ${this.config.apiKey}:${this.config.apiSecret}`,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        cache: "no-store",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error(`ERPNext API Error ${response.status}:`, err.message);
        return { data: null, status: response.status, message: err.message };
      }

      const json = await response.json();
      return { data: json.data || json, status: response.status };
    } catch (error: any) {
      console.error("ERPNext API Fetch Error:", error.message || error);
      return { data: null, message: error.message, status: 500 };
    }
  }

  // ========================================
  // 🔹 Generic: Get List
  // ========================================
  async getList<T>(
    doctype: string,
    filters?: Record<string, any>,
    fields?: string[],
    limit = 100,
    offset = 0
  ): Promise<ERPNextResponse<T[]>> {
    const params = new URLSearchParams();
    if (filters && Object.keys(filters).length > 0)
      params.append("filters", JSON.stringify(filters));
    if (fields && fields.length > 0)
      params.append("fields", JSON.stringify(fields));
    params.append("limit_page_length", limit.toString());
    params.append("limit_start", offset.toString());

    return this.makeRequest<T[]>(`${doctype}?${params.toString()}`);
  }

  // ========================================
  // 🔹 Generic: Get Single Doc
  // ========================================
  async getDoc<T>(doctype: string, name: string): Promise<ERPNextResponse<T>> {
    return this.makeRequest<T>(`${doctype}/${name}`);
  }
// ========================================
// 🔹 Get Quotations
// ========================================
async getQuotations(filters?: Record<string, any>): Promise<ERPNextResponse<any[]>> {
  const params = new URLSearchParams();
  
  if (filters && Object.keys(filters).length > 0) {
    params.append("filters", JSON.stringify(filters));
  }

  return this.makeRequest<any[]>(`Quotation?${params.toString()}`);
}

// ========================================
// 🔹 Create Quotation
// ========================================
async createQuotation(data: any): Promise<ERPNextResponse<any>> {
  return this.makeRequest<any>("Quotation", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ========================================
// 🔹 Get Sales Orders
// ========================================
async getSalesOrders(filters?: Record<string, any>): Promise<ERPNextResponse<any[]>> {
  const params = new URLSearchParams();
  
  if (filters && Object.keys(filters).length > 0) {
    params.append("filters", JSON.stringify(filters));
  }

  return this.makeRequest<any[]>(`Sales Order?${params.toString()}`);
}

// ========================================
// 🔹 Create Sales Order
// ========================================
async createSalesOrder(data: any): Promise<ERPNextResponse<any>> {
  return this.makeRequest<any>("Sales Order", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

  // ========================================
  // 🔹 Get All Item Groups (Categories)
  // ========================================
  async getItemGroups(): Promise<ERPNextResponse<any[]>> {
    try {
      const { data } = await this.getList<any>(
        "Item Group",
        {},
        ["name", "item_group_name", "parent_item_group", "is_group", "image", "custom__is_website_item"],
        1000
      );

      return { data };
    } catch (error: any) {
      console.error("❌ Error fetching item groups:", error.message);
      return { data: [], message: error.message, status: 500 };
    }
  }

  // ========================================
  // 🔹 Fetch All Products (with Variants + Prices + Item Group)
  // ========================================
  async getDetailedProducts(): Promise<ERPNextResponse<any[]>> {
    try {
      // 1️⃣ Fetch items
      const { data: items } = await this.getList<any>(
        "Item",
        {},
        [
        "name",
        "item_name",
        "item_group",
        "image",
        "description",
        "stock_uom",
        "has_variants",
        "variant_of",
        "attributes",
        "disabled",
        "standard_rate",
        "custom_is_website_item",
        ],
        1000
      );

      if (!items) return { data: [] };

      // 2️⃣ Fetch item groups to attach group name/image
      const { data: groups } = await this.getItemGroups();
      const groupMap = (groups || []).reduce((map: any, g: any) => {
        map[g.name] = g;
        return map;
      }, {});

      // Filter out items flagged as website-only hidden
      const visibleItems = (items || []).filter(
        (item: any) => Number(item.custom_is_website_item) !== 1
      );

      // 3️⃣ Process all items
      const detailedItems = await Promise.all(
        visibleItems.map(async (item) => {
          const groupInfo = groupMap[item.item_group] || {};

          if (item.has_variants) {
            // Fetch variant items
            const { data: variants } = await this.getList<any>(
              "Item",
              { variant_of: item.name },
              [
                "name",
                "item_name",
                "image",
                "stock_uom",
                "description",
                "attributes",
                "standard_rate",
              "custom_is_website_item",
              ],
              500
            );

            // Add prices to variants using standard_rate
            const variantsWithPrices = (variants || [])
              .filter((variant) => Number(variant.custom_is_website_item) !== 1)
              .map((variant) => {
              return {
                ...variant,
                price: variant.standard_rate || null,
                currency: "PKR", // Default currency
              };
            });

            return {
              ...item,
              item_group_name: groupInfo.item_group_name,
              item_group_image: groupInfo.image,
              variants: variantsWithPrices,
            };
          } else {
            // Use standard_rate for single item
            return {
              ...item,
              item_group_name: groupInfo.item_group_name,
              item_group_image: groupInfo.image,
              price: item.standard_rate || null,
              currency: "PKR", // Default currency
            };
          }
        })
      );

      return { data: detailedItems };
    } catch (error: any) {
      console.error("❌ Error fetching detailed products:", error.message);
      return { data: [], message: error.message, status: 500 };
    }
  }

  // ========================================
  // 🔹 Search Products (for ProductService compatibility)
  // ========================================
  async searchProducts(filters?: Record<string, any>): Promise<ERPNextResponse<any[]>> {
    try {
      const { data } = await this.getList<any>(
        "Item",
        filters,
        ["name", "item_name", "item_group", "disabled"],
        100
      );
      return { data: data || [] };
    } catch (error: any) {
      console.error("❌ Error searching products:", error.message);
      return { data: [], message: error.message, status: 500 };
    }
  }

  // ========================================
  // 🔹 Get Single Product (for ProductService compatibility)
  // ========================================
  async getProduct(itemCode: string): Promise<ERPNextResponse<any>> {
    return this.getDoc<any>("Item", itemCode);
  }

  // ========================================
  // 🔹 Get Stock Balance
  // ========================================
  async getStockBalance(filters?: Record<string, any>): Promise<ERPNextResponse<any[]>> {
    try {
      const { data } = await this.getList<any>(
        "Stock Balance",
        filters,
        ["item_code", "warehouse", "actual_qty", "reserved_qty", "projected_qty"],
        1000
      );
      return { data: data || [] };
    } catch (error: any) {
      console.error("❌ Error fetching stock balance:", error.message);
      return { data: [], message: error.message, status: 500 };
    }
  }

  // ========================================
  // 🔹 Get Warehouses
  // ========================================
  async getWarehouses(): Promise<ERPNextResponse<any[]>> {
    try {
      const { data } = await this.getList<any>(
        "Warehouse",
        {},
        ["name", "warehouse_name", "warehouse_type", "parent_warehouse", "company"],
        1000
      );
      return { data: data || [] };
    } catch (error: any) {
      console.error("❌ Error fetching warehouses:", error.message);
      return { data: [], message: error.message, status: 500 };
    }
  }

  // ========================================
  // 🔹 Get Item Stock
  // ========================================
  async getItemStock(itemCode: string): Promise<ERPNextResponse<any[]>> {
    return this.getList("Bin", 
      { item_code: itemCode },
      ["item_code", "warehouse", "actual_qty", "reserved_qty", "projected_qty"],
      100
    );
  }
  async getItemAttachments(itemCode: string): Promise<ERPNextResponse<any[]>> {
    try {
      const params = new URLSearchParams();
      params.append("fields", JSON.stringify(["name", "file_name", "file_url", "attached_to_name", "is_private"]));
      params.append(
        "filters",
        JSON.stringify([
          ["attached_to_doctype", "=", "Item"],
          ["attached_to_name", "=", itemCode]
        ])
      );
  
      return this.makeRequest<any[]>(`File?${params.toString()}`);
    } catch (error: any) {
      console.error("❌ Error fetching attachments:", error.message);
      return { data: [], message: error.message, status: 500 };
    }
  }
  
  // ========================================
  // 🔹 Fetch Full Product Details (Single Product or Template with Variants)
  // ========================================
  async getFullProductDetails(itemCode: string): Promise<ERPNextResponse<any>> {
    try {
      const { data: item } = await this.getDoc<any>("Item", itemCode);
      if (!item) return { data: null, message: "Item not found" };

      // Fetch Item Group details
      const { data: group } = await this.getList<any>(
        "Item Group",
        { name: item.item_group },
        ["name", "item_group_name", "image"],
        1
      );

      const groupInfo = group && group.length > 0 ? group[0] : null;

      let variants = [];
      if (item.has_variants) {
        const { data: variantList } = await this.getList<any>(
          "Item",
          { variant_of: item.name },
          [
            "name",
            "item_name",
            "image",
            "attributes.attribute",
            "attributes.attribute_value",
            "description",
            "stock_uom",
          ],
          200
        );

        // Group variants by name since ERPNext returns each attribute as separate entry
        const variantMap = new Map();
        
        for (const variant of variantList || []) {
          const variantName = variant.name;
          
          if (!variantMap.has(variantName)) {
            const { data: price } = await this.getList<any>(
              "Item Price",
              { item_code: variantName },
              ["price_list_rate", "currency"],
              1
            );
            
            variantMap.set(variantName, {
              name: variantName,
              item_name: variant.item_name,
              image: variant.image,
              description: variant.description,
              stock_uom: variant.stock_uom,
              attributes: [],
              price: price && price.length > 0 ? price[0].price_list_rate : null,
              currency: price && price.length > 0 ? price[0].currency : null,
            });
          }
          
          // Add attribute to the variant
          if (variant.attribute && variant.attribute_value) {
            variantMap.get(variantName).attributes.push({
              attribute: variant.attribute,
              attribute_value: variant.attribute_value
            });
          }
        }
        
        variants = Array.from(variantMap.values());
      }

      // Fetch main item price
      const { data: price } = await this.getList<any>(
        "Item Price",
        { item_code: item.name },
        ["price_list_rate", "currency"],
        1
      );

      return {
        data: {
          ...item,
          item_group_name: groupInfo?.item_group_name,
          item_group_image: groupInfo?.image,
          price:
            price && price.length > 0 ? price[0].price_list_rate : null,
          currency:
            price && price.length > 0 ? price[0].currency : null,
          variants,
        },
      };
    } catch (error: any) {
      console.error("❌ Error fetching full product details:", error.message);
      return { data: null, message: error.message, status: 500 };
    }
  }
}

export const erpnextClient = new ERPNextClient();
export default erpnextClient;
