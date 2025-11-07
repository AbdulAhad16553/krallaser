import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface PriceRangeFilterProps {
  priceRange: [number, number];
  onPriceRangeChange: (value: [number, number]) => void;
  currency?: string;
}

export default function PriceRangeFilter({
  priceRange,
  onPriceRangeChange,
  currency = "$"
}: PriceRangeFilterProps) {
  const [sliderValue, setSliderValue] = useState<any>(null);
  const [localRange, setLocalRange] = useState<[number, number]>(priceRange);

  useEffect(() => {
    if (!sliderValue && priceRange[1]) {
      setSliderValue(priceRange[1]);
    }
  }, [priceRange]);

  useEffect(() => {
    setLocalRange(priceRange);
  }, [priceRange]);

  const handleSliderChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setLocalRange(newRange);
  };

  const handleApply = () => {
    onPriceRangeChange(localRange);
  };

  const handleReset = () => {
    const resetRange: [number, number] = [0, sliderValue || 0];
    setLocalRange(resetRange);
    onPriceRangeChange(resetRange);
  };

  const formatPrice = (price: number) => {
    return `${currency}${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900">Price Range</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 px-2 text-xs text-gray-600 hover:text-gray-900"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Price Range Display */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPrice(localRange[0])} - {formatPrice(localRange[1])}
          </div>
          <div className="text-sm text-gray-600">
            {localRange[1] - localRange[0] > 0 
              ? `${formatPrice(localRange[1] - localRange[0])} range`
              : "Set your price range"
            }
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-4">
          <Slider
            min={0}
            max={sliderValue}
            step={Math.max(1, Math.floor(sliderValue / 100))}
            value={localRange}
            onValueChange={handleSliderChange as (value: number[]) => void}
            className="w-full cursor-pointer"
          />
          
          {/* Min-Max Labels */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatPrice(0)}</span>
            <span>{formatPrice(sliderValue || 0)}</span>
          </div>
        </div>

        {/* Manual Input Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Min Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                {currency}
              </span>
              <input
                type="number"
                value={localRange[0]}
                onChange={(e) => {
                  const value = Math.max(0, Math.min(Number(e.target.value), localRange[1]));
                  setLocalRange([value, localRange[1]]);
                }}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Max Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                {currency}
              </span>
              <input
                type="number"
                value={localRange[1]}
                onChange={(e) => {
                  const value = Math.max(localRange[0], Math.min(Number(e.target.value), sliderValue || 0));
                  setLocalRange([localRange[0], value]);
                }}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder={String(sliderValue || 0)}
              />
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <Button 
          onClick={handleApply}
          className="w-full bg-primary hover:bg-primary/90 text-white"
          disabled={localRange[0] === priceRange[0] && localRange[1] === priceRange[1]}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
