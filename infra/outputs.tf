output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = module.ecr.repository_url
}

# --- App Runner は大阪リージョンで未サポートのため一時的にコメントアウト ---
# output "app_runner_service_url" {
#   description = "URL of the App Runner service"
#   value       = module.apprunner.service_url
# }

# output "app_runner_service_arn" {
#   description = "ARN of the App Runner service"
#   value       = module.apprunner.service_arn
# }
# ---------------------------------------------------------------------

output "database_url_secret_arn" {
  description = "ARN of the DATABASE_URL secret in Secrets Manager"
  value       = module.secrets.database_url_secret_arn
}

output "app_runner_security_group_id" {
  description = "Security group ID for App Runner ENI"
  value       = module.network.app_runner_security_group_id
}

# --- VPC Connector も App Runner 依存なので一旦コメントアウト ---
# output "vpc_connector_arn" {
#   description = "ARN of the VPC Connector"
#   value       = module.apprunner.vpc_connector_arn
# }
# ---------------------------------------------------------------------
