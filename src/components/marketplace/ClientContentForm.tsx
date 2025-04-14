"use client";

import { useState } from "react";
import { Upload, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

export function ClientContentForm() {
  const [fileOption, setFileOption] = useState("file");

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Client Content Form</CardTitle>
        <CardDescription>Please provide your content details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client-note">Enter your note</Label>
          <Textarea id="client-note" placeholder="Add any specific instructions or notes here..." className="min-h-[120px] border-2" />
        </div>

        <div className="space-y-2">
          <Label>How would you like to provide your content?</Label>
          <RadioGroup defaultValue="file" className="space-y-3" onValueChange={(value) => setFileOption(value)}>
            <div className="flex items-center space-x-3 space-y-0">
              <RadioGroupItem value="file" id="file-option" className="border-primary text-primary" />
              <Label htmlFor="file-option" className="font-normal">Upload a file</Label>
            </div>
            <div className="flex items-center space-x-3 space-y-0">
              <RadioGroupItem value="url" id="url-option" className="border-primary text-primary" />
              <Label htmlFor="url-option" className="font-normal">Enter a URL</Label>
            </div>
          </RadioGroup>

          {fileOption === "file" ? (
            <div className="mt-4 rounded-md border-2 border-dashed p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-primary" />
              <div className="mt-2">
                <Button variant="outline" size="sm" className="border-2">
                  Choose File
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <Label htmlFor="client-url">URL</Label>
              <Input id="client-url" placeholder="https://..." className="border-2" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-email">Backup Email</Label>
          <Input id="client-email" type="email" placeholder="your@email.com" className="border-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PublisherContentForm() {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Publisher Content Form</CardTitle>
        <CardDescription>Tell us what content you need</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="publisher-note">Enter your note here</Label>
          <Textarea id="publisher-note" placeholder="Describe what you need..." className="min-h-[120px] border-2" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="anchor-link">Anchor link</Label>
          <div className="flex items-center space-x-2">
            <Link2 className="h-4 w-4 text-primary" />
            <Input id="anchor-link" placeholder="https://..." className="border-2" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keyword">Keyword</Label>
          <Input id="keyword" placeholder="Enter main keyword" className="border-2" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publisher-email">Backup Email</Label>
          <Input id="publisher-email" type="email" placeholder="your@email.com" className="border-2" />
        </div>
      </CardContent>
    </Card>
  );
}
