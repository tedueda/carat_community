variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "service_name" {
  description = "Name of the service"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
