import React from "react";
import CategoriesSkeleton from "@/common/Skeletons/Categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { getOptimizedImageUrl, IMAGE_SIZES } from "@/lib/imageUtils";
import { FolderOpen, ArrowRight } from "lucide-react";

interface CategoriesProps {
  subcat: boolean;
  categories: any,
  hideOnPage: boolean;
}

const Categories = ({ categories, hideOnPage, subcat }: CategoriesProps) => {

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {subcat ? "Sub-Categories" : "Categories"}
            </h2>
            <p className="text-gray-600 mt-1">
              {subcat ? "Browse through our sub-categories" : "Explore our product categories"}
            </p>
          </div>
        </div>
        
        {!hideOnPage && (
          <Link href="/category">
            <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-lg">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories?.length > 0 ? (
          categories.map((category: any, index: any) => (
            <Link
              key={index}
              href={`/category/${category.slug}`}
              className="group block"
            >
              <Card className="h-full overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white group-hover:bg-gray-50">
                <div className="relative overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 p-6 flex items-center justify-center">
                    <Image
                      src={getOptimizedImageUrl(category?.image_id, IMAGE_SIZES.CATEGORY)}
                      alt={category?.name || "Category"}
                      width={200}
                      height={200}
                      style={{ objectFit: "contain" }}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  
                  {/* Category count badge */}
                  {category.product_count && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-gray-700 font-medium">
                        {category.product_count} {category.product_count === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors duration-200">
                    {category.name}
                  </h3>
                  
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-sm font-medium">Explore</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="text-gray-400 mb-4">
              <FolderOpen className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories available</h3>
            <p className="text-gray-600">Check back later for new categories!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;