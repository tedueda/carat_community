variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-northeast-1"
}

variable "vpc_id" {
  description = "Existing VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for App Runner VPC Connector"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "Existing RDS security group ID"
  type        = string
}

variable "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  type        = string
}

variable "rds_port" {
  description = "RDS PostgreSQL port"
  type        = number
  default     = 5432
}

variable "db_app_user" {
  description = "Database application user"
  type        = string
  sensitive   = true
}

variable "db_app_password" {
  description = "Database application user password"
  type        = string
  sensitive   = true
}

variable "database_name" {
  description = "Database name"
  type        = string
}

variable "app_runner_service_name" {
  description = "Name for the App Runner service"
  type        = string
}

variable "ecr_repo_name" {
  description = "Name for the ECR repository"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository in format owner/repo"
  type        = string
}

variable "github_oidc_role_arn" {
  description = "ARN of the GitHub OIDC IAM role for CI/CD"
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
  description = "CPU units for App Runner (1024 = 1 vCPU)"
  type        = number
  default     = 1024
}

variable "memory" {
  description = "Memory in MB for App Runner"
  type        = number
  default     = 2048
}

variable "desired_count" {
  description = "Desired number of App Runner instances"
  type        = number
  default     = 1
}

variable "enable_legacy_cidrs" {
  description = "Enable legacy CIDR-based access to RDS (for gradual migration)"
  type        = bool
  default     = true
}

variable "legacy_cidrs" {
  description = "Legacy CIDR blocks for RDS access (to be removed after migration)"
  type        = list(string)
  default     = []
}

variable "dockerfile_path" {
  description = "Path to Dockerfile within the repository"
  type        = string
  default     = "backend/Dockerfile"
}

variable "service_env" {
  description = "Additional environment variables for the service"
  type        = map(string)
  default     = {}
}

variable "alarm_email" {
  description = "Email address for CloudWatch alarm notifications"
  type        = string
  default     = ""
}
