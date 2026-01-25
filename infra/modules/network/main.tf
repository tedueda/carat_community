resource "aws_security_group" "app_runner_eni" {
  name_prefix = "app-runner-eni-"
  description = "Security group for App Runner VPC Connector ENI"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.service_name}-app-runner-eni"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group_rule" "rds_from_app_runner" {
  type                     = "ingress"
  from_port                = var.rds_port
  to_port                  = var.rds_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.app_runner_eni.id
  security_group_id        = var.rds_security_group_id
  description              = "Allow App Runner to access RDS"
}

resource "aws_security_group_rule" "rds_from_legacy_cidrs" {
  count = var.enable_legacy_cidrs ? length(var.legacy_cidrs) : 0

  type              = "ingress"
  from_port         = var.rds_port
  to_port           = var.rds_port
  protocol          = "tcp"
  cidr_blocks       = [var.legacy_cidrs[count.index]]
  security_group_id = var.rds_security_group_id
  description       = "Legacy CIDR access - ${var.legacy_cidrs[count.index]}"
}
