variable "rds_instance_identifier" {
  description = "RDS instance identifier for monitoring"
  type        = string
}

variable "app_runner_service_name" {
  description = "App Runner service name for monitoring"
  type        = string
}

variable "alarm_email" {
  description = "Email address for alarm notifications"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
