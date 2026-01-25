resource "aws_secretsmanager_secret" "database_url" {
  name_prefix             = "${var.service_name}-database-url-"
  description             = "Database connection URL for ${var.service_name}"
  recovery_window_in_days = 7

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = var.database_url
}
