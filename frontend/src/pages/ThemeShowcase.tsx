/**
 * Dark Mode Showcase
 * Demonstrates all theme-aware components and utilities
 */

import { InventoryLayout } from "@/layouts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/contexts/ThemeContext";
import {
  statusColors,
  cardClasses,
  getBadgeClasses,
  getStockStatusBadge,
  chartColors,
} from "@/lib/theme-utils";
import {
  Palette,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";

export default function ThemeShowcase() {
  const { actualTheme, theme } = useTheme();

  const statCards = [
    { title: "Total Revenue", value: "₹1,24,500", change: "+12.5%", icon: DollarSign, color: "text-success" },
    { title: "Products Sold", value: "342", change: "+8.2%", icon: Package, color: "text-primary" },
    { title: "Active Users", value: "1,234", change: "+23.1%", icon: Users, color: "text-chart-5" },
    { title: "Conversion Rate", value: "3.24%", change: "-2.4%", icon: Activity, color: "text-warning" },
  ];

  return (
    <InventoryLayout activeSection="Settings">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Palette className="h-8 w-8 text-primary" />
                Dark Mode Showcase
              </h1>
              <p className="text-muted-foreground mt-2">
                Explore all theme-aware components and color variations
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-muted-foreground">Current theme:</span>
                <Badge className={getBadgeClasses("info")}>
                  {theme === "system" ? `System (${actualTheme})` : actualTheme}
                </Badge>
              </div>
            </div>
            <ThemeToggle size="lg" showLabel={true} />
          </div>
        </div>

        {/* Stats Cards */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Statistics Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <Card key={index} className="hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                        {stat.value}
                      </p>
                      <p className={`text-xs mt-2 flex items-center gap-1 ${
                        stat.change.startsWith('+') ? 'text-success' : 'text-destructive'
                      }`}>
                        <TrendingUp className="h-3 w-3" />
                        {stat.change} from last month
                      </p>
                    </div>
                    <stat.icon className={`h-10 w-10 ${stat.color} opacity-20`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Status Badges */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Status Indicators</h2>
          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>
                Status badges that work perfectly in both light and dark modes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Badges */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Status Types</h3>
                <div className="flex flex-wrap gap-3">
                  <div className={statusColors.success.badge}>
                    <CheckCircle className="h-3 w-3" />
                    Success
                  </div>
                  <div className={statusColors.error.badge}>
                    <AlertCircle className="h-3 w-3" />
                    Error
                  </div>
                  <div className={statusColors.warning.badge}>
                    <AlertTriangle className="h-3 w-3" />
                    Warning
                  </div>
                  <div className={statusColors.info.badge}>
                    <Info className="h-3 w-3" />
                    Info
                  </div>
                  <div className={statusColors.neutral.badge}>
                    <Activity className="h-3 w-3" />
                    Neutral
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Stock Status</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { stock: 100, min: 10 },
                    { stock: 5, min: 10 },
                    { stock: 0, min: 10 },
                  ].map((item, index) => {
                    const { label, variant } = getStockStatusBadge(item.stock, item.min);
                    return (
                      <div key={index} className={getBadgeClasses(variant)}>
                        {label} ({item.stock} units)
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buttons */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Buttons</h2>
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>All button styles with theme support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="destructive">Destructive Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="link">Link Button</Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small Button</Button>
                <Button size="default">Default Button</Button>
                <Button size="lg">Large Button</Button>
                <Button size="icon">
                  <Package className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled Button</Button>
                <Button variant="outline" disabled>Disabled Outline</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Inputs */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Form Elements</h2>
          <Card>
            <CardHeader>
              <CardTitle>Input Fields</CardTitle>
              <CardDescription>Theme-aware form components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Normal Input
                  </label>
                  <Input placeholder="Enter text..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Disabled Input
                  </label>
                  <Input placeholder="Disabled" disabled />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Number Input
                  </label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email Input
                  </label>
                  <Input type="email" placeholder="email@example.com" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Palette */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Color Palette</h2>
          <Card>
            <CardHeader>
              <CardTitle>Theme Colors</CardTitle>
              <CardDescription>Current theme color variables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[
                  { name: "Primary", class: "bg-primary", text: "text-primary-foreground" },
                  { name: "Secondary", class: "bg-secondary", text: "text-secondary-foreground" },
                  { name: "Success", class: "bg-success", text: "text-success-foreground" },
                  { name: "Warning", class: "bg-warning", text: "text-warning-foreground" },
                  { name: "Destructive", class: "bg-destructive", text: "text-destructive-foreground" },
                  { name: "Muted", class: "bg-muted", text: "text-muted-foreground" },
                  { name: "Accent", class: "bg-accent", text: "text-accent-foreground" },
                  { name: "Card", class: "bg-card border border-border", text: "text-card-foreground" },
                  { name: "Background", class: "bg-background border border-border", text: "text-foreground" },
                  { name: "Chart 1", class: "bg-chart-1", text: "text-white" },
                ].map((color, index) => (
                  <div key={index} className="space-y-2">
                    <div className={`h-16 rounded-lg ${color.class} flex items-center justify-center shadow-sm`}>
                      <span className={`text-xs font-medium ${color.text}`}>
                        {color.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Typography */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Typography</h2>
          <Card>
            <CardHeader>
              <CardTitle>Text Styles</CardTitle>
              <CardDescription>Text color hierarchy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-foreground text-lg">Primary text (foreground)</p>
              <p className="text-muted-foreground">Secondary text (muted-foreground)</p>
              <p className="text-muted-foreground/70">Tertiary text (muted/70)</p>
              <p className="text-primary">Accent text (primary)</p>
              <p className="text-success">Success text</p>
              <p className="text-warning">Warning text</p>
              <p className="text-destructive">Error text</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading States */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Loading States</h2>
          <Card>
            <CardHeader>
              <CardTitle>Skeleton Loaders</CardTitle>
              <CardDescription>Placeholder content while loading</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
              </div>
              <div className="flex gap-3 mt-4">
                <div className="h-12 w-12 bg-muted rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Implementation Notes</h3>
              <p className="text-sm text-muted-foreground">
                All components automatically adapt to the selected theme using CSS custom properties.
                The color palette maintains proper contrast ratios for accessibility in both light and dark modes.
                Smooth transitions provide a polished user experience when switching between themes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </InventoryLayout>
  );
}
