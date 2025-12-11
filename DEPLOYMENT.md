# Backend Deployment Guide (AWS EC2)

Simple deployment guide for Skitt Backend on AWS EC2 Free Tier.

## Prerequisites

1. **EC2 Instance** (t2.micro, Amazon Linux 2023)
2. **RDS PostgreSQL** (db.t2.micro) - See setup instructions below
3. **Docker** installed on EC2

## Step 1: Setup EC2 Instance

SSH into your EC2 instance and install Docker:

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install -y git

# Log out and back in for Docker group changes
exit
```

## Step 2: Create RDS PostgreSQL Database

1. Go to **AWS Console → RDS → Create Database**
2. Choose **PostgreSQL**
3. Select **Free tier** template
4. Settings:
   - **DB instance identifier**: `skitt-db`
   - **Master username**: `skitt_admin`
   - **Master password**: (choose a strong password)
   - **DB name**: `skitt_db`
5. Instance configuration:
   - **DB instance class**: `db.t2.micro` (free tier)
   - **Storage**: 20 GB (free tier)
6. Connectivity:
   - **VPC**: Same as EC2 instance
   - **Public access**: No (private subnet recommended)
   - **VPC security group**: Create new
   - **Database port**: 5432
7. Create database

**Important**: Note the RDS endpoint (e.g., `skitt-db.xxxxx.eu-north-1.rds.amazonaws.com`)

## Step 3: Configure RDS Security Group

1. Go to **RDS → Your database → Connectivity & security**
2. Click on the **VPC security group**
3. Add inbound rule:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: EC2 security group (select your EC2 instance's security group)

## Step 4: Configure EC2 Security Group

1. Go to **EC2 → Security Groups → Your EC2 security group**
2. Add inbound rules:
   - **SSH (22)**: Your IP only
   - **Custom TCP (3001)**: 0.0.0.0/0 (or your IP for security)

## Step 5: Deploy Backend

1. Clone repository:
   ```bash
   cd /home/ec2-user
   git clone <your-repository-url> skitt
   cd skitt/backend
   ```

2. Create `.env` file:
   ```bash
   nano .env
   ```

3. Add the following content to `.env` with your RDS credentials:
   ```env
   PORT=3001
   NODE_ENV=production
   DB_HOST=skitt-db.xxxxx.eu-north-1.rds.amazonaws.com
   DB_PORT=5432
   DB_NAME=skitt_db
   DB_USER=skitt_admin
   DB_PASSWORD=your-secure-password
   ```

   **Note**: Replace `skitt-db.xxxxx.eu-north-1.rds.amazonaws.com` with your actual RDS endpoint and set a secure password.

4. Deploy:
   ```bash
   chmod +x deploy-ec2.sh
   ./deploy-ec2.sh
   ```

   Or manually:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Step 6: Verify Deployment

```bash
# Check health
curl http://localhost:3001/health

# Check API
curl http://localhost:3001/api/flags

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

Access from browser:
- **API**: `http://your-ec2-public-ip:3001/api/flags`
- **API Docs**: `http://your-ec2-public-ip:3001/api-docs`
- **Health**: `http://your-ec2-public-ip:3001/health`

## Maintenance

### View logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart service
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Update application
```bash
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Stop service
```bash
docker-compose -f docker-compose.prod.yml down
```

## Troubleshooting

### Cannot connect to database
- Check RDS security group allows EC2 security group
- Verify DB_HOST in .env matches RDS endpoint
- Check RDS is in same VPC as EC2

### Container not starting
- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- Verify .env file has correct values
- Ensure Docker is running: `sudo systemctl status docker`

### Port already in use
- Check what's using the port: `sudo lsof -i :3001`
- Stop conflicting services or change port in docker-compose.prod.yml
