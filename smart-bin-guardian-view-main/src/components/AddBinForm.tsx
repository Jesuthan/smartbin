
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Bin } from "@/types/bin";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Bin name must be at least 2 characters.",
  }),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  installationDate: z.date(),
  notes: z.string().optional(),
  zone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type AddBinFormProps = {
  onSubmit: (data: Omit<Bin, "id" | "garbageLevel" | "temperature" | "pressure" | "status" | "lastUpdated">) => void;
  onCancel: () => void;
};

const AddBinForm = ({ onSubmit, onCancel }: AddBinFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: {
        latitude: 0,
        longitude: 0,
      },
      notes: "",
      zone: "",
    },
  });

  // Get current location if browser supports
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("location.latitude", position.coords.latitude);
          form.setValue("location.longitude", position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleSubmit = (values: FormValues) => {
    // Ensure latitude and longitude are numbers and not undefined
    const newBin = {
      name: values.name,
      location: {
        latitude: values.location.latitude,
        longitude: values.location.longitude,
      },
      installationDate: values.installationDate.toISOString(),
      notes: values.notes || "",
      zone: values.zone || "",
    };
    
    onSubmit(newBin);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bin Name / ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter bin name or ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>GPS Location</FormLabel>
          <div className="flex space-x-2">
            <FormField
              control={form.control}
              name="location.latitude"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Latitude"
                      step="0.000001"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value || 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.longitude"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Longitude"
                      step="0.000001"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value || 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            className="w-full"
          >
            Get Current Location
          </Button>
        </div>

        <FormField
          control={form.control}
          name="installationDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Installation Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zone</FormLabel>
              <FormControl>
                <Input placeholder="Enter zone (e.g., North, Commercial)" {...field} />
              </FormControl>
              <FormDescription>
                Zone helps categorize bins by area or district
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any additional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Bin</Button>
        </div>
      </form>
    </Form>
  );
};

export default AddBinForm;
