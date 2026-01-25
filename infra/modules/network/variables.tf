variable "vpc_id" {
  description = "VPC ID where resources will be created"
  type        = string
}

variable "rds_security_group_id" {
  description = "Security group ID of the RDS instance"
  type        = string
}

variable "rds_port" {
  description = "RDS PostgreSQL port"
  type        = number
  default     = 5432
}

variable "enable_legacy_cidrs" {
  description = "Enable legacy CIDR-based access to RDS"
  type        = bool
  default     = true
}

variable "legacy_cidrs" {
  description = "Legacy CIDR blocks for RDS access"
  type        = list(string)
  default     = []
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
