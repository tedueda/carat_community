output "service_url" {
  description = "URL of the App Runner service"
  value       = "https://${aws_apprunner_service.main.service_url}"
}

output "service_arn" {
  description = "ARN of the App Runner service"
  value       = aws_apprunner_service.main.arn
}

output "service_id" {
  description = "ID of the App Runner service"
  value       = aws_apprunner_service.main.service_id
}

output "service_status" {
  description = "Status of the App Runner service"
  value       = aws_apprunner_service.main.status
}

output "vpc_connector_arn" {
  description = "ARN of the VPC Connector"
  value       = aws_apprunner_vpc_connector.main.arn
}

output "instance_role_arn" {
  description = "ARN of the instance IAM role"
  value       = aws_iam_role.instance.arn
}

output "access_role_arn" {
  description = "ARN of the access IAM role"
  value       = aws_iam_role.access.arn
}
