// Type for individual form fields
export interface PublishedFormField {
  id?: number
  field_type: string | number
  label: string
  placeholder: string
  is_required: number | boolean
  options?: string
  field_order: number
  rating_max?: number
  file_allowed_types?: string 
  file_max_count?: number
  file_max_size?: number
}

// Type for the whole form
export interface PublishedForm {
  id?: number
  user_id: number
  title: string
  description: string
  is_published: number 
  form_fields: PublishedFormField[]
}
