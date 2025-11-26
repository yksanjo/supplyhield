import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Building2, Loader2, Plus } from "lucide-react";

const vendorFormSchema = z.object({
  name: z.string().min(1, "Vendor name is required").max(255),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  industry: z.string().min(1, "Industry is required"),
  description: z.string().optional(),
  contactEmail: z.string().email("Must be a valid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

const industries = [
  "Cloud Services",
  "Data Analytics",
  "Cybersecurity",
  "Financial Services",
  "Healthcare",
  "E-commerce",
  "Marketing Technology",
  "HR & Recruiting",
  "Communication",
  "Legal Services",
  "Logistics",
  "Manufacturing",
  "Other",
];

export default function AddVendor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: "",
      website: "",
      industry: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: async (data: VendorFormValues) => {
      const payload = {
        ...data,
        website: data.website || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        address: data.address || null,
        description: data.description || null,
      };
      const res = await apiRequest("POST", "/api/vendors", payload);
      return res.json();
    },
    onSuccess: (vendor) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors/top-risk"] });
      toast({
        title: "Vendor Created",
        description: `${vendor.name} has been added to your portfolio.`,
      });
      setLocation(`/vendors/${vendor.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create vendor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VendorFormValues) => {
    createVendorMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/vendors">
        <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-to-vendors">
          <ArrowLeft className="h-4 w-4" />
          Back to Vendors
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Add New Vendor</CardTitle>
              <CardDescription>
                Add a vendor or supplier to your risk management portfolio
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Basic Information
                </h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Acme Cloud Services" 
                          {...field} 
                          data-testid="input-vendor-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-industry">
                            <SelectValue placeholder="Select an industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com" 
                          {...field} 
                          data-testid="input-website"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the vendor and services they provide..."
                          className="min-h-[100px] resize-none"
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what products or services you use from this vendor.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Contact Information
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="contact@vendor.com" 
                            {...field}
                            data-testid="input-contact-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+1 (555) 123-4567" 
                            {...field}
                            data-testid="input-contact-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Business St, City, Country" 
                          {...field}
                          data-testid="input-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <Link href="/vendors">
                  <Button type="button" variant="outline" data-testid="button-cancel">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={createVendorMutation.isPending}
                  className="gap-2"
                  data-testid="button-create-vendor"
                >
                  {createVendorMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Vendor
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
