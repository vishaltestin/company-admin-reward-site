export type FieldType = "text" | "select" | "date"

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  options?: { label: string; value: string }[]
  placeholder?: string
}

// Reusable options to keep the config clean
const relationIntensityOptions = [
  { label: "High", value: "High" },
  { label: "Neutral", value: "Neutral" },
  { label: "Low", value: "Low" },
]

const statusOptions = [
  { label: "Done", value: "Done" },
  { label: "Pending", value: "Pending" },
]

const incomeOptions = [
  { label: "Below 5L", value: "Below 5L" },
  { label: "5L-10L", value: "5L-10L" },
  { label: "10L-20L", value: "10L-20L" },
  { label: "20L-50L", value: "20L-50L" },
  { label: "Above 50L", value: "Above 50L" },
]

const requirementOptions = [
  { label: "Immediately", value: "Immediately" },
  { label: "Within 3 months", value: "Within 3 months" },
  { label: "After 3 months", value: "After 3 months" },
]

const seniorityOptions = [
  { label: "Executive", value: "Executive" },
  { label: "Senior", value: "Senior" },
  { label: "Mid-level", value: "Mid-level" },
  { label: "Junior", value: "Junior" },
  { label: "Intern", value: "Intern" },
]

// EXACT MATCHES TO YOUR LEGACY CODE
export const VERTICAL_FIELDS: Record<string, FieldConfig[]> = {
  "internal-employees": [
    { name: "companyName", label: "Company Name", type: "text" },
    {
      name: "department",
      label: "Department",
      type: "select",
      options: [
        { label: "HR", value: "HR" },
        { label: "Sales", value: "Sales" },
        { label: "Marketing", value: "Marketing" },
        { label: "Admin / Operations", value: "Admin / Operations" },
        { label: "C-Suite", value: "C-Suite" },
        { label: "Others", value: "Others" },
      ],
    },
    {
      name: "job_seniorities",
      label: "Job Seniorities",
      type: "select",
      options: seniorityOptions,
    },
    { name: "job_title", label: "Job Title", type: "text" },
    { name: "location", label: "Location", type: "text" },
    {
      name: "workforce_type",
      label: "Workforce Type",
      type: "select",
      options: [
        { label: "Full Time", value: "Full Time" },
        { label: "Part-Time", value: "Part-Time" },
        { label: "Contract", value: "Contract" },
      ],
    },
    {
      name: "job_mode",
      label: "Job Mode",
      type: "select",
      options: [
        { label: "In-Office", value: "In-Office" },
        { label: "Remote", value: "Remote" },
        { label: "Hybrid", value: "Hybrid" },
      ],
    },
    { name: "date_joining", label: "Date of Joining", type: "date" },
    {
      name: "any_specific_milestone",
      label: "Specific Milestone",
      type: "text",
    },
    {
      name: "any_specific_milestone_date",
      label: "Milestone Date",
      type: "date",
    },
    { name: "birth_date", label: "Birth Date", type: "date" },
    { name: "anniversary_date", label: "Anniversary Date", type: "date" },
    { name: "retirement_day", label: "Retirement Date", type: "date" },
  ],

  "external-client": [
    { name: "companyName", label: "Company Name", type: "text" },
    { name: "industry", label: "Industry", type: "text" },
    {
      name: "job_seniorities",
      label: "Job Seniorities",
      type: "select",
      options: seniorityOptions,
    },
    { name: "job_title", label: "Job Title", type: "text" },
    { name: "location", label: "HQ Location", type: "text" },
    {
      name: "relation_intensity",
      label: "Relation Intensity",
      type: "select",
      options: relationIntensityOptions,
    },
    {
      name: "customer_status",
      label: "Status",
      type: "select",
      options: [
        { label: "Customer", value: "Customer" },
        { label: "Prospect", value: "Prospect" },
      ],
    },
    {
      name: "segment",
      label: "Segment",
      type: "select",
      options: [
        { label: "Top N", value: "Top N" },
        { label: "NextN", value: "NextN" },
        { label: "Coverage", value: "Coverage" },
      ],
    },
    { name: "date_onboarding", label: "Date of Onboarding", type: "date" },
    { name: "birth_date", label: "Birth Date", type: "date" },
    { name: "anniversary_date", label: "Anniversary Date", type: "date" },
  ],

  "auto-dealers-distributors": [
    { name: "companyName", label: "Company Name", type: "text" },
    { name: "city", label: "City", type: "text" },
    { name: "state", label: "State", type: "text" },
    {
      name: "relation_intensity",
      label: "Relation Intensity",
      type: "select",
      options: relationIntensityOptions,
    },
    {
      name: "store_visit",
      label: "Store Visit",
      type: "select",
      options: statusOptions,
    },
    { name: "preferred_vehicle", label: "Preferred Vehicle", type: "text" },
    {
      name: "testDrive",
      label: "Test Drive",
      type: "select",
      options: statusOptions,
    },
    {
      name: "purchase",
      label: "Purchase Status",
      type: "select",
      options: statusOptions,
    },
    { name: "date_of_purchase", label: "Date of Purchase", type: "date" },
    { name: "service_due_date", label: "Service Due Date", type: "date" },
    { name: "insurance_due_date", label: "Insurance Due Date", type: "date" },
    {
      name: "occupation",
      label: "Occupation",
      type: "select",
      options: [
        { label: "Service", value: "Service" },
        { label: "Business", value: "Business" },
      ],
    },
    {
      name: "annual_income_level",
      label: "Annual Income",
      type: "select",
      options: incomeOptions,
    },
    {
      name: "requirement",
      label: "Requirement Timeline",
      type: "select",
      options: requirementOptions,
    },
  ],

  "real-estate": [
    { name: "companyName", label: "Company Name", type: "text" },
    { name: "city", label: "City", type: "text" },
    { name: "state", label: "State", type: "text" },
    {
      name: "property_type",
      label: "Property Type",
      type: "select",
      options: [
        { label: "Residential", value: "Residential" },
        { label: "Commercial", value: "Commercial" },
      ],
    },
    {
      name: "property_shortlisted",
      label: "Property Shortlisted",
      type: "text",
    },
    {
      name: "site_visit_request",
      label: "Site Visit Request",
      type: "select",
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
    },
    {
      name: "site_visit",
      label: "Site Visit",
      type: "select",
      options: statusOptions,
    },
    {
      name: "purchase",
      label: "Purchase",
      type: "select",
      options: statusOptions,
    },
    { name: "date_of_purchase", label: "Date of Purchase", type: "date" },
    { name: "registry_due_date", label: "Registry Due Date", type: "date" },
    { name: "possession_due_date", label: "Possession Due Date", type: "date" },
    {
      name: "annual_income_level",
      label: "Annual Income",
      type: "select",
      options: incomeOptions,
    },
    {
      name: "requirement",
      label: "Requirement Timeline",
      type: "select",
      options: requirementOptions,
    },
  ],

  "channel-partners": [
    {
      name: "channel_partner_name",
      label: "Channel Partner Name",
      type: "text",
    },
    { name: "industry", label: "Industry", type: "text" },
    { name: "location", label: "Location", type: "text" },
    {
      name: "partner_status",
      label: "Partner Status",
      type: "select",
      options: [
        { label: "Onboarded", value: "Onboarded" },
        { label: "To be Onboarded", value: "To be Onboarded" },
      ],
    },
    { name: "date_onboarding", label: "Date of Onboarding", type: "date" },
  ],
}
