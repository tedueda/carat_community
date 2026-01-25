variable "service_name" {
  description = "Name of the App Runner service"
  type        = string
}

variable "ecr_repository_url" {
  description = "URL of the ECR repository"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for the VPC Connector"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for VPC Connector"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for App Runner ENI"
  type        = string
}

variable "database_url_secret_arn" {
  description = "ARN of the DATABASE_URL secret in Secrets Manager"
  type        = string
}

variable "container_port" {
  description = "Port the container exposes"
  type        = number
  default     = 8000
}

variable "health_check_path" {
  description = "Health check endpoint path"
  type        = string
  default     = "/api/health"
}

variable "cpu" {
  description = "CPU units for App Runner"
  type        = number
  default     = 1024
}

variable "memory" {
  description = "Memory in MB for App Runner"
  type        = number
  default     = 2048
}

variable "service_env" {
  description = "Additional environment variables"
  type        = map(string)
  default     = {}
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
