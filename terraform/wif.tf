# Fetch existing Project Number dynamically
data "google_project" "project" {
  project_id = var.project_id
}

# 1. Dedicated Service Account for Frontend CI/CD
resource "google_service_account" "frontend_deployer" {
  account_id   = "frontend-deployer-sa"
  display_name = "GitHub Actions Frontend Deployer"
}

# 2. Bind the Frontend GitHub Repo to the Existing WIF Pool
# TODO: Make the "github-actions-pool-v2" part dynamic
resource "google_service_account_iam_member" "wif_sa_binding" {
  service_account_id = google_service_account.frontend_deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/github-actions-pool-v2/attribute.repository/${var.github_repository}"
}

# 3. Grant Image Push Permissions to Artifact Registry
resource "google_project_iam_member" "gar_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.frontend_deployer.email}"
}

# 4. Grant Deployment Permissions to GKE Cluster
resource "google_project_iam_member" "gke_developer" {
  project = var.project_id
  role    = "roles/container.developer"
  member  = "serviceAccount:${google_service_account.frontend_deployer.email}"
}

#5. Grant Storage Object User permissions for Terraform GCS remote state
resource "google_project_iam_member" "gcs_state_user" {
  project = var.project_id
  role    = "roles/storage.objectUser"
  member  = "serviceAccount:${google_service_account.frontend_deployer.email}"
}