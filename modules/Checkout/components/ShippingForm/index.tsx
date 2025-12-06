import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// Removed GraphQL dependencies - using mock data for countries/states/cities
import { UseFormRegister, UseFormHandleSubmit, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { ShippingFormFields } from "../.."

interface ShippingFormProps {
    onPaymentMethodChange: (method: "cash" | "card") => void
    isCardPaymentAvailable: boolean
    selectedPaymentMethod: "cash" | "card",
    register: UseFormRegister<ShippingFormFields>;
    handleSubmit: UseFormHandleSubmit<ShippingFormFields>;
    handleOrderPlacement: (data: ShippingFormFields) => void
    setValue: UseFormSetValue<ShippingFormFields>;
}


const ShippingForm = ({
    onPaymentMethodChange,
    isCardPaymentAvailable,
    selectedPaymentMethod,
    register,
    handleSubmit,
    handleOrderPlacement,
    setValue,
}: ShippingFormProps) => {

    const [selectedCountry, setSelectedCountry] = useState<string | undefined>()
    const [selectedState, setSelectedState] = useState<string | undefined>()
    const [selectedCity, setSelectedCity] = useState<string | undefined>()

    const [availableStates, setAvailableStates] = useState<string[]>([])
    const [availableCities, setAvailableCities] = useState<string[]>([])
    const [countries, setCountries] = useState<string[]>([])

    const [openCountry, setOpenCountry] = useState(false)
    const [openState, setOpenState] = useState(false)
    const [openCity, setOpenCity] = useState(false)

    // Mock countries data - in a real implementation, you'd fetch from ERPNext or a countries API
    const countriesData = {
        countries: [
            { name: "Pakistan", iso2: "PK" },
            { name: "United States", iso2: "US" },
            { name: "United Kingdom", iso2: "GB" },
            { name: "Canada", iso2: "CA" }
        ]
    }

    useEffect(() => {
        if (countriesData?.countries) {
            setCountries(
                countriesData.countries.map((country: { name: string; iso2: string }) => country.name)
            );
        }
    }, [countriesData]);

    const countryIso2 = selectedCountry ? selectedCountry.match(/\(([^)]+)\)$/)?.[1] : null;

    // Mock cities data - in a real implementation, you'd fetch from ERPNext or a cities API
    const citiesData = {
        cities: countryIso2 ? [
            { name: "Karachi", state: "Sindh" },
            { name: "Lahore", state: "Punjab" },
            { name: "Islamabad", state: "Federal" }
        ] : []
    };

    useEffect(() => {
        if (citiesData?.cities) {
            setAvailableCities(
                citiesData.cities.map((city: { name: string }) => city.name)
            );
        }
    }, [citiesData]);


    // Mock states data - in a real implementation, you'd fetch from ERPNext or a states API
    const statesData = {
        states: countryIso2 ? [
            { name: "Sindh", iso2: "SD" },
            { name: "Punjab", iso2: "PB" },
            { name: "Federal", iso2: "FB" }
        ] : []
    }

    useEffect(() => {
        if (statesData?.states) {
            setAvailableStates(
                statesData?.states.map((state: { name: string }) => state.name)
            );
        }
    }, [statesData]);


    useEffect(() => {
        if (selectedCountry) {

            setSelectedState(undefined)
            setSelectedCity(undefined)
        } else {
            setAvailableStates([])
        }

    }, [selectedCountry])


    return (
        <form className="space-y-6" onSubmit={handleSubmit(handleOrderPlacement)}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            placeholder="Your First Name"
                            required
                            {...register("firstName", { required: true })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            placeholder="Your Last Name"
                            required
                            {...register("lastName", { required: true })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            placeholder="Your Email"
                            required
                            {...register("email", { required: true })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            placeholder="Your Phone Number"
                            required
                            {...register("phone", { required: true })}
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="address1">Address Line 1</Label>
                    <Input
                        id="address1"
                        placeholder="Address 1"
                        required
                        {...register("address1", { required: true })}
                    />
                </div>
                <div>
                    <Label htmlFor="address2">
                        Address Line 2<span className="ml-2 text-sm text-primary">(Optional)</span>
                    </Label>
                    <Input
                        id="address2"
                        placeholder="Address 2"
                        {...register("address2")}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="country">Country</Label>
                        <Popover open={openCountry} onOpenChange={setOpenCountry}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCountry}
                                    className="w-full justify-between"
                                >
                                    {selectedCountry || "Select country..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search country..." />
                                    <CommandList>
                                        <CommandEmpty>No country found.</CommandEmpty>
                                        <CommandGroup>
                                            {countries.map((country: any, index: number) => (
                                                <CommandItem
                                                    key={index}
                                                    onSelect={() => {
                                                        const selectedValue = `${country.name} (${country.iso2})`;
                                                        setSelectedCountry(selectedValue === selectedCountry ? undefined : selectedValue);
                                                        setValue("country", selectedValue);
                                                        setOpenCountry(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn("mr-2 h-4 w-4", selectedCountry === country ? "opacity-100" : "opacity-0")}
                                                    />
                                                    {country.name} ({country.iso2})
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label htmlFor="state">State</Label>
                        <Popover open={openState} onOpenChange={setOpenState}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openState}
                                    className="w-full justify-between"
                                    disabled={!selectedCountry}
                                >
                                    {selectedState || "Select state..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search state..." />
                                    <CommandList>
                                        <CommandEmpty>No state found.</CommandEmpty>
                                        <CommandGroup>
                                            {availableStates.map((state, index) => (
                                                <CommandItem
                                                    key={index}
                                                    onSelect={(currentValue: any) => {
                                                        setSelectedState(currentValue === selectedState ? undefined : currentValue)
                                                        setValue("state", currentValue)
                                                        setOpenState(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn("mr-2 h-4 w-4", selectedState === state ? "opacity-100" : "opacity-0")}
                                                    />
                                                    {state}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="city">City</Label>
                        <Popover open={openCity} onOpenChange={setOpenCity}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCity}
                                    className="w-full justify-between"
                                    disabled={!selectedCountry}
                                >
                                    {selectedCity || "Select city..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search city..." {...register("city", { required: true, value: selectedCity })} />
                                    <CommandList>
                                        <CommandEmpty>No city found.</CommandEmpty>
                                        <CommandGroup>
                                            {availableCities.map((city, index) => (
                                                <CommandItem
                                                    key={index}
                                                    onSelect={(currentValue: any) => {
                                                        setSelectedCity(currentValue === selectedCity ? undefined : currentValue)
                                                        setValue("city", currentValue)
                                                        setOpenCity(false)
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", selectedCity === city ? "opacity-100" : "opacity-0")} />
                                                    {city}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label htmlFor="zipCode">Zip Code</Label>
                        <Input
                            disabled={!selectedCity}
                            id="zipCode"
                            placeholder="City Zip Code"
                            required
                            {...register("zipCode", { required: true })}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Payment Method</Label>
                <RadioGroup
                    value={selectedPaymentMethod}
                    onValueChange={(value) => onPaymentMethodChange(value as "cash" | "card")}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash">Cash on Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" disabled={!isCardPaymentAvailable} />
                        <Label htmlFor="card" className={!isCardPaymentAvailable ? "text-muted-foreground" : ""}>
                            Card Payment
                            {!isCardPaymentAvailable && <span className="ml-2 text-sm text-primary">(Coming Soon)</span>}
                        </Label>
                    </div>
                </RadioGroup>
            </div>
        </form>
    )
}

export default ShippingForm

