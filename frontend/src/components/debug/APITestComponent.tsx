import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/lib/api";

export default function APITestComponent() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      setResults((prev) => [
        ...prev,
        {
          name,
          status: "success",
          duration,
          data: result,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      console.log(`✅ ${name} - Success (${duration}ms):`, result);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setResults((prev) => [
        ...prev,
        {
          name,
          status: "error",
          duration,
          error: errorMessage,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      console.error(`❌ ${name} - Error (${duration}ms):`, error);
    }
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    // Test basic connectivity
    await testEndpoint("Categories API", () => apiService.getCategories());
    await testEndpoint("Products API", () =>
      apiService.getProducts({ limit: 1 })
    );
    await testEndpoint("Suppliers API", () => apiService.getSuppliers());

    // Test create product with minimal data
    await testEndpoint("Create Product Test", () =>
      apiService.createProduct({
        name: "Test Product " + Date.now(),
        category: "Test",
        sku: "TEST-" + Date.now(),
        costPrice: 10,
        sellingPrice: 20,
        currentStock: 5,
        minStockLevel: 1,
        maxStockLevel: 100,
        description: "Test product for API testing",
        brand: "Test Brand",
        supplierId: "",
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
      })
    );

    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className="max-w-4xl mx-auto m-4">
      <CardHeader>
        <CardTitle>API Connectivity Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runTests} disabled={loading}>
            {loading ? "Running Tests..." : "Run API Tests"}
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                result.status === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {result.status === "success" ? "✅" : "❌"} {result.name}
                </div>
                <div className="text-sm text-gray-500">
                  {result.timestamp} ({result.duration}ms)
                </div>
              </div>
              {result.status === "error" && (
                <div className="text-red-600 text-sm mt-1">
                  Error: {result.error}
                </div>
              )}
              {result.status === "success" && result.data && (
                <div className="text-green-600 text-sm mt-1">
                  {result.data.message || "Success"}
                  {result.data.data &&
                    ` (${
                      Array.isArray(result.data.data)
                        ? result.data.data.length
                        : typeof result.data.data
                    } items)`}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
