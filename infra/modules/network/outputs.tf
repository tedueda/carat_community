output "app_runner_security_group_id" {
  description = "Security group ID for App Runner ENI"
  value       = aws_security_group.app_runner_eni.id
}

output "app_runner_security_group_name" {
  description = "Security group name for App Runner ENI"
  value       = aws_security_group.app_runner_eni.name
}
