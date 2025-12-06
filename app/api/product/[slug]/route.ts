// import { NextRequest, NextResponse } from 'next/server';
// import { erpnextClient } from '@/lib/erpnext/erpnextClient';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ slug: string }> }
// ) {
//   try {
//     const { slug } = await params;
    
//     if (!slug) {
//       return NextResponse.json({ error: 'Product slug is required' }, { status: 400 });
//     }

//     // Decode the slug to get the actual item code
//     const itemCode = decodeURIComponent(slug);
    
//     // Fetch full product details from ERPNext
//     const response = await erpnextClient.getFullProductDetails(itemCode);
    
//     if (!response.data) {
//       return NextResponse.json({ error: 'Product not found' }, { status: 404 });
//     }

//     const product = response.data;

//     // Get stock information for the main product
//     let stockInfo = null;
//     try {
//       const { data: stockData } = await erpnextClient.getItemStock(itemCode);
//       if (stockData && stockData.length > 0) {
//         const totalStock = stockData.reduce((total: number, bin: any) => {
//           return total + (bin.actual_qty || 0);
//         }, 0);
//         stockInfo = {
//           totalStock,
//           bins: stockData
//         };
//       }
//     } catch (error) {
//       console.log(`No stock found for ${itemCode}`);
//     }

//     // Get stock information for variants if they exist
//     if (product.variants && product.variants.length > 0) {
//       const variantsWithStock = await Promise.all(
//         product.variants.map(async (variant: any) => {
//           let variantStockInfo = null;
//           try {
//             const { data: variantStockData } = await erpnextClient.getItemStock(variant.name);
//             if (variantStockData && variantStockData.length > 0) {
//               const totalVariantStock = variantStockData.reduce((total: number, bin: any) => {
//                 return total + (bin.actual_qty || 0);
//               }, 0);
//               variantStockInfo = {
//                 totalStock: totalVariantStock,
//                 bins: variantStockData
//               };
//             }
//           } catch (error) {
//             console.log(`No stock found for variant ${variant.name}`);
//           }

//           return {
//             ...variant,
//             stock: variantStockInfo
//           };
//         })
//       );

//       product.variants = variantsWithStock;
//     }

//     return NextResponse.json({
//       success: true,
//       product: {
//         ...product,
//         stock: stockInfo
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching product:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch product' },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { erpnextClient } from '@/lib/erpnext/erpnextClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: 'Product slug is required' }, { status: 400 });
    }

    const itemCode = decodeURIComponent(slug);

    // 1️⃣ Fetch Product Details
    const response = await erpnextClient.getFullProductDetails(itemCode);

    if (!response.data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = response.data;

    // 2️⃣ Fetch Attachments
    let attachments: any[] = [];
    try {
      const attachRes = await erpnextClient.getItemAttachments(itemCode);
      attachments = attachRes?.data ?? [];
    } catch (err) {
      console.log("No attachments found for item:", itemCode);
    }

    // Add attachments to product object
    product.attachments = attachments;

    // 3️⃣ Get stock for main item
    let stockInfo = null;

    try {
      const { data: stockData } = await erpnextClient.getItemStock(itemCode);

      if (stockData && stockData.length > 0) {
        const totalStock = stockData.reduce(
          (total: number, bin: any) => total + (bin.actual_qty || 0),
          0
        );

        stockInfo = {
          totalStock,
          bins: stockData
        };
      }
    } catch (error) {
      console.log(`No stock found for ${itemCode}`);
    }

    // 4️⃣ Get stock for variants
    if (product.variants && product.variants.length > 0) {
      const variantsWithStock = await Promise.all(
        product.variants.map(async (variant: any) => {
          let variantStockInfo = null;
          try {
            const { data: variantStockData } = await erpnextClient.getItemStock(variant.name);

            if (variantStockData && variantStockData.length > 0) {
              const totalVariantStock = variantStockData.reduce(
                (total: number, bin: any) => total + (bin.actual_qty || 0),
                0
              );

              variantStockInfo = {
                totalStock: totalVariantStock,
                bins: variantStockData
              };
            }
          } catch (error) {
            console.log(`No stock found for variant ${variant.name}`);
          }

          return {
            ...variant,
            stock: variantStockInfo
          };
        })
      );

      product.variants = variantsWithStock;
    }

    // 5️⃣ Return Response
    return NextResponse.json({
      success: true,
      product: {
        ...product,
        stock: stockInfo,
        attachments
      }
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
