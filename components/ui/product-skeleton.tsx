import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left Column - Enhanced Product Gallery */}
        <div className="space-y-4">
          {/* Main Product Image */}
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>

          {/* Thumbnail Images */}
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-lg" />
            ))}
          </div>

          {/* Social Proof Below Images */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>

        {/* Right Column - Enhanced Product Information */}
        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                {/* Product Title and Badges */}
                <div className="space-y-3">
                  <Skeleton className="h-9 w-3/4" />

                  <div className="flex items-center gap-3">
                    {/* SKU Display */}
                    <div className="text-sm">
                      <Skeleton className="h-4 w-20" />
                    </div>

                    {/* Product Type Badge */}
                    <Skeleton className="h-6 w-24 rounded-full" />

                    {/* New Arrival Badge */}
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>

                {/* Price Section */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-md" />
              </div>
            </div>

            {/* Stock & Urgency */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>

              {/* Stock Level Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>

              {/* Variable Product Stock Info */}
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          {/* Product Variants/Options */}
          <div className="space-y-4">
            <Skeleton className="h-px w-full" />
            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-10 w-20 rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <Skeleton className="h-px w-full" />
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <div className="flex items-center border rounded-md">
                  <Skeleton className="h-10 w-10 rounded-l-md" />
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 w-10 rounded-r-md" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>
          </div>

          {/* Quote Request for B2B */}
          <div className="space-y-3">
            <div className="text-center">
              <Skeleton className="h-4 w-64 mx-auto mb-2" />
              <Skeleton className="h-32 w-full rounded-md" />
            </div>
            <Skeleton className="h-3 w-80 mx-auto" />
          </div>

          {/* Trust Signals */}
          <div className="space-y-3">
            <Skeleton className="h-px w-full" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-3 bg-muted/30 rounded-md"
                >
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Specs */}
          <div className="space-y-3">
            <Skeleton className="h-px w-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Product Details Tabs */}
      <div className="mt-12">
        {/* Tab Headers */}
        <div className="grid w-full grid-cols-6 gap-1 p-1 bg-muted rounded-lg">
          {[
            "Overview",
            "Specifications",
            "Reviews",
            "Shipping",
            "Support",
            "Quote Request",
          ].map((tab) => (
            <Skeleton key={tab} className="h-10 w-full rounded-md" />
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Overview Tab */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />

                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-4 w-64" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-4 w-20 mt-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications Tab */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Tab */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Reviews Summary */}
            <div className="p-6 border rounded-lg">
              <div className="text-center space-y-4">
                <Skeleton className="h-8 w-16 mx-auto" />
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-5 w-5 rounded" />
                  ))}
                </div>
                <Skeleton className="h-4 w-32 mx-auto" />

                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-2 flex-1 rounded-full" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-24 rounded-md" />
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((review) => (
                  <div key={review} className="p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Skeleton key={i} className="h-3 w-3 rounded" />
                            ))}
                          </div>
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping Tab */}
          <div className="p-6 border rounded-lg">
            <div className="space-y-6">
              <Skeleton className="h-6 w-40" />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-28" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-4 w-48" />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-4 w-40" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Tab */}
          <div className="p-6 border rounded-lg">
            <div className="space-y-6">
              <Skeleton className="h-6 w-36" />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-4 w-44" />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-4 w-44" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Request Tab */}
          <div className="p-6 border rounded-lg">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <Skeleton className="h-6 w-48 mx-auto" />
                <Skeleton className="h-4 w-96 mx-auto" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-4 w-44" />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-5 w-28" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-4 w-44" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Skeleton className="h-4 w-80 mx-auto mb-4" />
                <Skeleton className="h-32 w-full rounded-md" />
              </div>

              {/* Quote Process Steps */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="text-center">
                      <Skeleton className="w-8 h-8 rounded-full mx-auto mb-2" />
                      <Skeleton className="h-4 w-20 mx-auto mb-1" />
                      <Skeleton className="h-3 w-24 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-80 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((product) => (
            <div key={product} className="border rounded-lg overflow-hidden">
              {/* Product Image */}
              <div className="relative aspect-square">
                {/* Main image placeholder */}
                <Skeleton className="h-full w-full" />
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                {/* Quick Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-3 w-3 rounded" />
                    ))}
                  </div>
                  <Skeleton className="h-3 w-8" />
                </div>

                {/* Product Name */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />

                {/* Price */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>

                {/* Stock Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Skeleton className="h-10 w-32 mx-auto rounded-md" />
        </div>
      </div>
    </div>
  );
}
