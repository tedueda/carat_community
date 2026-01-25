# Carat - AWS App Runner Infrastructure

This directory contains Terraform infrastructure-as-code for deploying the Carat FastAPI backend to AWS App Runner with private RDS connectivity.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Deployment Steps](#deployment-steps)
- [Migration from Fly.io](#migration-from-flyio)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

### Components

- **AWS App Runner**: Hosts the containerized FastAPI application
- **Amazon ECR**: Private Docker image registry
- **AWS Secrets Manager**: Securely stores `DATABASE_URL`
- **VPC Connector**: Enables App Runner to access private RDS
- **RDS PostgreSQL**: Existing database (transitioned to private access)
- **CloudWatch**: Monitoring and alerting for RDS metrics
- **GitHub Actions**: CI/CD pipeline with OIDC authentication

### Network Flow

```
Internet → App Runner (Public) → VPC Connector → Private Subnets → RDS (Private)
```

### Security

- RDS security group allows inbound from App Runner ENI security group only
- No public access to RDS after migration
- Secrets stored in AWS Secrets Manager (not in environment variables)
- IAM roles follow principle of least privilege

## 📦 Prerequisites

### AWS Account Setup

1. **AWS CLI installed and configured**
   ```bash
   aws --version
   aws configure list
   aws sts get-caller-identity
   ```

2. **Terraform installed** (version >= 1.0)
   ```bash
   terraform version
   ```

3. **Required AWS permissions**
   - ECR: Create repositories, push images
   - App Runner: Create services, VPC connectors
   - IAM: Create roles and policies
   - Secrets Manager: Create and manage secrets
   - EC2: Manage security groups
   - CloudWatch: Create alarms and metrics

### GitHub OIDC Setup

You need to create an IAM OIDC provider and role for GitHub Actions.

1. **Create OIDC Provider** (one-time setup per AWS account)
   ```bash
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --client-id-list sts.amazonaws.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
   ```

2. **Create IAM Role for GitHub Actions**
   
   Create a file `github-actions-trust-policy.json`:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
         },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
           },
           "StringLike": {
             "token.actions.githubusercontent.com:sub": "repo:tedueda/rainbow_community:*"
           }
         }
       }
     ]
   }
   ```

   Create the role:
   ```bash
   aws iam create-role \
     --role-name GitHubActionsAppRunnerDeploy \
     --assume-role-policy-document file://github-actions-trust-policy.json
   ```

3. **Attach necessary policies**
   ```bash
   # ECR permissions
   aws iam attach-role-policy \
     --role-name GitHubActionsAppRunnerDeploy \
     --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser
   
   # App Runner permissions (create custom policy if needed)
   # See: https://docs.aws.amazon.com/apprunner/latest/dg/security_iam_service-with-iam.html
   ```

4. **Add role ARN to GitHub Secrets**
   - Go to GitHub repository → Settings → Secrets → Actions
   - Add secret: `AWS_OIDC_ROLE_ARN` = `arn:aws:iam::YOUR_ACCOUNT_ID:role/GitHubActionsAppRunnerDeploy`

## 🚀 Initial Setup

### 1. Configure Variables

Copy the example variables file:
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and update:
- `db_app_password`: Set your actual database password
- `github_oidc_role_arn`: Set the ARN from the previous step
- `alarm_email`: (Optional) Set your email for CloudWatch alerts

**⚠️ IMPORTANT**: Never commit `terraform.tfvars` with real credentials!

### 2. Initialize Terraform

```bash
terraform init
```

This will:
- Download required providers (AWS ~> 5.0)
- Initialize backend (local state by default)
- Prepare modules

### 3. Review the Plan

```bash
terraform plan
```

Review the resources that will be created:
- 1 ECR repository
- 1 App Runner service
- 1 VPC Connector
- 2 Security groups / rules
- 1 Secrets Manager secret
- 5 CloudWatch alarms
- Multiple IAM roles and policies

### 4. Apply Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This will take 5-10 minutes.

After completion, note the outputs:
```
ecr_repository_url        = "123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api"
app_runner_service_url    = "https://xxxxx.ap-northeast-1.awsapprunner.com"
database_url_secret_arn   = "arn:aws:secretsmanager:ap-northeast-1:..."
```

## 📤 Deployment Steps

### Initial Docker Image Push

Before App Runner can start, you need to push an initial Docker image:

```bash
# Get ECR repository URL from terraform output
ECR_REPO=$(terraform output -raw ecr_repository_url)

# Login to ECR
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin $ECR_REPO

# Build and push
cd ../backend
docker build -t $ECR_REPO:latest .
docker push $ECR_REPO:latest
```

### Automatic Deployments via GitHub Actions

After the initial push, GitHub Actions will handle all future deployments:

1. **Push to main branch**:
   ```bash
   git push origin main
   ```

2. **Create a version tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

The workflow will:
- Build the Docker image
- Push to ECR with appropriate tags
- App Runner auto-deploys (no manual step needed)

## 🔄 Migration from Fly.io

### Phase 1: Setup (Keep both environments running)

1. Apply Terraform with `enable_legacy_cidrs = true`
2. Push initial Docker image to ECR
3. Wait for App Runner to be healthy

### Phase 2: Verification

Test the new App Runner URL:

```bash
APP_URL=$(terraform output -raw app_runner_service_url)

# Test health endpoint
curl -i "$APP_URL/api/health"
# Expected: 200 OK with {"status":"ok","db":"ok"}

# Test posts endpoint
curl -i "$APP_URL/api/posts?limit=3"
# Expected: 200 OK with JSON array

# Test login
curl -i -X POST "$APP_URL/api/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=premium@test.com&password=premium123"
# Expected: 200 OK with access_token

# Test authenticated endpoint
TOKEN="<access_token_from_above>"
curl -i "$APP_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK with user info
```

### Phase 3: Update Frontend

Update your frontend `.env` file:
```bash
VITE_API_URL=https://xxxxx.ap-northeast-1.awsapprunner.com
```

Test the frontend thoroughly:
- User login
- Post creation/editing
- Comments and reactions
- Profile updates

### Phase 4: Remove Legacy Access

Once App Runner is verified working:

1. Update `terraform.tfvars`:
   ```hcl
   enable_legacy_cidrs = false
   ```

2. Apply changes:
   ```bash
   terraform apply
   ```

This removes the legacy CIDR rules from the RDS security group.

### Phase 5: Make RDS Private

⚠️ **ONLY do this after Phase 4 is complete and verified**

1. In AWS Console → RDS → Modify `rainbow-community-db-tokyo`
2. Set "Public accessibility" to "No"
3. Apply immediately or during maintenance window
4. Verify App Runner still works

### Phase 6: Decommission Fly.io

1. Stop the Fly.io app:
   ```bash
   flyctl apps stop rainbow-community
   ```

2. Monitor for 24-48 hours to ensure no issues

3. Delete the Fly.io app:
   ```bash
   flyctl apps destroy rainbow-community
   ```

## 🔙 Rollback Procedures

### Quick Rollback to Fly.io

If App Runner has issues:

1. **Restore RDS public access** (if removed):
   ```bash
   # In AWS Console: RDS → Modify → Public accessibility = Yes
   ```

2. **Re-add legacy CIDR rules**:
   ```hcl
   # terraform.tfvars
   enable_legacy_cidrs = true
   ```
   ```bash
   terraform apply
   ```

3. **Restart Fly.io app**:
   ```bash
   flyctl apps start rainbow-community
   ```

4. **Update frontend** to point back to Fly.io:
   ```bash
   VITE_API_URL=https://app-rosqqdae.fly.dev
   ```

### Rollback Docker Image

App Runner tracks deployment history. To rollback:

```bash
# List recent operations
SERVICE_ARN=$(terraform output -raw app_runner_service_arn)
aws apprunner list-operations \
  --service-arn $SERVICE_ARN \
  --region ap-northeast-1

# Manually push a previous image tag
docker pull $ECR_REPO:v1.0.0
docker tag $ECR_REPO:v1.0.0 $ECR_REPO:latest
docker push $ECR_REPO:latest
```

### Complete Infrastructure Teardown

⚠️ **This will delete all App Runner resources**

```bash
terraform destroy
```

Note: This will NOT delete:
- The RDS instance
- Existing VPC/subnets
- GitHub OIDC provider

## 📊 Monitoring

### CloudWatch Alarms

The following alarms are automatically created:

1. **RDS High CPU** (threshold: 80%)
2. **RDS High Connections** (threshold: 80 connections)
3. **RDS Low Storage** (threshold: 5 GB free)
4. **RDS High Read Latency** (threshold: 100ms)
5. **RDS High Write Latency** (threshold: 100ms)

If you provided an `alarm_email`, you'll receive SNS notifications.

### Viewing Logs

**App Runner logs**:
```bash
aws logs tail /aws/apprunner/rainbow-community-api/service \
  --follow \
  --region ap-northeast-1
```

**RDS logs** (if enabled):
```bash
aws rds describe-db-log-files \
  --db-instance-identifier rainbow-community-db-tokyo \
  --region ap-northeast-1
```

### Metrics Dashboard

View in AWS Console:
- App Runner → Services → rainbow-community-api → Metrics
- RDS → Databases → rainbow-community-db-tokyo → Monitoring
- CloudWatch → Dashboards (create custom dashboard)

## 🐛 Troubleshooting

### App Runner fails to start

**Check logs**:
```bash
aws logs tail /aws/apprunner/rainbow-community-api/service --region ap-northeast-1
```

**Common issues**:
- Migration failure: Check Alembic version compatibility
- Database connection: Verify DATABASE_URL secret is correct
- Container crash: Check application logs for errors

### Database connection timeout

**Verify connectivity**:
1. Check VPC Connector is attached to App Runner
2. Verify security group rules allow traffic
3. Confirm subnets have route to RDS
4. Test with a debug container

**Debug container**:
```bash
# Deploy a debug container to test connectivity
docker run -it --rm \
  -e DATABASE_URL="postgresql://..." \
  ubuntu:latest \
  bash -c "apt-get update && apt-get install -y postgresql-client && psql $DATABASE_URL -c 'SELECT 1'"
```

### Migration fails on deployment

**Manual migration**:
```bash
# Connect to a running container (if possible) or run locally:
cd backend
poetry install
export DATABASE_URL="postgresql://..."
alembic upgrade head
```

**Skip migration** (temporary workaround):
Comment out the migration code in `start.sh` and redeploy.

### High costs

**Optimize**:
- Reduce CPU/memory if underutilized
- Use auto-pause for non-production environments
- Review ECR image retention policy
- Consider reserved capacity for stable workloads

## 📚 Additional Resources

- [AWS App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [FastAPI Deployment Best Practices](https://fastapi.tiangolo.com/deployment/)

## 🆘 Support

If you encounter issues:

1. Check CloudWatch logs
2. Review this troubleshooting guide
3. Verify all prerequisites are met
4. Check AWS service health dashboard
5. Contact the development team

---

**Last Updated**: 2025-10-03  
**Maintained By**: Carat Team
