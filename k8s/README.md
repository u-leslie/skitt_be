# Kubernetes Backend Deployment Files

## 📋 Core Files (Required)

### 1. **namespace.yaml** ✅
**Purpose:** Creates a Kubernetes namespace to isolate resources
- Creates `skitt-prod` namespace
- Used by: `deploy.sh`

### 2. **configmap.yaml** ✅
**Purpose:** Stores non-sensitive configuration (environment variables)
- Contains: `NODE_ENV`, `PORT`, `API_BASE_URL`
- Used by: `deployment.yaml` (injected as env vars)
- Used by: `deploy.sh`

### 3. **secret.yaml** / **secret-local.yaml** ✅
**Purpose:** Stores sensitive data (database credentials)
- Contains: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `secret.yaml` = For AWS RDS (production)
- `secret-local.yaml` = For local PostgreSQL (testing)
- Used by: `deployment.yaml` (injected as env vars)
- Used by: `deploy.sh`
- ⚠️ **NOT committed to git** (in `.gitignore`)

### 4. **deployment.yaml** ✅
**Purpose:** Defines how to run your backend pods
- Container image, replicas (2), resource limits
- Environment variables from ConfigMap & Secrets
- Health checks (liveness & readiness probes)
- Used by: `deploy.sh`

### 5. **service.yaml** ✅
**Purpose:** Exposes backend pods internally in Kubernetes
- Creates ClusterIP service on port 3001
- Allows other pods to reach backend via `skitt-backend-service:3001`
- Used by: `deploy.sh`

### 6. **hpa.yaml** ✅
**Purpose:** Automatically scales pods based on CPU/memory usage
- Min: 2 pods, Max: 10 pods
- Scales when CPU > 70% or Memory > 80%
- Used by: `deploy.sh`

## 🔧 Scripts

### 7. **deploy.sh** ✅
**Purpose:** Main deployment script
- Applies all YAML files in correct order
- Waits for deployment to be ready
- Usage: `./k8s/deploy.sh`

### 8. **build-and-deploy.sh** ✅
**Purpose:** Builds Docker image then deploys
- Builds `skitt-backend:latest` image
- Calls `deploy.sh` to deploy
- Usage: `./k8s/build-and-deploy.sh`

## 📝 Optional Files

### 9. **postgres-local.yaml** ⚠️ (Optional - Local Testing)
**Purpose:** Deploys PostgreSQL database in Kubernetes for local testing
- Only needed when testing locally (Docker Desktop)
- Not used in `deploy.sh` (apply separately: `kubectl apply -f postgres-local.yaml`)
- **Status:** Keep for local development

## 📚 Example Files (Templates)

### 10. **secret.yaml.example** ✅
**Purpose:** Template for AWS RDS secrets
- Copy to `secret.yaml` and fill in your RDS credentials
- **Status:** Keep (useful reference)

### 12. **secret-local.yaml.example** ✅
**Purpose:** Template for local PostgreSQL secrets
- Copy to `secret-local.yaml` for local testing
- **Status:** Keep (useful reference)

---


## 📦 Deployment Flow

```
build-and-deploy.sh
    ↓
1. Build Docker image
    ↓
2. deploy.sh
    ↓
3. Apply namespace.yaml
    ↓
4. Apply configmap.yaml
    ↓
5. Apply secret.yaml (or secret-local.yaml)
    ↓
6. Apply deployment.yaml
    ↓
7. Apply service.yaml
    ↓
8. Apply hpa.yaml
    ↓
9. Wait for pods to be ready
```
