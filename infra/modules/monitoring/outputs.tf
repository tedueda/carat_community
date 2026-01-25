output "sns_topic_arn" {
  description = "ARN of the SNS topic for alarms"
  value       = var.alarm_email != "" ? aws_sns_topic.alarms[0].arn : null
}

output "alarm_names" {
  description = "Names of created CloudWatch alarms"
  value = [
    aws_cloudwatch_metric_alarm.rds_cpu.alarm_name,
    aws_cloudwatch_metric_alarm.rds_connections.alarm_name,
    aws_cloudwatch_metric_alarm.rds_storage.alarm_name,
    aws_cloudwatch_metric_alarm.rds_read_latency.alarm_name,
    aws_cloudwatch_metric_alarm.rds_write_latency.alarm_name,
  ]
}
