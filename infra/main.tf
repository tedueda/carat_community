locals {
  service_name = var.app_runner_service_name
  common_tags = {
    Service = local.service_name
  }
}

# --- ECR: コンテナイメージの置き場 ---
module "ecr" {
  source = "./modules/ecr"

  repository_name = var.ecr_repo_name
  tags            = local.common_tags
}

# --- Network: SG など（RDS への到達許可を含む）---
module "network" {
  source = "./modules/network"

  vpc_id                = var.vpc_id
  rds_security_group_id = var.rds_security_group_id
  rds_port              = var.rds_port
  enable_legacy_cidrs   = var.enable_legacy_cidrs
  legacy_cidrs          = var.legacy_cidrs
  service_name          = local.service_name
  tags                  = local.common_tags
}

# --- Secrets: アプリが使う DB 接続情報（Secrets Manager）---
module "secrets" {
  source = "./modules/secrets"

  # 例: postgresql+psycopg2://user:pass@host:5432/dbname?sslmode=require
  database_url = "postgresql+psycopg2://${var.db_app_user}:${var.db_app_password}@${var.rds_endpoint}:${var.rds_port}/${var.database_name}?sslmode=require"
  service_name = local.service_name
  tags         = local.common_tags
}

# =========================
# App Runner は大阪未サポートのため一時停止
# 将来、東京リージョンへ移す／または ECS/Fargate に置換予定
# =========================
# module "apprunner" {
#   source = "./modules/apprunner"
#
#   service_name            = local.service_name
#   ecr_repository_url      = module.ecr.repository_url
#   vpc_id                  = var.vpc_id
#   private_subnet_ids      = var.private_subnet_ids
#   security_group_id       = module.network.app_runner_security_group_id
#   database_url_secret_arn = module.secrets.database_url_secret_arn
#   container_port          = var.container_port
#   health_check_path       = var.health_check_path
#   cpu                     = var.cpu
#   memory                  = var.memory
#   service_env             = var.service_env
#   tags                    = local.common_tags
#
#   depends_on = [
#     module.network,
#     module.secrets
#   ]
# }

# =========================
# Monitoring（App Runner 連動部分）も一旦停止
# ※ ECS/Fargate 版を入れるときに再接続します
# =========================
# module "monitoring" {
#   source = "./modules/monitoring"
#
#   rds_instance_identifier = split(".", var.rds_endpoint)[0]
#   app_runner_service_name = local.service_name
#   alarm_email             = var.alarm_email
#   tags                    = local.common_tags
#
#   depends_on = [
#     module.apprunner
#   ]
# }
