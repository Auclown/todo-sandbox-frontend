output "frontend_registry_url" {
  description = "Artifact Registry Docker URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.todo_frontend.name}"
}

output "frontend_sa_email" {
  description = "Service Account email for GitHub Actions"
  value       = google_service_account.frontend_deployer.email
}