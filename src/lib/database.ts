// Database connection and query utilities
// This will work with any SQL database (PostgreSQL, MySQL, SQLite)

export interface User {
  id: number
  email: string
  name: string
  password_hash: string
  created_at: string
  updated_at: string
}

export interface Form {
  id: number
  user_id: number
  status?: number
  state?: number
  title: string
  description: string | null
  is_published: boolean
  allow_multiple_responses: boolean
  collect_email: boolean
  created_at: string
  updated_at: string
  author_img?: string
  author_name?: string
  settings?: {
    allow_multiple_responses: boolean,
    collect_email: boolean,
    show_progress_bar: boolean,
    confirmation_message: string
  }
  fields: any,
  totalResponse?: number
}


export interface FormField {
  id: number
  form_id: number
  field_type: "text" | "textarea" | "select" | "radio" | "checkbox" | "email" | "number" | "date" | "file" | "rating"
  label: string
  placeholder: string | null
  is_required: boolean
  options: string[] | null
  field_order: number
  file_max_size?: number // in MB
  file_max_count?: number
  file_allowed_types?: string[]
  rating_max?: number // maximum number of stars
  created_at: string
}

export interface FormResponse {
  id: number
  form_id: number
  respondent_email: string | null
  submitted_at: string
}

export interface FormResponseAnswer {
  id: number
  response_id: number
  field_id: number
  answer_text: string | null
  answer_json: any
  created_at: string
}

// Database query functions (implement based on your chosen database)
export class DatabaseService {
  // These methods should be implemented with your chosen database client
  // Examples: pg for PostgreSQL, mysql2 for MySQL, better-sqlite3 for SQLite

  static async getForms(userId: number): Promise<Form[]> {
    // Implementation depends on your database client
    throw new Error("Database client not configured. Please set up your preferred SQL database.")
  }

  static async getFormById(formId: number): Promise<Form | null> {
    throw new Error("Database client not configured. Please set up your preferred SQL database.")
  }

  static async getFormFields(formId: number): Promise<FormField[]> {
    throw new Error("Database client not configured. Please set up your preferred SQL database.")
  }

  static async createForm(formData: Omit<Form, "id" | "created_at" | "updated_at">): Promise<Form> {
    throw new Error("Database client not configured. Please set up your preferred SQL database.")
  }

  static async createFormField(fieldData: Omit<FormField, "id" | "created_at">): Promise<FormField> {
    throw new Error("Database client not configured. Please set up your preferred SQL database.")
  }

  static async submitFormResponse(
    formId: number,
    answers: { field_id: number; answer_text?: string; answer_json?: any }[],
    respondentEmail?: string,
  ): Promise<FormResponse> {
    throw new Error("Database client not configured. Please set up your preferred SQL database.")
  }

  static async getFormResponses(formId: number): Promise<(FormResponse & { answers: FormResponseAnswer[] })[]> {
    throw new Error("Database client not configured. Please set up your preferred SQL database.")
  }

  static async updateForm(formId: number, updates: Partial<Form>): Promise<Form> {
    throw new Error("Database client not configured. Please set up your preferred SQL database.")
  }

  static async deleteForm(formId: number): Promise<void> {
    throw new Error("Database client not configured. Please set up your preferred SQL database.")
  }
}
