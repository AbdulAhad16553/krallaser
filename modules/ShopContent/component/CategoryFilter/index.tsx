import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Category {
  id: string;
  name: string;
  product_cats: { id: string; name: string }[];
}

interface CategoryFilterProps {
  categories: Category[];
  selectedFilters: { [key: string]: string[] };
  onFilterChange: (
    categoryId: string,
    itemId: string,
    checked: boolean
  ) => void;
}

export default function CategoryFilter({
  categories,
  selectedFilters,
  onFilterChange,
}: CategoryFilterProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const isCategorySelected = (categoryId: string) => {
    return selectedFilters["categories"]?.includes(categoryId);
  };

  const isSubCategorySelected = (categoryId: string, subCategoryId: string) => {
    return selectedFilters["categories"]?.includes(subCategoryId);
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    onFilterChange("categories", categoryId, checked);
    // Also toggle subcategories based on the category selection
    const category = categories.find((cat) => cat.id === categoryId);
    category?.product_cats.forEach((subCategory) => {
      onFilterChange("categories", subCategory.id, checked);
    });
  };

  return (
    <div>
      <h3 className="font-medium mb-4 text-lg">Categories</h3>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id={`${category.id}`}
                  checked={isCategorySelected(category.id)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.id, checked as boolean)
                  }
                  className="text-white"
                />
                <label
                  htmlFor={`${category.id}`}
                  className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category.name}
                </label>
              </div>
              {category?.product_cats?.length > 0 && (
                <p
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  {expandedCategories.includes(category.id) ? (
                    <ChevronUp size={15} />
                  ) : (
                    <ChevronDown size={15} />
                  )}
                </p>
              )}
            </div>
            {expandedCategories.includes(category.id) && (
              <div className="ml-6 space-y-1">
                {category?.product_cats?.map((subCategory) => (
                  <div key={subCategory.id} className="flex items-center">
                    <Checkbox
                      className="text-white"
                      id={`${category.id}-${subCategory.id}`}
                      checked={isSubCategorySelected(
                        category.id,
                        subCategory.id
                      )}
                      onCheckedChange={(checked) =>
                        onFilterChange(
                          "categories",
                          subCategory.id,
                          checked as boolean
                        )
                      }
                    />
                    <label
                      htmlFor={`${category.id}-${subCategory.id}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {subCategory.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
