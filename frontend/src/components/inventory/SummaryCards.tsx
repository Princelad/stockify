import { useEffect, useState } from "react";
import { Package, AlertTriangle, DollarSign, CreditCard } from "lucide-react";
import { apiService } from "@/lib/api";
import { themeColors } from "@/contexts/ThemeContext";

export function SummaryCards() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getDashboardStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`rounded-xl p-5 shadow-sm ${themeColors.bg.card} animate-pulse`}
          >
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const overview = stats?.overview || {};
  const pricing = stats?.pricingAnalysis || {};
  const lowStockCount = overview.lowStockProducts || 0;

  const cards = [
    {
      label: "Total Products",
      value: overview.totalProducts || 0,
      icon: Package,
      trend: "+12%",
      trendColor: "text-green-600 dark:text-green-400",
      sub: "Products in inventory",
      iconColor: "text-blue-600 dark:text-blue-400",
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-950/20",
    },
    {
      label: "Low Stock Items",
      value: lowStockCount,
      icon: AlertTriangle,
      trend: lowStockCount > 0 ? "Alert" : "Good",
      trendColor:
        lowStockCount > 0
          ? "text-red-600 dark:text-red-400"
          : "text-green-600 dark:text-green-400",
      sub: "Items below reorder level",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      bgLight: "bg-yellow-50",
      bgDark: "dark:bg-yellow-950/20",
    },
    {
      label: "Inventory Value",
      value: formatCurrency(pricing.totalRetailValue || 0),
      icon: DollarSign,
      trend: "+5%",
      trendColor: "text-green-600 dark:text-green-400",
      sub: "Total retail value",
      iconColor: "text-green-600 dark:text-green-400",
      bgLight: "bg-green-50",
      bgDark: "dark:bg-green-950/20",
    },
    {
      label: "Profit Margin",
      value: formatPercentage(pricing.avgRetailMargin || 0),
      icon: CreditCard,
      trend: "Avg",
      trendColor: "text-blue-600 dark:text-blue-400",
      sub: "Average retail margin",
      iconColor: "text-purple-600 dark:text-purple-400",
      bgLight: "bg-purple-50",
      bgDark: "dark:bg-purple-950/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl p-5 shadow-sm flex items-center gap-4 ${card.bgLight} ${card.bgDark} ${themeColors.bg.card} ${themeColors.border.primary} border transition-all duration-200 hover:shadow-md`}
        >
          <card.icon className={`h-8 w-8 ${card.iconColor}`} />
          <div>
            <div className={`text-2xl font-bold ${themeColors.text.primary}`}>
              {card.value}
            </div>
            <div
              className={`${themeColors.text.secondary} text-sm font-medium flex items-center gap-2`}
            >
              {card.label}
              <span className={`ml-2 text-xs font-semibold ${card.trendColor}`}>
                {card.trend}
              </span>
            </div>
            <div className={`text-xs ${themeColors.text.tertiary} mt-1`}>
              {card.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
