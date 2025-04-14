"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner"; 

export function AddSite() {
  const [sheetUrl, setSheetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const sheetId = match ? match[1] : null;

    if (!sheetId) {
      toast.error("Invalid Google Sheet URL");
      return;
    }

    const token = Cookies.get("token"); 
    if (!token) {
      toast.error("No authentication token found");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/google-sheet-products?sheetId=${sheetId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Saved Successfully:", response.data);

      // Show success toast
      toast.success("Products successfully fetched and saved!");

      // Clear form fields
      setSheetUrl("");
    } catch (error) {
      console.error("Error saving data:", error);
      
      // Show error toast
      toast.error("Error fetching or saving products.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Google Sheet Import</CardTitle>
          <CardDescription>Paste your Google Sheet URL below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheet-url">Google Sheet URL</Label>
            <Input
              id="sheet-url"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="border-2"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Sheet"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
