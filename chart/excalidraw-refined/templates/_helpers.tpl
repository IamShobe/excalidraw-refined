{{/*
Expand the name of the chart.
*/}}
{{- define "excalidraw-refined.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "excalidraw-refined.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "excalidraw-refined.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "excalidraw-refined.labels" -}}
helm.sh/chart: {{ include "excalidraw-refined.chart" . }}
{{ include "excalidraw-refined.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Values.tag | default .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "excalidraw-refined.selectorLabels" -}}
app.kubernetes.io/name: {{ include "excalidraw-refined.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "excalidraw-refined.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "excalidraw-refined.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the secret to db to use
*/}}
{{- define "excalidraw-refined.dbSecretName" -}}
{{- default (include "excalidraw-refined.fullname" .) .Values.dbSecret.name }}
{{- end }}

{{- define "excalidraw-refined.dbSecretKey" -}}
{{- default "DB_URL" .Values.dbSecret.key }}
{{- end }}
