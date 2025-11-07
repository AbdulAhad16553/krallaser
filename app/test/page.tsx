"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testCustomerCreation = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch("/api/test-customer", {
        method: "POST",
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testCompanies = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch("/api/test-companies");
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testQuotationFlow = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch("/api/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: "Test Customer",
          email: "test@example.com",
          mobile: "03001234567",
          remarks: "Test quotation from test page",
          items: [
            {
              item_code: "TEST-ITEM",
              qty: 1,
              rate: 1000,
              uom: "Nos",
              description: "Test Item Description",
            },
          ],
        }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">API Testing Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Creation Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Customer Creation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Test creating a customer with the name "abdul ahad" and email "rajaahad1010@gmail.com"
            </p>
            <Button 
              onClick={testCustomerCreation}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Customer Creation"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Companies Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Companies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Check what companies are available in ERPNext
            </p>
            <Button 
              onClick={testCompanies}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Companies"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Quotation Flow Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Quotation Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Test the complete flow: check/create customer → create quotation
            </p>
            <Button 
              onClick={testQuotationFlow}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Quotation Flow"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={result.success ? "default" : "destructive"}>
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Status:</strong> {result.success ? "Success" : "Failed"}</p>
                  <p><strong>Message:</strong> {result.message}</p>
                  {result.data && (
                    <div>
                      <p><strong>Data:</strong></p>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
