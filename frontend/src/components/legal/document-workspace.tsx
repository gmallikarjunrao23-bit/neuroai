"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Download,
  Share2,
  Printer,
  Edit3,
  Eye,
  Globe,
  Shield,
  Clock,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileSignature,
  Save,
  Send,
  Loader2,
} from "lucide-react";

interface FormData {
  documentType: string;
  language: string;
  parties: {
    landlord?: { name: string; address: string; phone: string; email: string };
    tenant?: { name: string; address: string; phone: string; email: string };
    party1?: { name: string; address: string; phone: string; email: string };
    party2?: { name: string; address: string; phone: string; email: string };
  };
  property?: { address: string; type: string; rent: string; deposit: string; duration: string };
  terms: string;
  additionalClauses: string;
}

const steps = [
  { id: "type", label: "Document Type", icon: FileText },
  { id: "parties", label: "Parties", icon: User },
  { id: "details", label: "Details", icon: Edit3 },
  { id: "review", label: "Review", icon: Eye },
  { id: "generate", label: "Generate", icon: Sparkles },
];

export function DocumentWorkspace() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    documentType: "rental-agreement",
    language: "english",
    parties: {},
    property: { address: "", type: "residential", rent: "", deposit: "", duration: "11" },
    terms: "",
    additionalClauses: "",
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsGenerating(false);
    setGenerated(true);
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case "type":
        return <SelectDocumentType formData={formData} updateField={updateField} />;
      case "parties":
        return <PartyDetails formData={formData} updateField={updateField} />;
      case "details":
        return <DocumentDetails formData={formData} updateField={updateField} />;
      case "review":
        return <ReviewDocument formData={formData} />;
      case "generate":
        return generated ? (
          <GeneratedDocument />
        ) : (
          <GenerateStep isGenerating={isGenerating} onGenerate={handleGenerate} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    index < currentStep
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                      : index === currentStep
                      ? "bg-gradient-to-r from-[#1E3A5F] to-[#2A5A8F] text-white shadow-lg shadow-[#1E3A5F]/25"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-4.5 w-4.5" />
                  )}
                </div>
                <p
                  className={`text-[10px] mt-1.5 font-medium hidden sm:block ${
                    index <= currentStep
                      ? "text-[#1E3A5F] dark:text-white"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`hidden sm:block w-16 lg:w-24 h-0.5 mx-3 transition-colors duration-300 ${
                    index < currentStep
                      ? "bg-emerald-400"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <Progress
          value={((currentStep + 1) / steps.length) * 100}
          className="[&>[data-slot=progress-track]]:h-1 [&>[data-slot=progress-track]]:bg-gray-100 dark:[&>[data-slot=progress-track]]:bg-gray-800 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-[#1E3A5F] [&>[data-slot=progress-indicator]]:to-[#C9A84C]"
        />
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderStep()}
      </motion.div>

      {/* Navigation */}
      {!generated && (
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="rounded-full border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-medium text-[#1E3A5F] dark:text-white">{currentStep + 1}</span>
            <span>/ {steps.length}</span>
          </div>
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="rounded-full bg-gradient-to-r from-[#1E3A5F] to-[#2A5A8F] hover:from-[#2A5A8F] hover:to-[#1E3A5F] text-white shadow-lg shadow-[#1E3A5F]/25"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="rounded-full bg-gradient-to-r from-[#C9A84C] to-[#D4B96A] text-[#1E3A5F] hover:from-[#D4B96A] hover:to-[#C9A84C] shadow-lg shadow-[#C9A84C]/25"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Document
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* Step 1: Select Document Type */
function SelectDocumentType({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: (field: string, value: any) => void;
}) {
  const types = [
    {
      id: "rental-agreement",
      name: "Rental / Lease Agreement",
      desc: "Residential or commercial property rental",
      icon: FileText,
      languages: ["English", "Hindi", "Marathi", "Telugu"],
    },
    {
      id: "nda",
      name: "Non-Disclosure Agreement",
      desc: "Confidentiality protection",
      icon: Shield,
      languages: ["English", "Hindi"],
    },
    {
      id: "legal-notice",
      name: "Legal Notice",
      desc: "Formal legal correspondence",
      icon: FileText,
      languages: ["English", "Hindi", "Marathi"],
    },
    {
      id: "employment-contract",
      name: "Employment Agreement",
      desc: "Hire employees or contractors",
      icon: FileText,
      languages: ["English", "Hindi"],
    },
  ];

  return (
    <Card className="border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1E3A5F] dark:text-white mb-2">
            What document do you need?
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a document type to get started. We have 200+ templates to choose from.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => updateField("documentType", type.id)}
              className={`relative p-6 rounded-2xl text-left border-2 transition-all duration-300 ${
                formData.documentType === type.id
                  ? "border-[#C9A84C] bg-[#C9A84C]/5 dark:bg-[#C9A84C]/10 shadow-lg shadow-[#C9A84C]/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
              }`}
            >
              {formData.documentType === type.id && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A84C]" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${
                  formData.documentType === type.id
                    ? "bg-[#C9A84C] text-[#1E3A5F]"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                }`}>
                  <type.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E3A5F] dark:text-white">{type.name}</h3>
                  <p className="text-xs text-gray-500">{type.desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {type.languages.map((lang) => (
                  <span key={lang} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-500 dark:text-gray-400">
                    {lang}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Language Selection */}
        <div className="p-0">
          <Label className="text-sm font-semibold text-[#1E3A5F] dark:text-white mb-2 block">
            Select Language
          </Label>
          <Select
            value={formData.language}
            onValueChange={(v) => updateField("language", v)}
          >
            <SelectTrigger className="w-full sm:w-64 rounded-xl border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Choose language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="hindi">हिन्दी (Hindi)</SelectItem>
              <SelectItem value="marathi">मराठी (Marathi)</SelectItem>
              <SelectItem value="telugu">తెలుగు (Telugu)</SelectItem>
              <SelectItem value="tamil">தமிழ் (Tamil)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

/* Step 2: Party Details */
function PartyDetails({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: (field: string, value: any) => void;
}) {
  const partyFields = [
    { key: "landlord", label: "Landlord / Lessor", icon: Building2 },
    { key: "tenant", label: "Tenant / Lessee", icon: User },
  ];

  const updateParty = (party: string, field: string, value: string) => {
    updateField("parties", {
      ...formData.parties,
      [party]: { ...(formData.parties as any)[party], [field]: value },
    });
  };

  return (
    <Card className="border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1E3A5F] dark:text-white mb-2">
            Party Information
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Enter the details of all parties involved in this agreement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partyFields.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-lg bg-[#1E3A5F]/10 dark:bg-[#C9A84C]/10">
                  <Icon className="h-4 w-4 text-[#1E3A5F] dark:text-[#C9A84C]" />
                </div>
                <h3 className="font-semibold text-[#1E3A5F] dark:text-white">{label}</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Full Name</Label>
                  <Input
                    placeholder="Enter full name"
                    className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900"
                    value={(formData.parties as any)[key]?.name || ""}
                    onChange={(e) => updateParty(key, "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Address</Label>
                  <Textarea
                    placeholder="Enter full address"
                    className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 min-h-[60px]"
                    value={(formData.parties as any)[key]?.address || ""}
                    onChange={(e) => updateParty(key, "address", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Phone</Label>
                    <Input
                      placeholder="+91"
                      className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900"
                      value={(formData.parties as any)[key]?.phone || ""}
                      onChange={(e) => updateParty(key, "phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</Label>
                    <Input
                      placeholder="email@example.com"
                      className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900"
                      value={(formData.parties as any)[key]?.email || ""}
                      onChange={(e) => updateParty(key, "email", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* Step 3: Document Details */
function DocumentDetails({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: (field: string, value: any) => void;
}) {
  return (
    <Card className="border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1E3A5F] dark:text-white mb-2">
            Property & Terms
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Provide the specific details for this agreement.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Property Address</Label>
              <Textarea
                placeholder="Enter property address"
                className="rounded-xl border-gray-200 dark:border-gray-700"
                value={formData.property?.address || ""}
                onChange={(e) => updateField("property", { ...formData.property, address: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Property Type</Label>
              <Select
                value={formData.property?.type || "residential"}
                onValueChange={(v) => updateField("property", { ...formData.property, type: v })}
              >
                <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Duration (months)</Label>
              <Select
                value={formData.property?.duration || "11"}
                onValueChange={(v) => updateField("property", { ...formData.property, duration: v })}
              >
                <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 6, 11, 12, 24, 36, 60].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} months {n >= 12 ? `(${n / 12} yr)` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Monthly Rent (₹)</Label>
              <Input
                type="number"
                placeholder="25000"
                className="rounded-xl border-gray-200 dark:border-gray-700"
                value={formData.property?.rent || ""}
                onChange={(e) => updateField("property", { ...formData.property, rent: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Security Deposit (₹)</Label>
              <Input
                type="number"
                placeholder="50000"
                className="rounded-xl border-gray-200 dark:border-gray-700"
                value={formData.property?.deposit || ""}
                onChange={(e) => updateField("property", { ...formData.property, deposit: e.target.value })}
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Special Terms & Conditions</Label>
            <Textarea
              placeholder="Enter any special terms, conditions, or clauses you'd like to include..."
              className="rounded-xl border-gray-200 dark:border-gray-700 min-h-[100px]"
              value={formData.terms}
              onChange={(e) => updateField("terms", e.target.value)}
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Additional Clauses</Label>
            <Textarea
              placeholder="Any additional clauses or modifications..."
              className="rounded-xl border-gray-200 dark:border-gray-700 min-h-[80px]"
              value={formData.additionalClauses}
              onChange={(e) => updateField("additionalClauses", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* Step 4: Review */
function ReviewDocument({ formData }: { formData: FormData }) {
  return (
    <Card className="border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/50 dark:border-emerald-800/30 mb-4">
            <Eye className="h-6 w-6 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#1E3A5F] dark:text-white mb-2">
            Review Your Information
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please review all the details before generating the document.
          </p>
        </div>

        <div className="space-y-6">
          {/* Document Type */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-[#C9A84C]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Document Type</span>
            </div>
            <p className="text-[#1E3A5F] dark:text-white font-medium capitalize">
              {formData.documentType.replace("-", " ")} ·{" "}
              <span className="text-[#C9A84C]">{formData.language}</span>
            </p>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["landlord", "tenant"].map((party) => {
              const data = (formData.parties as any)[party];
              if (!data) return null;
              return (
                <div key={party} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    {party === "landlord" ? (
                      <Building2 className="h-4 w-4 text-[#C9A84C]" />
                    ) : (
                      <User className="h-4 w-4 text-[#C9A84C]" />
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 capitalize">
                      {party}
                    </span>
                  </div>
                  <p className="font-semibold text-[#1E3A5F] dark:text-white">{data.name || "—"}</p>
                  <p className="text-sm text-gray-500 mt-1">{data.address || "—"}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>{data.phone || "—"}</span>
                    <span>{data.email || "—"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Property Details */}
          {formData.property && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-[#C9A84C]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Property Details</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Type", value: formData.property.type },
                  { label: "Duration", value: `${formData.property.duration} months` },
                  { label: "Rent", value: `₹${parseInt(formData.property.rent || "0").toLocaleString("en-IN")}` },
                  { label: "Deposit", value: `₹${parseInt(formData.property.deposit || "0").toLocaleString("en-IN")}` },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="font-medium text-[#1E3A5F] dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms */}
          {formData.terms && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Special Terms</p>
              <p className="text-sm text-[#1E3A5F] dark:text-white">{formData.terms}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* Step 5: Generate / Result */
function GenerateStep({
  isGenerating,
  onGenerate,
}: {
  isGenerating: boolean;
  onGenerate: () => void;
}) {
  return (
    <Card className="border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <CardContent className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-[#C9A84C]/10 to-[#D4B96A]/10 border border-[#C9A84C]/20 mb-6">
            <Sparkles className="h-8 w-8 text-[#C9A84C]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1E3A5F] dark:text-white mb-2">
            Ready to Generate!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Our AI will create a professionally drafted legal document based on your inputs. 
            It will be compliant with Indian legal standards.
          </p>

          <div className="space-y-3 text-left mb-8">
            {[
              "AI-optimized legal language",
              "Indian law compliant clauses",
              "Multi-language support",
              "Editable after generation",
              "Available as PDF & DOCX",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            size="lg"
            className="w-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#D4B96A] text-[#1E3A5F] hover:from-[#D4B96A] hover:to-[#C9A84C] shadow-2xl shadow-[#C9A84C]/25 py-6 text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AI is Drafting Your Document...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Document Now
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* Generated Document View */
function GeneratedDocument() {
  return (
    <Card className="border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="h-6 w-6" />
          <h2 className="text-xl font-bold">Document Generated Successfully!</h2>
        </div>
        <p className="text-white/80 text-sm">
          Your rental agreement has been created. You can download, edit, or share it below.
        </p>
      </div>

      <CardContent className="p-8">
        {/* Document Preview */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 overflow-hidden mb-6">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rental Agreement Preview
              </span>
            </div>
            <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
              <Shield className="h-3 w-3 mr-1" />
              AI Verified
            </Badge>
          </div>

          {/* Document Content */}
          <div className="p-8 max-h-[500px] overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white mb-1">
                  RENTAL AGREEMENT
                </h1>
                <p className="text-gray-500 text-sm">
                  (Residential Property - Fixed Term)
                </p>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                This Rental Agreement (hereinafter referred to as the "Agreement") is made and entered 
                into on this ______ day of ______, 2026, by and between:
              </p>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Landlord / Lessor</p>
                  <p className="font-medium text-[#1E3A5F] dark:text-white">
                    MR. [LANDLORD NAME]
                  </p>
                  <p className="text-sm text-gray-500">
                    Son of [Father's Name], residing at [Address]
                  </p>
                  <p className="text-xs text-gray-400">(Hereinafter referred to as the "Lessor")</p>
                </div>

                <div className="text-center text-gray-400 text-sm">— AND —</div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tenant / Lessee</p>
                  <p className="font-medium text-[#1E3A5F] dark:text-white">
                    MR. [TENANT NAME]
                  </p>
                  <p className="text-sm text-gray-500">
                    Son of [Father's Name], residing at [Address]
                  </p>
                  <p className="text-xs text-gray-400">(Hereinafter referred to as the "Lessee")</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                WHEREAS the Lessor is the absolute owner and landlord of the property situated at:
              </p>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-700 mb-6">
                <p className="font-medium text-[#1E3A5F] dark:text-white">
                  [PROPERTY ADDRESS]
                </p>
                <p className="text-sm text-gray-500">
                  Property Type: [Residential/Commercial] · Area: [Area] sq. ft.
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <p><strong>1. TERM:</strong> This Agreement shall be for a period of [11] months commencing from [START DATE].</p>
                <p><strong>2. RENT:</strong> The Lessee shall pay a monthly rent of ₹[RENT AMOUNT].</p>
                <p><strong>3. DEPOSIT:</strong> An interest-free refundable security deposit of ₹[DEPOSIT AMOUNT] has been paid.</p>
                <p><strong>4. USE:</strong> The premises shall be used for residential purposes only.</p>
                <p><strong>5. MAINTENANCE:</strong> The Lessee shall maintain the premises in good condition.</p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-400 italic">
                  This is an AI-generated draft. Please consult a legal professional for final review.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button className="rounded-full bg-gradient-to-r from-[#1E3A5F] to-[#2A5A8F] hover:from-[#2A5A8F] hover:to-[#1E3A5F] text-white shadow-lg shadow-[#1E3A5F]/25">
            <Download className="mr-2 h-4 w-4" />
            Download as PDF
          </Button>
          <Button variant="outline" className="rounded-full border-gray-200 dark:border-gray-700">
            <FileSignature className="mr-2 h-4 w-4" />
            Request E-Signature
          </Button>
          <Button variant="outline" className="rounded-full border-gray-200 dark:border-gray-700">
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Document
          </Button>
          <Button variant="ghost" className="rounded-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="ghost" className="rounded-full">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
