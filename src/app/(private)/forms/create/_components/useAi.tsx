"use client";

import React, { ReactNode, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosInstance";
import { Loader2, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function UseAI({ children, onFormGenerated }: { children: ReactNode, onFormGenerated?: (formData: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [generatedForm, setGeneratedForm] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedForm(null);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      const topic = formData.get("name");

      // AI Prompt
      const prompt = `You are an expert form builder AI. I will give you a topic name, and you need to generate a JSON-based form structure for it. Follow the rules strictly:- Valid JSON only- Include title, description, and fields- Fields must have: id, label, type, options (if needed), required - 3 to 6 fields per form.- Example Output:{"title": "Bus Facilities For Employee","description": "Collecting employee feedback about bus facilities.","fields": [{"id": 1,"label": "Employee Name","type": "text","required": true},{"id": 2,"label": "Employee ID","type": "number","required": true},{"id": 3,"label": "Preferred Bus Route","type": "dropdown","options":["Route A", "Route B", "Route C"],"required": true},{"id": 4,"label": "Do you use company-provided bus services?","type":"radio","options": ["Yes", "No"],"required": true},{"id": 5,"label": "Suggestions for improving bus facilities","type": "textarea","required": false}]}Topic: ${topic}`;

      // API Request
      const response = await axiosInstance.post("EmployeeVoice/create-aiform", { Prompt: JSON.stringify({ text: prompt }) });

      // Extract AI-generated form data
      const result = response.data;

      // Parse JSON if it's in string format
      let parsedData = result;
      if (typeof result === "string") {
        try {
          // Try to find JSON in the string response
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No valid JSON found in AI response");
          }
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError);
          throw new Error("AI generated invalid form structure. Please try again.");
        }
      }

      // Validate the parsed data has required structure
      if (!parsedData.title || !parsedData.fields || !Array.isArray(parsedData.fields)) {
        throw new Error("AI response missing required form structure");
      }

      setGeneratedForm(parsedData);
      setSuccess(true);
      console.log("Generated Form:", parsedData);
    } catch (error: any) {
      console.error("Error generating form:", error);
      setError(error.message || "Failed to generate form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseForm = () => {
    if (generatedForm && onFormGenerated) {
      onFormGenerated(generatedForm);
      setOpen(false);
      setGeneratedForm(null);
      setSuccess(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state when dialog closes
      setGeneratedForm(null);
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create form using AI
          </DialogTitle>
          <DialogDescription>
            Describe what your form is about, and AI will generate the structure for you.
            Please review before using.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="ai-form">
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="topic">What is your form about?</Label>
              <Input
                id="topic"
                name="name"
                defaultValue="Bus Facilities For Employee"
                placeholder="Enter form topic"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="my-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Form generated successfully! Review it below.
              </AlertDescription>
            </Alert>
          )}

          {/* Show AI Generated Form */}
          {generatedForm && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 text-sm max-h-60 overflow-y-auto">
              <h4 className="font-medium mb-2">{generatedForm.title}</h4>
              {generatedForm.description && (
                <p className="text-muted-foreground text-sm mb-3">{generatedForm.description}</p>
              )}
              <div className="space-y-2">
                {generatedForm.fields.map((field: any) => (
                  <div key={field.id} className="p-2 bg-white rounded border text-xs">
                    <div className="font-medium">{field.label}</div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Type: {field.type}</span>
                      <span>{field.required ? "Required" : "Optional"}</span>
                    </div>
                    {field.options && (
                      <div className="mt-1">
                        Options: {field.options.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            
            {generatedForm ? (
              <Button 
                type="button" 
                onClick={handleUseForm}
                className="bg-green-600 hover:bg-green-700"
              >
                Use This Form
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UseAI;