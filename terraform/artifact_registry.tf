resource "google_artifact_registry_repository" "todo_frontend" {
  location      = var.region
  repository_id = "todo-frontend-repo"
  description   = "Docker repository for Todo frontend API images"
  format        = "DOCKER"

  depends_on = [google_project_service.artifact_registry]
}